import React, { useState } from 'react';
import Modal from './Modal';
import { Commission } from '../types';

interface CommissionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  commission: Commission;
  onConfirmPayment: (commissionId: string, paymentProofFile: File) => Promise<boolean>;
}

const QR_PH_IMAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/local-market-ph.firebasestorage.app/o/code_GTwosyQ4jGedyCyERDnsZN76.jpg?alt=media&token=f258dae4-f842-4fc0-9f85-4c01d8898c53';
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


const CommissionPaymentModal: React.FC<CommissionPaymentModalProps> = ({ 
    isOpen, 
    onClose, 
    commission, 
    onConfirmPayment,
}) => {
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('File size must be under 5MB.');
            return;
        }
        setPaymentProof(file);
        setError('');
    }
  };

  const handleSubmit = async () => {
    if (!paymentProof) {
        setError('Please upload a proof of payment.');
        return;
    }
    setLoading(true);
    setError('');
    const success = await onConfirmPayment(commission.id, paymentProof);
    setLoading(false);
    if (!success) {
        setError('Submission failed. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pay Commission & Upload Proof">
      <div className="p-2 space-y-4">
        
        <div className="flex justify-center">
            <img 
                src={QR_PH_IMAGE_URL} 
                alt="QR PH Payment Code" 
                className="rounded-lg shadow-lg w-full max-w-xs" 
            />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-200">
            <p className="font-bold mb-2 text-base">Payment Instructions:</p>
            <ol className="list-decimal list-inside text-left space-y-1">
                <li>Use your banking/e-wallet app to scan the QR code.</li>
                <li>Pay the commission amount: <span className="font-bold">₱{commission.amount.toFixed(2)}</span></li>
                <li>Take a screenshot of the successful transaction.</li>
                <li>Upload the screenshot below as proof of payment.</li>
            </ol>
        </div>

        <div>
            <label htmlFor="payment-proof-upload" className="w-full text-left flex items-center justify-between rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                    <UploadIcon className="w-6 h-6" />
                    <span className="text-sm font-semibold">{paymentProof?.name || 'Upload Proof of Payment'}</span>
                </div>
                {paymentProof && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
            </label>
            <input id="payment-proof-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" />
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        
        <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-4 rounded-md font-bold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-md disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default CommissionPaymentModal;