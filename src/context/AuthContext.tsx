import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase/config';
import { getUserRole, getUserData } from '../lib/firebase/utils'; // Import getUserData
import LoadingComponent from './../components/SharedComponents/LoadingComponent';

interface UserData {
    id: string;
    fullName?: string | null;
    brandLogo?: string | null;
    brandName?: string | null;
    contactNumber?: string | null;
    createdAt?: string | null;
    email?: string | null;
    idFile?: string | null;
    role?: string | null;
    selfie?: string | null;
    serviceDescription?: string | null;
    status?: string | null;
    userType?: string | null;
    businessLicense?: string | null;
    paypalEmail?: string | null;
}

interface AuthContextType {
    user: FirebaseUser | null;
    role: 'superadmin' | 'merchant' | null;
    isAuth: boolean;
    status: string | null;
    fullName: string | null;
    userData: UserData | null; // Add userData to the context
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    signOutUser: () => void;
    setStatus: (status: string) => void;
    fetchUserData: () => Promise<void>; // Add fetchUserData function to the context
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [role, setRole] = useState<'superadmin' | 'merchant' | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null); // State for user data
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            // Simulate a loading progress (0-100)
            let progress = 0;

            if (user) {
                setUser(user);
                setIsAuth(true);
                progress = 50; // Update progress

                try {
                    const { role: userRole, status: userStatus } = await getUserRole(user.uid);
                    console.log("User role:", userRole, "User status:", userStatus); // Log user role and status
                    setRole(userRole);
                    setStatus(userStatus);
                    progress = 75; // Update progress

                    // Fetch user data to get all user details
                    const data = await getUserData(user.uid);
                    setUserData(data); // Store the complete user data
                    setFullName(data.fullName); // Store the full name
                } catch (error) {
                    console.error("Error fetching user role/status or data:", error);
                    setStatus(null); // Reset status on error
                }
            } else {
                setUser(null);
                setRole(null);
                setIsAuth(false);
                setStatus(null);
                setFullName(null); // Reset full name
                setUserData(null); // Reset user data
            }

            progress = 100; // Complete progress
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchUserData = async () => {
        if (user) {
            try {
                // Fetch and update user data
                const data = await getUserData(user.uid);
                setUserData(data); // Update the userData in state
                setFullName(data.fullName); // Update fullName
            } catch (error) {
                console.error('Error refreshing user data:', error);
            }
        }
    };

    const signOutUser = async () => {
        await signOut(auth);
        setUser(null);
        setRole(null);
        setIsAuth(false);
        setFullName(null); // Reset full name on sign out
        setUserData(null); // Reset user data on sign out
    };

    if (loading) {
        return (
            <div>
                <LoadingComponent/>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, role, isAuth, status, fullName, userData, setIsAuth, signOutUser, setStatus, fetchUserData }}>
            {children}
        </AuthContext.Provider>
    );
};
