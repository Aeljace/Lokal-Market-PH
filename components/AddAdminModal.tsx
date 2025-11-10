import React, { useState } from 'react';
import Modal from './Modal';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmin: (adminData: { fullName: string; email: string; phone: string }) => void;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose, onAddAdmin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !phone || !password) {
      setError('Please fill out all fields.');
      return;
    }
    // In a real app, password would be handled securely
    onAddAdmin({ fullName, email, phone });
    // Reset fields for next time
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    onClose(); // Close modal on success
  };

  // Reset form when modal is closed
  const handleClose = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Admin">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            id="admin-fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            required
            placeholder="e.g., Jane Doe"
          />
        </div>
        <div>
          <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            id="admin-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            required
            placeholder="admin@example.com"
          />
        </div>
         <div>
          <label htmlFor="admin-phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            id="admin-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            required
            placeholder="+639..."
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">Temporary Password</label>
          <input
            type="password"
            id="admin-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            required
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-brand-blue text-white py-2 px-4 rounded-md font-semibold hover:bg-brand-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
        >
          Add Admin User
        </button>
      </form>
    </Modal>
  );
};

export default AddAdminModal;
