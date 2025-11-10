import React, { useState } from 'react';
import { LOCATIONS } from '../constants';
import { User, VerificationDocs } from '../types';
import { auth, db, storage } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref as dbRef, set, serverTimestamp } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#F472B6', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#A78BFA', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <text fontFamily="Arial, Helvetica, sans-serif" fontSize="32" fontWeight="bold" fill="url(#logoGradient)" x="0" y="30">
            LocalMarket
        </text>
    </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M2.003 5.884L10 2.5l7.997 3.384A2 2 0 0019 7.616V16a2 2 0 01-2 2H3a2 2 0 01-2-2V7.616a2 2 0 001.003-1.732zM10 4.5l5.997 2.544-5.997 2.543L4.003 7.044 10 4.5zM3 8.711V16h14V8.711l-7 2.957-7-2.957z" />
  </svg>
);

const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5h-1.528a1.5 1.5 0 01-1.472-1.282A17.499 17.499 0 012.028 4.972 1.5 1.5 0 013.31 3.5H4.5A1.5 1.5 0 016 5c0 .39-.158.755-.412 1.037a.75.75 0 01-1.088.286l-.77-.513a17.487 17.487 0 00-1.8 3.426.75.75 0 01.286 1.088A1.51 1.51 0 015 14c.828 0 1.5-.672 1.5-1.5V3.5z" clipRule="evenodd" />
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);


interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onNavigate: (page: 'terms' | 'privacy') => void;
  onRegisterSuccess: (newUser: User) => void;
}

