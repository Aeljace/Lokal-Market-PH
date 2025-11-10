import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Courier } from '../types';

interface CourierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (courierData: Omit<Courier, 'id'>, courierId?: string) => Promise<boolean>;
  courier: Courier | null;
}

const CourierModal: React.FC<CourierModalProps> = ({ isOpen, onClose, onSave, courier }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (courier) {
      setFormData({
        name: courier.name,
        contactPerson: courier.contactPerson,
        phone: courier.phone,
        email: courier.email,
      });
    } else {
      setFormData({ name: '', contactPerson: '', phone: '', email: '' });
    }
  }, [courier, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.contactPerson || !formData.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    const success = await onSave(formData, courier?.id);
    setLoading(false);
    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={courier ? 'Edit Courier' : 'Add New Courier'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Company Name" name="name" value={formData.name} onChange={handleChange} required />
        <InputField label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
        <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} type="tel" required />
        <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
        
        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div className="pt-4 flex justify-end space-x-2">
            <button type="button" onClick={handleClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="bg-brand-blue text-white py-2 px-4 rounded-md font-semibold hover:bg-brand-blue/90 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Courier'}
            </button>
        </div>
      </form>
    </Modal>
  );
};

const InputField: React.FC<{
    label: string, 
    name: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    type?: string, 
    required?: boolean
}> = ({ label, name, value, onChange, type = "text", required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            required={required}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
        />
    </div>
);

export default CourierModal;