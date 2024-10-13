import React, { useState } from 'react';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext'; // Import the AuthContext
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MerchantDetails() {
    const { user } = useAuth(); // Use the AuthContext to access user
    const [brandName, setBrandName] = useState('');
    const [identityId, setIdentityId] = useState('');
    const [brandLogo, setBrandLogo] = useState<File | null>(null);
    const [fullName, setFullName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [businessLicense, setBusinessLicense] = useState<File | null>(null);
    const [serviceDescription, setServiceDescription] = useState('');
    const [selfDeclaration, setSelfDeclaration] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // State to hold error messages

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmitFirstTimeDetails = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validation to ensure all fields are filled
        if (!brandName || !identityId || !brandLogo || !fullName || !contactNumber || !businessLicense || !serviceDescription || !selfDeclaration) {
            setErrorMessage("All fields are required. Please fill in all details.");
            return;
        }

        const db = getFirestore();
        const storage = getStorage();

        try {
            if (user) {
                // Upload the brand logo to Firebase Storage
                const logoRef = ref(storage, `logos/${user.uid}/${brandLogo.name}`);
                await uploadBytes(logoRef, brandLogo);
                const logoURL = await getDownloadURL(logoRef);

                // Upload the business license to Firebase Storage
                const licenseRef = ref(storage, `licenses/${user.uid}/${businessLicense.name}`);
                await uploadBytes(licenseRef, businessLicense);
                const licenseURL = await getDownloadURL(licenseRef);

                // Save the details to Firestore
                await addDoc(collection(db, 'merchants'), {
                    uid: user.uid,
                    brandName,
                    identityId,
                    brandLogo: logoURL,
                    fullName,
                    contactNumber,
                    businessLicense: licenseURL,
                    serviceDescription,
                    selfDeclaration,
                    createdAt: new Date(),
                });

                console.log('Merchant details submitted successfully!');
                // Reset fields
                setBrandName('');
                setIdentityId('');
                setBrandLogo(null);
                setFullName('');
                setContactNumber('');
                setBusinessLicense(null);
                setServiceDescription('');
                setSelfDeclaration('');
                setErrorMessage(null); // Reset error message on success
            } else {
                console.error('No user is currently signed in or logo is missing.');
            }
        } catch (error) {
            console.error("Error submitting details:", error);
            setErrorMessage("Error submitting merchant details. Please try again.");
        }
    };

    return (
        <div>
            <h1>Merchant Details</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error messages */}
            <p>
                <strong>Acceptable IDs for Verification:</strong>
                <ul>
                    <li>Government-issued ID (e.g., Driver's License, Passport)</li>
                    <li>National Identity Card</li>
                    <li>Voter ID</li>
                </ul>
                <strong>Profile Picture/ID Verification:</strong>
                Please upload a clear image of your government-issued ID and a selfie.
            </p>
            <form onSubmit={handleSubmitFirstTimeDetails}>
                <Input 
                    type="text" 
                    placeholder="Brand Name" 
                    value={brandName} 
                    onChange={(e) => setBrandName(e.target.value)} 
                />
                <Input 
                    type="text" 
                    placeholder="Identity ID" 
                    value={identityId} 
                    onChange={(e) => setIdentityId(e.target.value)} 
                />
                <Input 
                    type="text" 
                    placeholder="Full Name" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                />
                <Input 
                    type="text" 
                    placeholder="Contact Number" 
                    value={contactNumber} 
                    onChange={(e) => setContactNumber(e.target.value)} 
                />
                <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setBrandLogo)}
                />
                <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setBusinessLicense)}
                />
                <Input 
                    type="text" 
                    placeholder="Service Description" 
                    value={serviceDescription} 
                    onChange={(e) => setServiceDescription(e.target.value)} 
                />
                <Input 
                    type="text" 
                    placeholder="Self Declaration" 
                    value={selfDeclaration} 
                    onChange={(e) => setSelfDeclaration(e.target.value)} 
                />
                <Button type="submit">Submit Details</Button>
            </form>
        </div>
    );
}

export default MerchantDetails;
