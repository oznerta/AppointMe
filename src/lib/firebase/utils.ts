import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
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
  businessLicense: string | null;
  role: string | null;
  selfie: string | null;
  serviceDescription: string | null;
  status: string | null;
  userType: string | null;
}

// Define ServiceData interface
export interface ServiceData {
  serviceName: string;
  description: string;
  price: number;
  userId: string; // ID of the user creating the service
  createdAt: string; // Timestamp for when the service is created
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
      const data = userDoc.data();

      return {
        id: userDoc.id,
        fullName: data.fullName || null,
        brandLogo: data.brandLogo || null,
        brandName: data.brandName || null,
        contactNumber: data.contactNumber || null,
        createdAt: data.createdAt || null,
        email: data.email || null,
        idFile: data.idFile || null,
        businessLicense: data.businessLicense || null, 
        role: data.role || null,
        selfie: data.selfie || null,
        serviceDescription: data.serviceDescription || null,
        status: data.status || null,
        userType: data.userType || null,
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
    businessLicense: doc.data().businessLicense || null, 
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

export const updateUserStatus = async (userId: string, newStatus: string) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { status: newStatus });
};

export const deleteUser = async (userId: string) => {
  const userDocRef = doc(db, 'users', userId);
  await deleteDoc(userDocRef);
};

// Ensure to export the UserData interface


export const saveService = async (serviceData: ServiceData) => {
  try {
      // Create a new service document in the 'services' collection
      const docRef = await addDoc(collection(db, 'services'), {
          ...serviceData,
          createdAt: new Date(), // Set createdAt to the current timestamp
      });

      console.log("Service added with ID: ", docRef.id);
      return docRef.id; // Return the ID of the newly created document
  } catch (error) {
      console.error("Error adding service: ", error);
      throw error; // Propagate the error for handling in the caller
  }
};