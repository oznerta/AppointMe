import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase/config'; // Import Firestore config
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext'; // Import the Auth context
import { Input } from "@/components/ui/input"; // Importing Input from Shadcn UI

const LinkGenerator: React.FC = () => {
  const { userData } = useAuth(); // Access user data from context
  const [generatedLink, setGeneratedLink] = useState<string>('');

  const userId = userData?.id; // Assuming userData contains an ID for the user

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGeneratedLink(event.target.value); // Set input value to generated link
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(`http://localhost:5173/${generatedLink}`);
      alert("Link copied to clipboard!");
    }
  };

  useEffect(() => {
    if (userData && userData.brandName) {
      // Set default link based on brand name
      const defaultLink = userData.brandName.replace(/\s+/g, '-').toLowerCase();
      setGeneratedLink(defaultLink);
    }
  }, [userData]);

  useEffect(() => {
    const updateLinkInFirestore = async () => {
      if (generatedLink && userId) { // Check if userId is defined
        const docRef = doc(db, 'merchantLinks', generatedLink); // Use the generatedLink as the document ID
        
        try {
          // Set the document in Firestore
          await setDoc(docRef, { userId, brandName: userData.brandName }, { merge: true });
          console.log(`Link updated in Firestore: ${generatedLink}`); // Log success message
        } catch (error) {
          console.error('Error updating link in Firestore:', error); // Log any errors
        }
      }
    };

    updateLinkInFirestore();
  }, [generatedLink, userId, userData]);

  return (
    <div className="relative flex items-center w-[450px]">
      <img src='../../../public/assets/images/logo.png' alt="Logo" className="h-10 absolute left-3" />
      <Input
        type="text"
        value={generatedLink} // Keep just the generated link in the input
        onChange={handleChange}
        className="pl-20 flex-grow border-gray-300 focus:outline-none"
        style={{ background: 'none' }} // Remove background
      />
      <p
        onClick={copyToClipboard}
        className="cursor-pointer text-primary-500 absolute right-3"
      >
        Copy
      </p>
    </div>
  );
};

export default LinkGenerator;
