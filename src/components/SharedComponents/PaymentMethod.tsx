import React, { useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { getFirestore, collection, addDoc, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase/config';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const db = getFirestore(app);

interface PaymentMethodProps {
    customerName: string;
    customerEmail: string;
    selectedDate: Date | null;
    selectedTimeSlot: string;
    servicePrice: number;
    serviceName: string;
    serviceId: string;
    merchantId: string;
    onClose: () => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
    customerName,
    customerEmail,
    selectedDate,
    selectedTimeSlot,
    servicePrice,
    serviceName,
    serviceId,
    merchantId,
    onClose,
}) => {
    const [errorMessage, setErrorMessage] = useState('');

    const updateMerchantBalance = async () => {
        const merchantRef = doc(db, 'merchantBalances', merchantId);
        const merchantDoc = await getDoc(merchantRef);

        if (merchantDoc.exists()) {
            // Update pending balance instead of available balance for new payments
            await updateDoc(merchantRef, {
                pendingBalance: increment(servicePrice), // Increase pending balance
                lastUpdated: new Date(), // Update the lastUpdated timestamp
            });
            console.log(`Updated pending balance for merchant ID: ${merchantId}`);
        } else {
            console.error("Merchant balance document not found.");
        }
    };

    const handlePaymentSuccess = async (details: any) => {
        const payerName = details.payer?.name
            ? `${details.payer.name.given_name} ${details.payer.name.surname}`
            : 'Unknown Payer';
        console.log('Transaction completed by ' + payerName);

        const getServiceDateTime = (selectedDate: Date | null, selectedTimeSlot: string) => {
            if (!selectedDate) {
                throw new Error("selectedDate cannot be null");
            }

            const [timeStart] = selectedTimeSlot.split(" - ");
            const serviceDateTime = new Date(selectedDate);
            const [hours, minutes] = timeStart.split(':').map(Number);

            serviceDateTime.setHours(hours);
            serviceDateTime.setMinutes(minutes);

            return serviceDateTime;
        };

        const serviceDateTime = getServiceDateTime(selectedDate, selectedTimeSlot);
        const releaseTime = new Date(serviceDateTime.getTime() + 24 * 60 * 60 * 1000).toISOString();

        const paymentData = {
            customerName,
            customerEmail,
            selectedDate: selectedDate ? selectedDate.toISOString() : null,
            selectedTimeSlot,
            servicePrice,
            serviceName,
            transactionId: details.id,
            status: "PENDING",
            payerName,
            paymentTime: details.update_time,
            merchantId,
            releaseTime,
        };

        try {
            const docRef = await addDoc(collection(db, 'payments'), paymentData);
            console.log("Payment saved with ID: ", docRef.id);

            // Update the merchant's pending balance
            await updateMerchantBalance();

            const serviceRef = doc(db, 'services', serviceId);
            await updateDoc(serviceRef, {
                bookingsCount: increment(1),
            });

            console.log(`Updated bookingsCount for service ID: ${serviceId}`);
            onClose();
        } catch (error) {
            console.error('Error saving payment:', error);
            setErrorMessage('Payment failed. Please try again.');
        }
    };

    const handlePaymentError = (error: any) => {
        console.error('Payment error:', error);
        setErrorMessage('Payment failed. Please try again.');
    };

    return (
        <div className="flex flex-col gap-4 w-[500px]">
            <div className="flex items-start justify-start mt-6">
                <button onClick={onClose} className="flex items-center justify-center text-gray-700 hover:text-gray-500">
                    <IoIosArrowBack className="text-xl" /> Back
                </button>
            </div>

            <div className='bg-primary-50 px-10 py-6 rounded-xl shadow-md z-20'>
                <div className="text-sm ">
                    <div className="flex flex-col space-y-2">
                        <div className="flex justify-between">
                            <span className="font-medium">Name:</span>
                            <span>{customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Email:</span>
                            <span>{customerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Date:</span>
                            <span>{selectedDate ? selectedDate.toDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Service:</span>
                            <span>{serviceName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Time Slot:</span>
                            <span>{selectedTimeSlot}</span>
                        </div>
                        
                        <div className="flex justify-between border-t border-slate-300 pt-2 mt-2">
                            <span className="font-medium">Price:</span>
                            <span className="text-lg font-semibold">${servicePrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>

            {errorMessage && <div className="text-red-500">{errorMessage}</div>}

            <div className="flex flex-col bg-primary-100 mt-[-30px] rounded-xl px-10 py-6">
                <h3 className="text-sm mb-2 font-medium">Select Payment Method:</h3>
                <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
                    <PayPalButtons
                        createOrder={async (_, actions) => {
                            return actions.order.create({
                                intent: "CAPTURE",
                                purchase_units: [{
                                    amount: {
                                        currency_code: 'USD',
                                        value: servicePrice.toFixed(2),
                                    },
                                    description: `Service: ${serviceName}`,
                                }],
                            });
                        }}
                        onApprove={async (_, actions) => {
                            if (!actions.order) {
                                console.error("Order actions are undefined");
                                return;
                            }
                            const details = await actions.order.capture();
                            await handlePaymentSuccess(details);
                        }}
                        onError={handlePaymentError}
                    />
                </PayPalScriptProvider>
            </div>
        </div>
    );
};

export default PaymentMethod;
