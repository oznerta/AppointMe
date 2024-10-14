import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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

// Step 1 Component
const Step1: React.FC<{
  next: () => void;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  errorMessage: string | null;
}> = ({ next, setEmail, setPassword, setConfirmPassword, errorMessage }) => (
  <>
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      placeholder="Email"
      onChange={(e) => setEmail(e.target.value)}
      className="mb-4 shad-input"
    />

    <Label htmlFor="password">Password</Label>
    <Input
      id="password"
      type="password"
      placeholder="Password"
      onChange={(e) => setPassword(e.target.value)}
      className="mb-4 shad-input"
    />

    <Label htmlFor="confirmPassword">Confirm Password</Label>
    <Input
      id="confirmPassword"
      type="password"
      placeholder="Confirm Password"
      onChange={(e) => setConfirmPassword(e.target.value)}
      className="mb-4 shad-input"
    />

    {errorMessage && (
      <p className="text-red-500 text-center text-sm">{errorMessage}</p>
    )}

    <Button
      onClick={next}
      className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
    >
      Next
    </Button>
  </>
);

// Step 2 Component
const Step2: React.FC<{
  next: () => void;
  prev: () => void;
  setBrandName: React.Dispatch<React.SetStateAction<string>>;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  setContactNumber: React.Dispatch<React.SetStateAction<string>>;
  setServiceDescription: React.Dispatch<React.SetStateAction<string>>;
  userType: string;
  setUserType: React.Dispatch<React.SetStateAction<string>>;
  errorMessage: string | null;
}> = ({
  next,
  prev,
  setBrandName,
  setFullName,
  setContactNumber,
  setServiceDescription,
  setUserType,
  errorMessage
}) => (
  <>
    <Label htmlFor="brandName">Brand Name</Label>
    <Input
      id="brandName"
      type="text"
      placeholder="Brand Name"
      onChange={(e) => setBrandName(e.target.value)}
      className="mb-4 shad-input"
    />

    <Label htmlFor="fullName">Full Name</Label>
    <Input
      id="fullName"
      type="text"
      placeholder="Full Name"
      onChange={(e) => setFullName(e.target.value)}
      className="mb-4 shad-input"
    />

    <Label htmlFor="contactNumber">Contact Number</Label>
    <Input
      id="contactNumber"
      type="text"
      placeholder="Contact Number"
      onChange={(e) => setContactNumber(e.target.value)}
      className="mb-4 shad-input"
    />

    <Label htmlFor="serviceDescription">Service Description</Label>
    <Input
      id="serviceDescription"
      type="text"
      placeholder="Service Description"
      onChange={(e) => setServiceDescription(e.target.value)}
      className="mb-4 shad-input"
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
    {errorMessage && (
      <p className="text-red-500 text-center text-sm mt-4 ">{errorMessage}</p>
    )}
    <div className="flex justify-between mt-4">
      <Button
        onClick={prev}
        className="bg-gray-400 text-white hover:bg-gray-500"
      >
        Back
      </Button>
      <Button
        onClick={next}
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        Next
      </Button>
    </div>
  </>
);

