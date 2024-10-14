import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config'; 
import { User } from 'firebase/auth';

// Define UserData interface
export interface UserData {
  id: string;
  fullName: string | null;
  brandLogo: string | null;
  brandName: string | null;
  contactNumber: string | null;
  createdAt: string | null;
  email: string | null;
  idFile: string | null;
  role: string | null;
  selfie: string | null;
  serviceDescription: string | null;
  status: string | null;
  userType: string | null;
}

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


export const createGoogleUserDocument = async (user: User) => {
  const userDocRef = doc(db, 'users', user.uid);

  // Define default values for new users
  const userData = {
    role: 'merchant', 
    status: 'incomplete' // default status for new users
  };

  await setDoc(userDocRef, userData);
};

export const getUserData = async (uid: string): Promise<UserData> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid)); 
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        fullName: userDoc.data().fullName || null,
        brandLogo: userDoc.data().brandLogo || null,
        brandName: userDoc.data().brandName || null,
        contactNumber: userDoc.data().contactNumber || null,
        createdAt: userDoc.data().createdAt || null,
        email: userDoc.data().email || null,
        idFile: userDoc.data().idFile || null,
        role: userDoc.data().role || null,
        selfie: userDoc.data().selfie || null,
        serviceDescription: userDoc.data().serviceDescription || null,
        status: userDoc.data().status || null,
        userType: userDoc.data().userType || null,
      };
    } else {
      throw new Error("No such user found!");
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error; // Propagate the error for handling in the caller
  }
};

export const getAllUsers = async () => {
  const usersCollection = collection(db, 'users');
  const userSnapshot = await getDocs(usersCollection);
  return userSnapshot.docs.map(doc => ({
    id: doc.id,
    fullName: doc.data().fullName || null,
    brandLogo: doc.data().brandLogo || null,
    brandName: doc.data().brandName || null,
    contactNumber: doc.data().contactNumber || null,
    createdAt: doc.data().createdAt || null,
    email: doc.data().email || null,
    idFile: doc.data().idFile || null,
    role: doc.data().role || null,
    selfie: doc.data().selfie || null,
    serviceDescription: doc.data().serviceDescription || null,
    status: doc.data().status || null,
    userType: doc.data().userType || null,
  })); // Return the raw user data
};


export const updateUserRole = async (userId: string, newRole: string) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { role: newRole });
};

export const deleteUser = async (userId: string) => {
  const userDocRef = doc(db, 'users', userId);
  await deleteDoc(userDocRef);
};

// Ensure to export the UserData interface
