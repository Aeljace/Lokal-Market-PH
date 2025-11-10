import React, { useState } from 'react';
import Modal from './Modal';
import { ProductData, User } from '../types';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: ProductData[]) => void;
  user: User;
}

const ProductImportModal: React.FC<ProductImportModalProps> = ({ isOpen, onClose, onImport, user }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ProductData[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
      parseCSV(selectedFile);
    } else {
      setFile(null);
      setParsedProducts([]);
      setError('Please select a valid .csv file.');
    }
  };

  const parseCSV = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        setError('CSV file is empty or has no data rows.');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['name', 'description', 'price', 'stock'];
      if (!requiredHeaders.every(h => headers.includes(h))) {
        setError(`CSV must contain the following headers: ${requiredHeaders.join(', ')}.`);
        return;
      }

      const products: ProductData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const name = values[headers.indexOf('name')]?.trim();
        const description = values[headers.indexOf('description')]?.trim();
        const priceStr = values[headers.indexOf('price')]?.trim();
        const price = Number(priceStr);
        const stockStr = values[headers.indexOf('stock')]?.trim();
        const stock = Number(stockStr);

        if (name && description && !isNaN(price) && price > 0 && !isNaN(stock) && stock >= 0) {
          products.push({
            name,
            description,
            price,
            stock,
            imageUrls: [], // Images must be added manually after import
            location: {
                province: user.location.province,
                city: user.location.city,
                barangay: user.location.barangay,
            },
          });
        }
      }
      setParsedProducts(products);
    };
    reader.readAsText(csvFile);
  };

  const handleImportClick = () => {
    if (parsedProducts.length > 0) {
      onImport(parsedProducts);
    } else {
      setError('No valid products to import. Please check your file.');
    }
  };
  
  const downloadTemplate = () => {
      const csvContent = "data:text/csv;charset=utf-8,name,description,price,stock\nMy Awesome Product,This is a great product.,199.99,10\nAnother Cool Item,You should buy this!,49.50,5";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "product_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Products from CSV">
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p>Upload a CSV file with columns: <strong>name, description, price, stock</strong>.</p>
          <p>Images cannot be imported and must be added manually after upload.</p>
          <button onClick={downloadTemplate} className="font-semibold text-brand-blue hover:underline mt-1">Download Template</button>
        </div>
        
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100"
        />
        
        {file && parsedProducts.length > 0 && (
          <div className="text-center p-3 bg-green-50 text-green-800 rounded-md">
            Found <strong>{parsedProducts.length}</strong> valid products to import.
          </div>
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleImportClick}
            disabled={!file || parsedProducts.length === 0}
            className="bg-brand-blue text-white py-2 px-4 rounded-md font-semibold hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import {parsedProducts.length > 0 ? parsedProducts.length : ''} Products
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductImportModal;