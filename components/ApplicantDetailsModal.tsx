import React from 'react';
import Modal from './Modal';
import { User, UserStatus } from '../types';

interface ApplicantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateStatus: (userId: string, newStatus: UserStatus) => void;
}

const CheckIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);


const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({ isOpen, onClose, user, onUpdateStatus }) => {
  if (!user) return null;

  const DetailItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800 capitalize">{value || 'N/A'}</p>
    </div>
  );
  
  const DocumentItem: React.FC<{ docName: string; fileUrl: string | null | undefined }> = ({ docName, fileUrl }) => (
      <li className="flex items-center justify-between py-3 border-b last:border-b-0">
        <div className="flex items-center">
            {fileUrl ? <CheckIcon className="text-green-500 mr-3 flex-shrink-0" /> : <XIcon className="text-red-500 mr-3 flex-shrink-0" />}
            <span className="text-gray-700 font-medium">{docName}</span>
        </div>
        {fileUrl ? (
            <a 
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brand-blue hover:underline bg-blue-50 px-3 py-1 rounded-md border border-blue-200 transition-colors"
            >
                View Document
            </a>
        ) : (
            <span className="text-sm font-medium text-gray-400">Not Submitted</span>
        )}
      </li>
  );

  const getActionButtons = () => {
    const commonButtonStyles = "px-6 py-2 rounded-lg font-semibold transition-colors";
    
    switch (user.status) {
        case 'pending':
            return (
                <>
                    <button onClick={() => onUpdateStatus(user.id, 'rejected')} className={`${commonButtonStyles} bg-red-100 text-red-700 hover:bg-red-200`}>Reject</button>
                    <button onClick={() => onUpdateStatus(user.id, 'approved')} className={`${commonButtonStyles} bg-green-600 text-white hover:bg-green-700`}>Approve</button>
                </>
            );
        case 'approved':
             return <button onClick={() => onUpdateStatus(user.id, 'suspended')} className={`${commonButtonStyles} bg-yellow-500 text-white hover:bg-yellow-600`}>Suspend</button>;
        case 'rejected':
             return <button onClick={() => onUpdateStatus(user.id, 'approved')} className={`${commonButtonStyles} bg-green-600 text-white hover:bg-green-700`}>Re-Approve</button>;
        case 'suspended':
             return <button onClick={() => onUpdateStatus(user.id, 'approved')} className={`${commonButtonStyles} bg-blue-600 text-white hover:bg-blue-700`}>Re-instate Account</button>;
        default:
            return null;
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Applicant & Documents">
      <div className="space-y-6">
        {/* User Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-lg text-dark-gray mb-3">{user.fullName}</h3>
            <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Role" value={user.role} />
                <DetailItem label="Status" value={user.status} />
                <DetailItem label="Email" value={user.email} />
                <DetailItem label="Phone" value={user.phone} />
                <DetailItem label="Location" value={`${user.location.city}, ${user.location.province}`} />
                <DetailItem label="Join Date" value={new Date(user.joinDate).toLocaleDateString()} />
            </div>
        </div>

        {/* Documents */}
        <div>
            <h3 className="font-semibold text-gray-800 mb-2">Submitted Documents</h3>
            <ul className="border rounded-lg bg-gray-50/50 p-2">
                <DocumentItem docName="Valid ID" fileUrl={user.verificationDocs?.validId} />
                {user.role === 'seller' && (
                    <>
                        <DocumentItem docName="Business Permit" fileUrl={user.verificationDocs?.businessPermit} />
                        <DocumentItem docName="DTI Registration" fileUrl={user.verificationDocs?.dtiRegistration} />
                        <DocumentItem docName="Barangay Clearance" fileUrl={user.verificationDocs?.barangayClearance} />
                    </>
                )}
            </ul>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            {getActionButtons()}
        </div>
      </div>
    </Modal>
  );
};

export default ApplicantDetailsModal;