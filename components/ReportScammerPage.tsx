import React, { useState, useEffect } from 'react';
import { User } from '../types';

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

interface ReportScammerPageProps {
  currentUser: User | null;
  onSubmit: (reportData: any, evidenceFiles: File[]) => Promise<boolean>;
  onBack: () => void;
  prefilledData?: { name: string; link: string } | null;
}

const ReportScammerPage: React.FC<ReportScammerPageProps> = ({ currentUser, onSubmit, onBack, prefilledData }) => {
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterEmail: '',
    scammerName: '',
    scammerProfileLink: '',
    issueType: '',
    description: '',
  });
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      reporterName: currentUser?.fullName || '',
      reporterEmail: currentUser?.email || '',
      scammerName: prefilledData?.name || '',
      scammerProfileLink: prefilledData?.link || '',
    }));
  }, [currentUser, prefilledData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidenceFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reporterName || !formData.reporterEmail || !formData.scammerName || !formData.issueType || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    const success = await onSubmit(formData, evidenceFiles);
    setLoading(false);
    if (success) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-center animate-fade-in">
             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mt-4">Report Submitted</h1>
            <p className="text-gray-600 mt-2">
                Thank you for your report. Our team will investigate this matter and take appropriate action. We will contact you via email if we need more information.
            </p>
            <button onClick={onBack} className="mt-6 bg-brand-blue text-white font-semibold px-6 py-2 rounded-lg hover:bg-brand-blue/90 transition">
                Back to Marketplace
            </button>
        </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto animate-fade-in">
        <button onClick={onBack} className="flex items-center text-brand-blue font-semibold mb-6 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Marketplace
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Report Fraudulent Activity</h1>
        <p className="text-gray-600 mb-6">Help us keep the community safe. Please provide as much detail as possible.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Your Name" name="reporterName" value={formData.reporterName} onChange={handleInputChange} required disabled={!!currentUser} />
                <InputField label="Your Email" name="reporterEmail" value={formData.reporterEmail} onChange={handleInputChange} required disabled={!!currentUser} type="email" />
            </div>
            <InputField label="Scammer's Name / Shop Name" name="scammerName" value={formData.scammerName} onChange={handleInputChange} placeholder="Enter the name you know them by" required />
            <InputField label="Link to Scammer's Profile or Product (Optional)" name="scammerProfileLink" value={formData.scammerProfileLink} onChange={handleInputChange} placeholder="https://..." type="url" />

            <div>
                <label htmlFor="issueType" className="block text-sm font-medium text-gray-700">Type of Issue</label>
                <select id="issueType" name="issueType" value={formData.issueType} onChange={handleInputChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md">
                    <option value="" disabled>Select an issue</option>
                    <option>Non-delivery of item</option>
                    <option>Received wrong/fake item</option>
                    <option>Misleading product description</option>
                    <option>Fraudulent payment request</option>
                    <option>Harassment or abusive behavior</option>
                    <option>Other</option>
                </select>
            </div>
            
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Detailed Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={6} required className="mt-1 block w-full p-2 border border-gray-300 shadow-sm focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md" placeholder="Please describe what happened in detail. Include dates, amounts, and any other relevant information."></textarea>
            </div>
            
             <div>
                <label className="block text-sm font-medium text-gray-700">Upload Evidence (Optional)</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400"/>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-blue hover:text-brand-purple focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-blue">
                                <span>Upload files</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                        {evidenceFiles.length > 0 && <p className="text-sm text-green-600 pt-2">{evidenceFiles.length} file(s) selected.</p>}
                    </div>
                </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            
            <div className="flex justify-end">
                <button type="submit" disabled={loading} className="w-full md:w-auto bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </div>
        </form>
    </div>
  );
};

const InputField: React.FC<{ label: string, name: string, value: string, onChange: (e: any) => void, type?: string, placeholder?: string, required?: boolean, disabled?: boolean }> = 
({ label, name, value, onChange, type = "text", placeholder, required = false, disabled = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-gray-100"
        />
    </div>
);

export default ReportScammerPage;
