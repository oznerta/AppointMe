import { db } from '@/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface WithdrawalProps {
  balance: number;
  paypalEmail?: string;
  merchantId: string; // Add this line
  onSuccess: (amount: number, paypalEmail: string, newBalance: number) => void;
  onClose: () => void;
}

const Withdrawal: React.FC<WithdrawalProps> = ({ balance, paypalEmail, merchantId, onSuccess, onClose }) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number | string>('');
  const [email, setEmail] = useState<string>(paypalEmail || '');
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setEmail(paypalEmail || '');
  }, [paypalEmail]);

  const handleWithdrawal = async () => {
    const parsedAmount = Number(amount);
    if (!isNaN(parsedAmount) && parsedAmount <= balance && parsedAmount > 0 && isEmailValid) {
      try {
        const withdrawalId = `withdrawal_${Date.now()}`;
        const withdrawalData = {
          amount: parsedAmount,
          email,
          status: 'PENDING',
          createdAt: new Date(),
        };

        const withdrawalRef = doc(db, 'withdrawals', withdrawalId);
        await setDoc(withdrawalRef, withdrawalData);

        const response = await fetch('http://localhost:3000/api/withdraw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: parsedAmount, email }),
        });

        if (!response.ok) {
          throw new Error('Withdrawal failed');
        }

        const data = await response.json();
        console.log(`Payout initiated: ${data.batchId}`);

        await setDoc(withdrawalRef, { ...withdrawalData, status: 'COMPLETED' }, { merge: true });

        // Calculate new balance
        const newBalance = balance - parsedAmount;

        // Update the balance in Firestore
        const merchantBalanceRef = doc(db, 'merchantBalances', merchantId); // Use merchantId here
        await setDoc(merchantBalanceRef, { balance: newBalance }, { merge: true });

        // Call onSuccess to update local state
        onSuccess(parsedAmount, email, newBalance);

        // Show success toast notification
        toast({
          title: "Withdrawal Successful!",
          description: `You have successfully withdrawn $${parsedAmount.toFixed(2)}.`,
        });

        // Close the withdrawal component
        onClose();
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage('Withdrawal failed. Please try again later.');
      }
    } else {
      setErrorMessage('Invalid withdrawal amount or PayPal email is required.');
    }
  };
  

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(regex.test(email));
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <p className="font-semibold">Available Balance: ${balance.toFixed(2)}</p>
      </div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount to withdraw"
        className="p-2 border border-gray-300 rounded mb-4"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          validateEmail(e.target.value);
        }}
        placeholder="Enter your PayPal email"
        className={`p-2 border border-gray-300 rounded mb-4 ${!isEmailValid ? 'border-red-500' : ''}`}
      />
      <button onClick={handleWithdrawal} className="btn" disabled={!isEmailValid}>
        Confirm Withdrawal
      </button>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default Withdrawal;
