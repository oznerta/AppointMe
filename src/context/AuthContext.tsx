import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'; 
import { auth } from '../lib/firebase/config';
import { getUserRole } from '../lib/firebase/utils'; 

interface AuthContextType {
  user: FirebaseUser | null;  
  role: 'superadmin' | 'merchant' | null; 
  isAuth: boolean; 
  status: string | null; // Change this from isApproved to status
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>; 
  signOutUser: () => void; 
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
    const [loading, setLoading] = useState(true);  
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setLoading(true);
  
        if (user) {
          setUser(user);
          setIsAuth(true);
  
          try {
            const { role: userRole, status: userStatus } = await getUserRole(user.uid); 
            console.log("User role:", userRole, "User status:", userStatus); // Log user role and status
            setRole(userRole);
            setStatus(userStatus);
          } catch (error) {
            console.error("Error fetching user role/status:", error);
            setStatus(null); // Reset status on error
          }
        } else {
          setUser(null);
          setRole(null);
          setIsAuth(false);
          setStatus(null);
        }
  
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, []);
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    const signOutUser = async () => {
      await signOut(auth);
      setUser(null);
      setRole(null);
      setIsAuth(false);
    };
  
    return (
      <AuthContext.Provider value={{ user, role, isAuth, status, setIsAuth, signOutUser }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
