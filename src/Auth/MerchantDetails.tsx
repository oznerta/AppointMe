import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MerchantData {
    email: string | null;
    brandName: string;
    fullName: string;
    contactNumber: string;
    serviceDescription: string;
    createdAt: Date;
    brandLogo?: string; 
    businessLicense?: string; 
    idFile?: string; 
    selfie?: string; 
    status: string;
    role: string;
    userType: string;
}

const MerchantDetails: React.FC = () => {
    const { user, role, status, setIsAuth, setStatus } = useAuth();  // Access the user from useAuth
    const navigate = useNavigate();
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        if (redirect) {
          navigate("/waiting-for-approval"); // Adjust this path based on your routing setup
        }
      }, [redirect, navigate]);

    // If user is not available, show a message
    if (!user) {
        return <div>No user information available. Please sign in.</div>;
    }

    const [brandName, setBrandName] = useState('');
    const [fullName, setFullName] = useState(user.displayName || '');  // Pre-fill from Google account
    const [contactNumber, setContactNumber] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [brandLogo, setBrandLogo] = useState<File | null>(null);
    const [businessLicense, setBusinessLicense] = useState<File | null>(null);
    const [idFile, setIdFile] = useState<File | null>(null);
    const [selfie, setSelfie] = useState<File | null>(null);
    const [userType, setUserType] = useState<string>(''); // 'business' or 'freelancer'
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        if (!userType) {
            setErrorMessage("Please select an account type.");
            return;
        }
    
        if (!brandLogo) {
            setErrorMessage("Please upload a brand logo.");
            return;
        }
    
        if (userType === 'business' && !businessLicense) {
            setErrorMessage("Please upload your business license.");
            return;
        }
    
        if (userType === 'freelancer' && (!idFile || !selfie)) {
            setErrorMessage("Please upload both your ID and a selfie.");
            return;
        }
    
        setErrorMessage(null);
    
        // Initialize Firestore and Storage
        const db = getFirestore();
        const storage = getStorage();
    
        // Initialize the merchantData object
        const merchantData: MerchantData = {
            email: user.email,
            brandName,
            fullName,
            contactNumber,
            serviceDescription,
            createdAt: new Date(),
            status: 'pending',
            role: 'merchant',
            userType,
        };
    
        // Handle brand logo upload
        if (brandLogo) {
            const brandLogoRef = ref(storage, `merchants/${user.uid}/brandLogo`);
            await uploadBytes(brandLogoRef, brandLogo);
            merchantData.brandLogo = await getDownloadURL(brandLogoRef); // Get the URL after upload
        }
    
        // Handle business license upload
        if (businessLicense && userType === "business") {
            const businessLicenseRef = ref(storage, `merchants/${user.uid}/businessLicense`);
            await uploadBytes(businessLicenseRef, businessLicense);
            merchantData.businessLicense = await getDownloadURL(businessLicenseRef); // Get the URL after upload
        }
    
        // Handle ID file upload
        if (idFile && userType === "freelancer") {
            const idFileRef = ref(storage, `merchants/${user.uid}/idFile`);
            await uploadBytes(idFileRef, idFile);
            merchantData.idFile = await getDownloadURL(idFileRef); // Get the URL after upload
        }
    
        // Handle selfie upload
        if (selfie && userType === "freelancer") {
            const selfieRef = ref(storage, `merchants/${user.uid}/selfie`);
            await uploadBytes(selfieRef, selfie);
            merchantData.selfie = await getDownloadURL(selfieRef); // Get the URL after upload
        }
    
        // Save the user document to Firestore after all uploads
        await setDoc(doc(db, "users", user.uid), merchantData);
        setIsAuth(true);
        
        // Fetch updated user data from Firestore
    const updatedUserDoc = await getDoc(doc(db, "users", user.uid));
    if (updatedUserDoc.exists()) {
        const updatedUserData = updatedUserDoc.data();
        // You may need to set these values in state if using local state for role/status
        if (updatedUserData) {
            // Example: Update local state with fetched data
            setStatus(updatedUserData.status);
        }
    }
        // Log role and status for debugging
        console.log('Role:', role);
        console.log('Status:', status);

        // Redirect to the approval page
      setRedirect(true);
    };
    
    // If user is not available, show a message
    if (!user) {
        return <div>No user information available. Please sign in.</div>;
    }

    // Conditional rendering based on role and status
    if (role === 'merchant' && status === 'incomplete') {
        // Render the merchant details form if status is incomplete
        return (
            <div className="flex items-center justify-center h-screen">
                <div className='flex flex-col w-[350px]'>
                    <div className='flex gap-2 items-center justify-center mb-8'>
                        <img src="../assets/images/logo.png" alt="logo" className='h-14 w-14' />
                        <h1 className='font-bold text-2xl'>Appoint.Me</h1>
                    </div>

                    <div className='flex flex-col gap-2 items-center justify-center mb-5'>
                        <h1 className="text-xl font-semibold">Create Merchant Account</h1>
                        <p>Please fill in the details below!</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input 
                            id='brandName'
                            type="text" 
                            placeholder="Brand Name" 
                            onChange={(e) => setBrandName(e.target.value)} 
                            className="mb-4" 
                        />

                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                            id='fullName'
                            type="text" 
                            placeholder="Full Name" 
                            value={fullName} // Pre-fill from Google account
                            onChange={(e) => setFullName(e.target.value)} 
                            className="mb-4" 
                        />

                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input 
                            id='contactNumber'
                            type="text" 
                            placeholder="Contact Number" 
                            onChange={(e) => setContactNumber(e.target.value)} 
                            className="mb-4" 
                        />

                        <Label htmlFor="serviceDescription">Service Description</Label>
                        <Input 
                            id='serviceDescription'
                            type="text" 
                            placeholder="Service Description" 
                            onChange={(e) => setServiceDescription(e.target.value)} 
                            className="mb-4" 
                        />

                        <Label htmlFor="userType">Account Type</Label>
                        <Select onValueChange={setUserType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Account Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="freelancer">Freelancer</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Label htmlFor="brandLogo">Brand Logo</Label>
                        <Input 
                            id='brandLogo'
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileChange(e, setBrandLogo)} 
                            className="mb-4" 
                        />

                        {userType === "business" && (
                            <>
                                <Label htmlFor="businessLicense">Business License</Label>
                                <Input 
                                    id='businessLicense'
                                    type="file" 
                                    accept="application/pdf,image/*" 
                                    onChange={(e) => handleFileChange(e, setBusinessLicense)} 
                                    className="mb-4" 
                                />
                            </>
                        )}

                        {userType === "freelancer" && (
                            <>
                                <Label htmlFor="idFile">ID File</Label>
                                <Input 
                                    id='idFile'
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileChange(e, setIdFile)} 
                                    className="mb-4" 
                                />

                                <Label htmlFor="selfie">Selfie</Label>
                                <Input 
                                    id='selfie'
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileChange(e, setSelfie)} 
                                    className="mb-4" 
                                />
                            </>
                        )}
                        
                        {errorMessage && <p className="text-red-500 text-center text-sm">{errorMessage}</p>}

                        <Button type="submit" className="mt-4 bg-blue-600 text-white hover:bg-blue-700">Submit</Button>
                    </form>
                </div>
            </div>
        );
    }

    // If the user's role is merchant and status is pending, redirect to waiting approval
    if (role === 'merchant' && status === 'pending') {
        navigate('/waiting-for-approval');
        return null; // Return null while redirecting
    }

    // Optional fallback if none of the conditions are met
    return <div>Your account status is not recognized. Please contact support.</div>;
};

export default MerchantDetails;