type DocFiles = {
    [K in keyof VerificationDocs]: File | null;
};

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin, onNavigate, onRegisterSuccess }) => {
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [formData, setFormData] = useState({
    fullName: '',
    penName: '',
    email: '',
    phone: '',
    password: '',
    province: '',
    city: '',
    barangay: '',
    address: '',
  });
  const [docFiles, setDocFiles] = useState<DocFiles>({
      validId: null,
      businessPermit: null,
      dtiRegistration: null,
      barangayClearance: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>, docType: keyof VerificationDocs) => {
      if (e.target.files && e.target.files[0]) {
          setDocFiles({ ...docFiles, [docType]: e.target.files[0] });
      }
  };

  // Helper function to upload a single document to Firebase Storage and get its public URL
  const uploadVerificationDocument = async (file: File, userId: string, docType: string): Promise<string> => {
    try {
        // Create a unique path for the document in storage for better organization
        const path = `verificationDocs/${userId}/${docType}-${file.name}`;
        const fileRef = storageRef(storage, path);
        
        // Upload the file
        await uploadBytes(fileRef, file);
        
        // Get the download URL to store in the database, which allows public access
        return await getDownloadURL(fileRef);
    } catch (error) {
        console.error(`Failed to upload document ${docType}:`, error);
        throw new Error(`Could not upload ${docType}. Please try again.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!docFiles.validId) {
        setError("Please upload a valid ID. It's required for all users.");
        return;
    }
    setLoading(true);
    
    try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // 2. Upload documents to Firebase Storage and collect the URLs
        const docUrls: VerificationDocs = { validId: null };
        
        for (const key of Object.keys(docFiles)) {
            const docType = key as keyof DocFiles;
            const file = docFiles[docType];
            if (file) {
                const url = await uploadVerificationDocument(file, user.uid, docType);
                docUrls[docType] = url;
            }
        }
        
        // 3. Create user profile object to save in Realtime Database
        const newUserProfileForDB = {
            fullName: formData.fullName,
            penName: formData.penName,
            email: formData.email,
            phone: formData.phone,
            role,
            location: {
                province: formData.province,
                city: formData.city,
                barangay: formData.barangay,
                address: formData.address,
            },
            verificationDocs: docUrls, // Save the URLs from cloud storage
            status: 'pending',
            joinDate: serverTimestamp(),
        };

        // Save the user profile to the database
        await set(dbRef(db, "users/" + user.uid), newUserProfileForDB);

        // Create user object for client state (with ISO string timestamp) to pass up
        const newUserProfileForState: User = {
            id: user.uid,
            fullName: formData.fullName,
            penName: formData.penName,
            email: formData.email,
            phone: formData.phone,
            role,
            location: {
                province: formData.province,
                city: formData.city,
                barangay: formData.barangay,
                address: formData.address,
            },
            verificationDocs: docUrls,
            status: 'pending',
            joinDate: new Date().toISOString(),
        };
        
        // 4. If user is a seller, create a public seller profile
        if (role === 'seller') {
            const newSellerProfile = {
                name: formData.penName || formData.fullName,
                isVerified: false,
                bannerUrl: `https://picsum.photos/seed/${user.uid}/1200/400`, // A unique default placeholder
            };
            await set(dbRef(db, "sellers/" + user.uid), newSellerProfile);
        }

        alert("Application submitted successfully! Your account will be reviewed by an administrator.");
        onRegisterSuccess(newUserProfileForState);

    } catch (err: any) {
        if (err.message?.startsWith('Could not upload')) {
            setError(err.message);
        } else if (err.code === 'auth/email-already-in-use') {
            setError('This email address is already registered.');
        } else if (err.code === 'auth/weak-password') {
            setError('Password should be at least 6 characters long.');
        } else {
            setError('An error occurred during registration. Please try again.');
            console.error(err);
        }
    } finally {
        setLoading(false);
    }
  }

  const FileInput: React.FC<{ label: string, docType: keyof DocFiles }> = ({ label, docType }) => (
    <div className="mt-2">
        <label htmlFor={docType} className="w-full text-left flex items-center justify-between rounded-lg border-2 border-dashed border-gray-300 p-3 text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
                <UploadIcon className="w-5 h-5" />
                <span className="text-sm font-semibold">{docFiles[docType]?.name || label}</span>
            </div>
            {docFiles[docType] && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
        </label>
        <input id={docType} type="file" className="hidden" onChange={(e) => handleDocChange(e, docType)} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
            <div className="text-center">
                <LogoIcon className="mx-auto h-12 w-auto" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Account</h2>
                <p className="mt-2 text-sm text-gray-600">Register as a <span className="font-bold">{role === 'buyer' ? 'Buyer' : 'Seller'}</span></p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-200 p-1">
                <button type="button" onClick={() => setRole('buyer')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${role === 'buyer' ? 'bg-white shadow text-brand-blue' : 'text-gray-600'}`}>
                    I'm a Buyer
                </button>
                <button type="button" onClick={() => setRole('seller')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${role === 'seller' ? 'bg-white shadow text-brand-blue' : 'text-gray-600'}`}>
                    I'm a Seller
                </button>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField icon={<UserIcon />} label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Juan Dela Cruz" id="full-name" />
                    <InputField icon={<UserIcon />} label="Pen Name / Nickname (Optional)" name="penName" value={formData.penName} onChange={handleInputChange} placeholder="Display name" id="pen-name" isRequired={false} />
                    <InputField icon={<MailIcon />} label="Email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@email.com" id="email" type="email" />
                    <InputField icon={<PhoneIcon />} label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+63 912 345 6789" id="phone" type="tel"/>
                    <InputField icon={<LockIcon />} label="Password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" id="password" type="password" />
                </div>
                
                <div>
                     <h3 className="text-lg font-semibold text-gray-800 flex items-center"><LocationIcon className="w-5 h-5 mr-2 text-gray-400" />Location Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <InputField label="Province" name="province" value={formData.province} onChange={handleInputChange} placeholder="e.g., Metro Manila" id="province" />
                        <InputField label="City/Municipality" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g., Quezon City" id="city" />
                        <InputField label="Barangay" name="barangay" value={formData.barangay} onChange={handleInputChange} placeholder="e.g., Barangay Commonwealth" id="barangay" />
                     </div>
                     <div className="mt-4">
                        <InputField label="Complete Address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Street, Building, etc." id="address" />
                     </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800">Verification Documents</h3>
                    <p className="text-sm text-blue-700 mt-1">Please upload a valid ID. This is required for all users.</p>
                    <FileInput label="Upload Valid ID" docType="validId" />
                </div>

                {role === 'seller' && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h3 className="font-semibold text-yellow-800">Seller Documents (Optional for Small Enterprise)</h3>
                        <p className="text-sm text-yellow-700 mt-1">Small enterprises without permits can still register.</p>
                        <FileInput label="Upload Business Permit" docType="businessPermit" />
                        <FileInput label="Upload DTI Registration" docType="dtiRegistration" />
                        <FileInput label="Upload Barangay Clearance" docType="barangayClearance" />
                    </div>
                )}
                
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                
                <div className="flex items-center">
                    <input id="terms" name="terms" type="checkbox" className="h-4 w-4 text-brand-blue focus:ring-brand-purple border-gray-300 rounded" required/>
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                        I agree to the <button type="button" onClick={() => onNavigate('terms')} className="font-medium text-brand-blue hover:underline">Terms & Conditions</button> and <button type="button" onClick={() => onNavigate('privacy')} className="font-medium text-brand-blue hover:underline">Privacy Policy</button>
                    </label>
                </div>

                <div>
                    <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue shadow-lg disabled:opacity-50">
                        {loading ? 'Submitting Application...' : 'Create Account'}
                    </button>
                </div>
            </form>
             <p className="text-sm text-center text-gray-600">
                Already have an account?{' '}
                <button type="button" onClick={onSwitchToLogin} className="font-medium text-brand-blue hover:underline">
                    Login here
                </button>
            </p>
        </div>
    </div>
  );
};

const InputField: React.FC<{
    icon?: React.ReactNode, 
    label: string, 
    id: string, 
    name: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type?: string, 
    placeholder?: string,
    isRequired?: boolean
}> = ({icon, label, id, name, value, onChange, type="text", placeholder, isRequired = true}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-400">{React.cloneElement(icon as React.ReactElement, { className: 'h-5 w-5' })}</span>
            </div>}
            <input 
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={isRequired}
                className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue transition-colors bg-white`}
                placeholder={placeholder}
            />
        </div>
    </div>
);


export default RegisterPage;