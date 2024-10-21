
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase/config';

const db = getFirestore(app);

export const releasePayment = async (paymentId: string) => {
    const paymentRef = doc(db, 'payments', paymentId);
    
    try {
        // Update the payment status to COMPLETED
        await updateDoc(paymentRef, {
            status: "COMPLETED",
        });
        
        // Logic to transfer funds to merchant (depending on your payment provider)
        
        console.log(`Payment released for ID: ${paymentId}`);
    } catch (error) {
        console.error('Error releasing payment:', error);
    }
};
