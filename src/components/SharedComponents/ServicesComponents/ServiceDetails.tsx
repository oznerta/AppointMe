import React, { useState } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { FaDollarSign } from "react-icons/fa";
import { BsInfoCircleFill } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import AppointmentScheduler from '../AppointmentScheduler';
import PaymentMethod from '../PaymentMethod'; // Import the PaymentMethod component

interface TimeSlot {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "10:00"
}

interface Service {
    serviceId: string;
    serviceName: string;
    description: string;
    price: number;
    availability: string[];
    timeSlots: TimeSlot[];
}

interface ServiceDetailsProps {
    service: Service | null;
    onClose: () => void;
    onNext: (customerName: string, customerEmail: string, selectedDate: Date | null, selectedTimeSlot: string) => void; // Add onNext prop
    merchantId: string;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ service, onClose, onNext, merchantId }) => { // Added onNext prop
    const [showMore, setShowMore] = useState(true);
    const [isScheduling, setIsScheduling] = useState(false);
    const [isPayment, setIsPayment] = useState(false);
    const [customerDetails, setCustomerDetails] = useState<{ name: string; email: string; date: Date | null; timeSlot: string }>({
        name: '',
        email: '',
        date: null,
        timeSlot: '',
    });

    if (!service) return null;

    const handleShowMoreToggle = () => {
        setShowMore(!showMore);
    };

    const handleSchedule = () => {
        setIsScheduling(true);
    };

    const handleNext = (name: string, email: string, date: Date | null, timeSlot: string) => {
        setCustomerDetails({ name, email, date, timeSlot });
        setIsScheduling(false);
        setIsPayment(true); // Move to PaymentMethod
        onNext(name, email, date, timeSlot); // Call the onNext prop
    };

    return (
        <div className="flex flex-col items-center justify-center">
            {isPayment ? (
                <PaymentMethod 
                customerName={customerDetails.name}
                customerEmail={customerDetails.email}
                selectedDate={customerDetails.date}
                selectedTimeSlot={customerDetails.timeSlot}
                servicePrice={service.price} // Pass the service price here
                merchantId={merchantId} // Pass the merchant ID here
                serviceName={service.serviceName} // Pass the service name here
                serviceId={service.serviceId}
                onClose={() => setIsPayment(false)}
            />
            
            ) : isScheduling ? (
                <AppointmentScheduler 
                    service={service} 
                    onClose={() => setIsScheduling(false)} 
                    onNext={handleNext} // Pass onNext prop
                />
            ) : (
                <div className='flex flex-col'>
                    {/* Close Button */}
                    <div className="flex items-start justify-start">
                        <button onClick={onClose} className="flex items-center justify-center text-gray-700 hover:text-gray-500">
                            <IoIosArrowBack className="text-xl" /> Back
                        </button>
                    </div>

                    <div className="flex bg-primary-50 px-10 py-6 rounded-xl cursor-default shadow-md z-50 mt-6 w-[500px]">
                        {/* Service Details */}
                        <div className="flex flex-col w-full">
                            <div className="mb-2">
                                <h2 className="font-semibold text-lg">{service.serviceName}</h2>
                                <p className='text-sm'>{service.description}</p>
                            </div>

                            <div className="flex mt-2 items-center gap-4">
                                <button
                                    className="flex items-center text-primary-500 hover:text-primary-300 focus:outline-none text-xs flex-grow"
                                    onClick={handleShowMoreToggle}
                                >
                                    <BsInfoCircleFill className="mr-1 text-xs" />
                                    {showMore ? 'Hide Info' : 'More Info'}
                                </button>

                                <div className="flex items-center text-base">
                                    <FaDollarSign className="mr-1" />
                                    <span>Fee: ${service.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* More Info Section */}
                    {showMore && (
                        <div className="text-sm text-gray-600 bg-primary-100 mt-[-8px] px-10 py-6 rounded-b-xl w-[500px]">
                            <p>{`Available on: ${service.availability.join(', ')}`}</p>
                        </div>
                    )}

                    {/* Schedule Appointment Button */}
                    <div className="flex justify-end mt-4">
                        <Button onClick={handleSchedule}>
                            Schedule Appointment
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceDetails;
