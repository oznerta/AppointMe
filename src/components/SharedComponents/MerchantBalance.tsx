import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase/config';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Withdrawal from './Withdrawal'; // Adjust import path if needed
import { PiHandWithdrawThin } from "react-icons/pi";

const db = getFirestore(app);

interface MerchantBalanceProps {
    merchantId: string;
    userId: string; // Assuming you have a userId to fetch user data
}

const MerchantBalance: React.FC<MerchantBalanceProps> = ({ merchantId, userId }) => {
    const [balanceData, setBalanceData] = useState<{
        balance: number;
        pendingBalance: number;
        totalBalance: number;
        lastUpdated: string | null;
    } | null>(null);
    const [userData, setUserData] = useState<{ paypalEmail?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDialogOpen, setDialogOpen] = useState(false); // State to manage dialog visibility

    useEffect(() => {
        const fetchBalance = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'merchantBalances', merchantId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const balance = data.balance || 0;
                    const pendingBalance = data.pendingBalance || 0;

                    const lastUpdated = data.lastUpdated?.toDate().toLocaleString() || null;

                    setBalanceData({
                        balance,
                        pendingBalance,
                        totalBalance: balance + pendingBalance,
                        lastUpdated,
                    });
                } else {
                    setError('Merchant balance not found.');
                }
            } catch (err) {
                console.error('Error fetching balance:', err);
                setError('Failed to fetch balance. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        const fetchUserData = async () => {
            try {
                const docRef = doc(db, 'users', userId); // Adjust collection name as needed
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                } else {
                    console.error('User data not found.');
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };

        fetchBalance();
        fetchUserData();
    }, [merchantId, userId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <Card className="bg-white rounded-xl">
            <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Merchant Balance</CardTitle>
                <CardDescription className="text-sm sm:text-base">Overview of your current balance</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <BalanceItem label="Available Balance" amount={balanceData?.balance ?? 0} color="green" />
                    <BalanceItem label="Pending Balance" amount={balanceData?.pendingBalance ?? 0} color="yellow" />
                    <BalanceItem label="Total Balance" amount={balanceData?.totalBalance ?? 0} color="blue" />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <p className="text-xs text-gray-600">Last updated: {balanceData?.lastUpdated || 'N/A'}</p>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <div className='flex gap-2 items-center text-primary-500 cursor-pointer' onClick={() => setDialogOpen(true)}>
                            <PiHandWithdrawThin className='h-9 w-9'/>
                            <p className='text-sm'> Withdraw</p>
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Withdraw Funds</DialogTitle>
                            <DialogDescription>
                                Please confirm your withdrawal details below.
                            </DialogDescription>
                        </DialogHeader>
                        <Withdrawal
                            balance={balanceData?.balance ?? 0}
                            paypalEmail={userData?.paypalEmail} // Now defined
                            merchantId={merchantId} // Pass merchantId here
                            onSuccess={(amount, paypalEmail, newBalance) => {
                                console.log(`Withdrawing ${amount} to ${paypalEmail}`);
                                setBalanceData(prev => prev ? { ...prev, balance: newBalance } : null);
                                setDialogOpen(false);
                            }}
                            onClose={() => setDialogOpen(false)}
                        />

                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    );
};

const BalanceItem: React.FC<{ label: string; amount: number; color: 'green' | 'yellow' | 'blue' }> = ({ label, amount, color }) => {
    const bgColor = `${color}-100`;
    const borderColor = `${color}-300`;

    return (
        <div className={`flex justify-between items-center p-3 bg-${bgColor} rounded border border-${borderColor}`}>
            <span className="font-semibold">{label}:</span>
            <span className="font-bold">${amount.toFixed(2)}</span>
        </div>
    );
};

export default MerchantBalance;
