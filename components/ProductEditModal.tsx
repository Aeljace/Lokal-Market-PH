import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Product, ProductData, User, Location } from '../types';
import { storage } from './firebaseConfig';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: ProductData, productId?: string) => Promise<boolean>;
  product: Product | null;
  user: User;
}

// Helper function to upload images to Firebase Storage
const uploadImages = async (files: File[], userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of files) {
        try {
            const fileRef = storageRef(storage, `productImages/${userId}/${Date.now()}-${file.name}`);
            await uploadBytes(fileRef, file);
            const downloadUrl = await getDownloadURL(fileRef);
            uploadedUrls.push(downloadUrl);
        } catch (error) {
            console.error(`Failed to upload image ${file.name}:`, error);
            throw new Error(`Failed to upload image: ${file.name}`); 
        }
    }
    return uploadedUrls;
};


const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, onClose, onSave, product, user }) => {
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '' });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditMode = product !== null;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          stock: product.stock.toString(),
        });
        setImageUrls(product.imageUrls || []);
      } else {
        setFormData({ name: '', description: '', price: '', stock: '1' });
        setImageUrls([]);
      }
      // Reset files and previews on open
      setNewImageFiles([]);
      setImagePreviews([]);
      setError('');
    }
  }, [product, isEditMode, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewImageFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file as Blob));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    // Note: This only removes the URL from the list to be saved.
    // It does not delete from Firebase Storage until save. A more robust implementation might.
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => {
        const urlToRevoke = prev[indexToRemove];
        if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
        return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.description || formData.price === '' || !formData.stock || (imageUrls.length + newImageFiles.length === 0)) {
        setError('Please fill out all fields and provide at least one image.');
        return;
    }
    setLoading(true);

    try {
        // Step 1: Upload any new images to Firebase Storage
        const newUploadedUrls = await uploadImages(newImageFiles, user.id);
        
        // Step 2: Combine existing and newly uploaded image URLs
        const finalImageUrls = [...imageUrls, ...newUploadedUrls];
        
        // Step 3: Prepare the final product data object
        const finalProductData: ProductData = {
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            stock: Number(formData.stock),
            imageUrls: finalImageUrls,
            location: product?.location || {
                province: user.location.province,
                city: user.location.city,
                barangay: user.location.barangay,
            },
        };

        // Step 4: Save the product data (with image URLs) to the database
        const success = await onSave(finalProductData, product?.id);

        if (success) {
            onClose(); // On success, close the modal immediately.
        } else {
            setError('Could not save product. Please try again.');
            setLoading(false);
        }
    } catch (err: any) {
        setError(err.message || "An error occurred during image upload. Please try again.");
        console.error(err);
        setLoading(false); // On exception, keep modal open and show error.
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Product' : 'Add New Product'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Product Name" name="name" value={formData.name} onChange={handleInputChange} />
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" />
        </div>
        <InputField label="Price (₱)" name="price" value={formData.price} onChange={handleInputChange} type="number" />
        <InputField label="Stock Quantity" name="stock" value={formData.stock} onChange={handleInputChange} type="number" />
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {imageUrls.map((url, index) => (
              <ImageThumbnail key={url} src={url} onRemove={() => removeExistingImage(index)} />
            ))}
            {imagePreviews.map((preview, index) => (
              <ImageThumbnail key={preview} src={preview} onRemove={() => removeNewImage(index)} />
            ))}
             <div className="aspect-square flex items-center justify-center border-2 border-dashed rounded-lg">
                <label htmlFor="image-upload" className="cursor-pointer text-gray-400 hover:text-brand-blue p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="pt-2 flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="bg-brand-blue text-white py-2 px-4 rounded-md font-semibold hover:bg-brand-blue/90 disabled:opacity-50 min-w-[120px]">
            {loading ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add Product')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const InputField: React.FC<{ label: string, name: string, value: string, onChange: (e: any) => void, type?: string }> = ({ label, name, value, onChange, type = "text" }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <input type={type} id={name} name={name} value={value} onChange={onChange} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" required />
    </div>
);

const ImageThumbnail: React.FC<{ src: string, onRemove: () => void }> = ({ src, onRemove }) => (
    <div className="relative aspect-square">
        <img src={src} alt="Product preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
        <button type="button" onClick={onRemove} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold leading-none">&times;</button>
    </div>
);

export default ProductEditModal;