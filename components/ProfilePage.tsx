import React, { useState, useEffect } from 'react';
import { User, UserLocation } from '../types';

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

interface ProfilePageProps {
  user: User;
  onBack: () => void;
  onUpdateProfile: (updatedData: { 
      fullName: string; 
      penName?: string; 
      phone: string; 
      location: UserLocation;
      email: string;
  }) => Promise<boolean>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user.fullName,
        penName: user.penName || '',
        email: user.email,
        phone: user.phone,
        location: { ...user.location }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData({
            fullName: user.fullName,
            penName: user.penName || '',
            email: user.email,
            phone: user.phone,
            location: { ...user.location }
        });
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                [name]: value
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        // Create a payload with defined penName to avoid sending undefined
        const payload = {
            ...formData,
            penName: formData.penName || '',
        };
        const success = await onUpdateProfile(payload);
        setLoading(false);
        if (success) {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            fullName: user.fullName,
            penName: user.penName || '',
            email: user.email,
            phone: user.phone,
            location: { ...user.location }
        });
        setIsEditing(false);
    };

    const DetailItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || 'N/A'}</dd>
        </div>
    );
    
    const EditField: React.FC<{ label: string; name: string; value: string | undefined; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string }> = ({ label, name, value, onChange, type = "text" }) => (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
            <label htmlFor={name} className="text-sm font-medium text-gray-500">{label}</label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                    type={type}
                    name={name}
                    id={name}
                    value={value || ''}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
                />
            </div>
        </div>
    );

    return (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <button 
                onClick={onBack} 
                className="flex items-center text-brand-blue font-semibold mb-6 hover:underline"
                aria-label="Back to dashboard"
            >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to Dashboard
            </button>

            <div className="flex justify-between items-center border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-3xl font-bold leading-6 text-gray-900">My Profile</h1>
                    <p className="mt-2 max-w-4xl text-sm text-gray-500">
                        {isEditing ? "Update your personal account details." : "Your personal account details."}
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-blue/90 transition"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
          
            <div className="mt-6">
                {isEditing ? (
                    <div>
                        <div className="divide-y divide-gray-200">
                            <EditField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                            <EditField label="Pen Name" name="penName" value={formData.penName} onChange={handleInputChange} />
                            <EditField label="Email" name="email" value={formData.email} onChange={handleInputChange} type="email" />
                            <EditField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} type="tel" />
                            <EditField label="Address" name="address" value={formData.location.address} onChange={handleLocationChange} />
                            <EditField label="Barangay" name="barangay" value={formData.location.barangay} onChange={handleLocationChange} />
                            <EditField label="City" name="city" value={formData.location.city} onChange={handleLocationChange} />
                            <EditField label="Province" name="province" value={formData.location.province} onChange={handleLocationChange} />
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={handleCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} disabled={loading} className="bg-brand-blue text-white py-2 px-4 rounded-md font-semibold hover:bg-brand-blue/90 disabled:opacity-50">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <dl className="divide-y divide-gray-200">
                        <DetailItem label="Full Name" value={user.fullName} />
                        {user.penName && <DetailItem label="Pen Name" value={user.penName} />}
                        <DetailItem label="Email" value={user.email} />
                        <DetailItem label="Phone Number" value={user.phone} />
                        <DetailItem label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
                        <DetailItem label="Status" value={user.status.charAt(0).toUpperCase() + user.status.slice(1)} />
                        <DetailItem label="Join Date" value={new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {user.location.address}<br />
                                {user.location.barangay}<br />
                                {user.location.city}, {user.location.province}
                            </dd>
                        </div>
                    </dl>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
