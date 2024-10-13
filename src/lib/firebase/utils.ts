import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config'; 
import { User } from 'firebase/auth';

export const getUserRole = async (userId: string): Promise<{ role: 'superadmin' | 'merchant' | null; status: string | null }> => {
  const userDoc = await getDoc(doc(db, 'users', userId));

  if (userDoc.exists()) {
    const data = userDoc.data();

    const role: 'superadmin' | 'merchant' | null = data.role === 'superadmin' ? 'superadmin' 
      : data.role === 'merchant' ? 'merchant' 
      : null;

    const status = data.status || null; // Change this line to use status

    return {
      role,
      status, // Update to return status
    };
  }

  return {
    role: null,
    status: null, // Return null if user document does not exist
  };
};


export const createUserDocument = async (user: User) => {
  const userDocRef = doc(db, 'users', user.uid);

  // Define default values for new users
  const userData = {
    role: 'merchant', // or 'superadmin', depending on your logic
    status: 'incomplete' // default status for new users
  };

  await setDoc(userDocRef, userData);
};