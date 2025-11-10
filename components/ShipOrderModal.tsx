import React, { useState } from 'react';
import Modal from './Modal';
import { Order } from '../types';

interface ShipOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onConfirmShipment: (orderId: string, courierName: string, trackingNumber: string) => void;
}

const ShipOrderModal: React.FC<ShipOrderModalProps> = ({ isOpen, onClose, order, onConfirmShipment }) => {
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierName.trim()) {
      setError('Courier name is required.');
      return;
    }
    setError('');
    onConfirmShipment(order.id, courierName, trackingNumber);
  };
  
  const handleClose = () => {
      setCourierName('');
      setTrackingNumber('');
      setError('');
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ship Order">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">Enter the shipping details for order <span className="font-bold font-mono">#{order.id.substring(0, 7)}...</span></p>
        <div>
          <label htmlFor="courier-name" className="block text-sm font-medium text-gray-700">Courier Name</label>
          <input
            type="text"
            id="courier-name"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            required
            placeholder="e.g., LBC, J&T Express"
          />
        </div>
        <div>
          <label htmlFor="tracking-number" className="block text-sm font-medium text-gray-700">Tracking Number (Optional)</label>
          <input
            type="text"
            id="tracking-number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue"
            placeholder="e.g., 1234567890"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="pt-4 flex justify-end space-x-3">
          <button type="button" onClick={handleClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button
            type="submit"
            className="bg-brand-blue text-white py-2 px-4 rounded-md font-semibold hover:bg-brand-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
          >
            Confirm Shipment
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ShipOrderModal;