// Step 3 Component
const Step3: React.FC<{
  submit: (e: React.FormEvent<HTMLFormElement>) => void;
  prev: () => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => void;
  setBrandLogo: React.Dispatch<React.SetStateAction<File | null>>;
  setBusinessLicense: React.Dispatch<React.SetStateAction<File | null>>;
  setIdFile: React.Dispatch<React.SetStateAction<File | null>>;
  setSelfie: React.Dispatch<React.SetStateAction<File | null>>;
  userType: string;
  errorMessage: string | null;
}> = ({
  submit,
  prev,
  handleFileChange,
  setBrandLogo,
  setBusinessLicense,
  setIdFile,
  setSelfie,
  userType,
  errorMessage
}) => (
  <form onSubmit={submit}>
    <Label htmlFor="brandLogo">Brand Logo</Label>
    <Input
      id="brandLogo"
      type="file"
      accept="image/*"
      onChange={(e) => handleFileChange(e, setBrandLogo)}
      className="mb-4"
    />

    {userType === "business" && (
      <>
        <Label htmlFor="businessLicense">Business License</Label>
        <Input
          id="businessLicense"
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
          id="idFile"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setIdFile)}
          className="mb-4"
        />

        <Label htmlFor="selfie">Selfie</Label>
        <Input
          id="selfie"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setSelfie)}
          className="mb-4"
        />
      </>
    )}
    {errorMessage && (
      <p className="text-red-500 text-center text-sm mb-4">{errorMessage}</p>
    )}
    <div className="flex justify-between">
      <Button
        onClick={prev}
        className="bg-gray-400 text-white hover:bg-gray-500"
      >
        Back
      </Button>
      <Button
        type="submit"
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        Create Account
      </Button>
    </div>
  </form>
);

