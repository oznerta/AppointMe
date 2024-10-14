import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase/config'; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import { createGoogleUserDocument } from '@/lib/firebase/utils';

export function SignInPage() {
    const navigate = useNavigate();
    const { setIsAuth } = useAuth(); // Access setIsAuth from context
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setIsAuth(true);
        } catch (error) {
            console.error("Error signing in:", error);
            setErrorMessage("Error signing in with email and password. Please check your credentials.");
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
      
          const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
          setIsAuth(true);
      
          if (isNewUser) {
            // Create user document in Firestore for new users
            await createGoogleUserDocument(user); // Function to create user document
            navigate('/merchant/details'); // Redirect new users to the Merchant Details page
          } else {
            navigate('/merchant/dashboard');
          }
        } catch (error) {
          console.error("Error signing in with Google:", error);
          setErrorMessage("Error signing in with Google. Please try again.");
        }
      };
      
    

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col w-[350px]">
                <div className='flex gap-2 items-center justify-center mb-8'>
                    <img src="../assets/images/logo.png" alt="logo" className='h-14 w-14'/>
                    <h1 className='font-bold text-2xl'> Appoint.Me </h1>
                </div>

                <div className='flex flex-col gap-2 items-center justify-center mb-5'>
                    <h1 className="text-xl font-semibold">Login to your account</h1>
                    <p>Welcome back! Please enter your details</p>
                </div>
                
                
                <form onSubmit={handleEmailSignIn}>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id='email'
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="mb-4 shad-input"
                    />

                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id='password'
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="mb-4 shad-input"
                    />
                    {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                    <Button type="submit" className="w-full bg-primary-500 text-text-950 hover:bg-primary-300">Sign In</Button>
                </form>

                {/* Separator with OR */}
                <div className="flex items-center justify-center my-4">
                    <hr className="flex-grow border-t border-neutral-300" />
                    <span className="mx-2 text-gray-500">OR</span>
                    <hr className="flex-grow border-t border-neutral-300" />
                </div>

                <Button 
                    onClick={handleGoogleSignIn} 
                    variant='secondary'
                    className="shad-button_secondary flex justify-center gap-2 w-full text-text-950 "
                >
                    <img src="../assets/icons/google.png" className='h-5 w-5' alt="Google Logo" />
                    Google
                </Button>

                <p className="text-center mt-4 text-sm">
                    Don't have an account? 
                    <Link to="/signup" className=" text-text-500"> Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

export default SignInPage;
