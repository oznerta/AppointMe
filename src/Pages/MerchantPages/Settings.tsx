import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FaCamera } from 'react-icons/fa'; // Importing camera icon

const db = getFirestore(app);

const Settings: React.FC = () => {
  const { userData, fetchUserData } = useAuth();
  const [brandName, setBrandName] = useState<string>('');
  const [brandLogo, setBrandLogo] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [paypalEmail, setPayPalEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (userData) {
      setBrandName(userData.brandName || '');
      setBrandLogo(userData.brandLogo || '');
      setFullName(userData.fullName || '');
      setEmail(userData.email || '');
      setContactNumber(userData.contactNumber || '');
      setPayPalEmail(userData.paypalEmail || ''); 
    }
  }, [userData]);

  const handleUpdateSettings = async () => {
    setError('');
    setSuccess('');

    if (!fullName || !email || !contactNumber) {
      setError('Full Name, Email, and Contact Number are required.');
      return;
    }

    if (!userData || !userData.id) {
      setError('User data is missing. Please log in again.');
      return;
    }

    try {
      const userRef = doc(db, 'users', userData.id);
      await updateDoc(userRef, {
        brandName,
        brandLogo,
        fullName,
        email,
        contactNumber,
        paypalEmail,
      });

      await fetchUserData(); 
      setSuccess('Settings updated successfully!');
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings. Please try again later.');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Settings</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <div className="flex flex-col gap-4 mt-4">

        {/* Logo Upload Section */}
        <div className="flex flex-col items-center">
          <label className="flex flex-col items-center cursor-pointer group">
            <div className="relative w-32 h-32 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-200">
              {brandLogo ? (
                <img src={brandLogo} alt="Brand Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">Upload Logo</span>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <FaCamera className="text-white text-2xl" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Input Fields */}
        <Input
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Brand Name"
        />
        
        <Input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
        />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <Input
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="Contact Number"
        />
        <Input
          type="email"
          value={paypalEmail}
          onChange={(e) => setPayPalEmail(e.target.value)}
          placeholder="PayPal Email"
        />
        <Button onClick={handleUpdateSettings}>Update Settings</Button>
      </div>
    </div>
  );
};

export default Settings;