export function SignUpPage() {
  const { setIsAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [brandName, setBrandName] = useState("");
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [brandLogo, setBrandLogo] = useState<File | null>(null);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [userType, setUserType] = useState<string>(""); // 'business' or 'freelancer'
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (redirect) {
      navigate("/waiting-for-approval"); // Adjust this path based on your routing setup
    }
  }, [redirect, navigate]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  
    // Validation checks
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      console.error("Password mismatch");
      return;
    }
  
    if (!brandLogo) {
      setErrorMessage("Please upload a brand logo.");
      console.error("Brand logo not uploaded");
      return;
    }
  
    if (userType === "business" && !businessLicense) {
      setErrorMessage("Please upload your business license.");
      console.error("Business license not uploaded");
      return;
    }
  
    if (userType === "freelancer" && (!idFile || !selfie)) {
      setErrorMessage("Please upload both your ID and a selfie.");
      console.error("ID file or selfie not uploaded");
      return;
    }
  
    setErrorMessage(null);
    console.log("All validations passed");
  
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
  
      const db = getFirestore();
  
      // Create user document with minimal required fields
      const merchantData: MerchantData = {
        email: user.email,
        brandName,
        fullName,
        contactNumber,
        serviceDescription,
        createdAt: new Date(),
        status: "pending", // Set status to pending upon creation
        role: "merchant",
        userType,
      };
  
      console.log("Merchant data prepared:", merchantData);
  
      // Save user document in Firestore
      await setDoc(doc(db, "users", user.uid), merchantData);
      console.log("User document created successfully");
  
      // Set authentication state
      setIsAuth(true);
      console.log("User authenticated");
  
      const storage = getStorage();
  
      // File uploads and document updates (all promises in parallel)
      const uploadTasks = [];
  
      // Handle brand logo upload
      if (brandLogo) {
        const brandLogoRef = ref(storage, `merchants/${user.uid}/brandLogo`);
        const uploadBrandLogo = uploadBytes(brandLogoRef, brandLogo)
          .then(async () => {
            merchantData.brandLogo = await getDownloadURL(brandLogoRef);
            console.log(
              "Brand logo uploaded and URL fetched:",
              merchantData.brandLogo
            );
          })
          .catch((err) => console.error("Brand logo upload failed:", err));
        uploadTasks.push(uploadBrandLogo);
      }
  
      // Handle business license upload
      if (businessLicense && userType === "business") {
        const businessLicenseRef = ref(
          storage,
          `merchants/${user.uid}/businessLicense`
        );
        const uploadBusinessLicense = uploadBytes(
          businessLicenseRef,
          businessLicense
        )
          .then(async () => {
            merchantData.businessLicense = await getDownloadURL(
              businessLicenseRef
            );
            console.log(
              "Business license uploaded and URL fetched:",
              merchantData.businessLicense
            );
          })
          .catch((err) => console.error("Business license upload failed:", err));
        uploadTasks.push(uploadBusinessLicense);
      }
  
      // Handle ID file upload
      if (idFile && userType === "freelancer") {
        const idFileRef = ref(storage, `merchants/${user.uid}/idFile`);
        const uploadIdFile = uploadBytes(idFileRef, idFile)
          .then(async () => {
            merchantData.idFile = await getDownloadURL(idFileRef);
            console.log("ID file uploaded and URL fetched:", merchantData.idFile);
          })
          .catch((err) => console.error("ID file upload failed:", err));
        uploadTasks.push(uploadIdFile);
      }
  
      // Handle selfie upload
      if (selfie && userType === "freelancer") {
        const selfieRef = ref(storage, `merchants/${user.uid}/selfie`);
        const uploadSelfie = uploadBytes(selfieRef, selfie)
          .then(async () => {
            merchantData.selfie = await getDownloadURL(selfieRef);
            console.log("Selfie uploaded and URL fetched:", merchantData.selfie);
          })
          .catch((err) => console.error("Selfie upload failed:", err));
        uploadTasks.push(uploadSelfie);
      }
  
      // Wait for all upload tasks to complete
      await Promise.all(uploadTasks);
  
      // Update the user document with additional data
      await setDoc(doc(db, "users", user.uid), merchantData, { merge: true });
      console.log("User document updated with additional data");
  
      // Redirect to the approval page after all uploads are complete
      setRedirect(true);
    } catch (error: any) {
      setErrorMessage(error.message);
      console.error("Error during signup process:", error);
    }
  };
  

  const next = () => {
    if (step === 1) {
      // Validate Step 1
      if (!email || !password || !confirmPassword) {
        setErrorMessage("Please fill in all fields.");
        return;
      }
      if (password.length < 8) {
        setErrorMessage("Password must be at least 8 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }
      setErrorMessage(null);
    } else if (step === 2) {
      // Validate Step 2
      if (
        !brandName ||
        !fullName ||
        !contactNumber ||
        !serviceDescription ||
        !userType
      ) {
        setErrorMessage("Please fill in all fields.");
        return;
      }
      setErrorMessage(null);
    } else if (step === 3) {
      // Validate Step 3
      if (!brandLogo) {
        setErrorMessage("Please upload a brand logo.");
        return;
      }
      if (userType === "business" && !businessLicense) {
        setErrorMessage("Please upload your business license.");
        return;
      }
      if (userType === "freelancer" && (!idFile || !selfie)) {
        setErrorMessage("Please upload both your ID and a selfie.");
        return;
      }
      setErrorMessage(null);
    }
    setStep(step + 1);
  };

  const prev = () => setStep(step - 1);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col w-[350px]">
        <div className="flex gap-2 items-center justify-center mb-8">
          <img
            src="../assets/images/logo.png"
            alt="logo"
            className="h-14 w-14"
          />
          <h1 className="font-bold text-2xl">Appoint.Me</h1>
        </div>

        <div className="flex flex-col gap-2 items-center justify-center mb-5">
          <h1 className="text-xl font-semibold">Create a new account</h1>
          <p>Please enter your details!</p>
        </div>
        {step === 1 && (
          <Step1
            next={next}
            setEmail={setEmail}
            setPassword={setPassword}
            setConfirmPassword={setConfirmPassword}
            errorMessage={errorMessage}
          />
        )}
        {step === 2 && (
          <Step2
            next={next}
            prev={prev}
            setBrandName={setBrandName}
            setFullName={setFullName}
            setContactNumber={setContactNumber}
            setServiceDescription={setServiceDescription}
            userType={userType}
            setUserType={setUserType}
            errorMessage={errorMessage}
          />
        )}
        {step === 3 && (
          <Step3
            submit={handleSignUp}
            prev={prev}
            handleFileChange={handleFileChange}
            setBrandLogo={setBrandLogo}
            setBusinessLicense={setBusinessLicense}
            setIdFile={setIdFile}
            setSelfie={setSelfie}
            userType={userType}
            errorMessage={errorMessage}
          />
        )}
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/signin" className="text-text-500">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;











