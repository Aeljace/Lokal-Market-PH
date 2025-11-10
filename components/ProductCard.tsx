import React from 'react';
import { Product, Seller } from '../types';

// Icons defined within the component file
const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const VerifiedIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44-1.22l-4.25 4.25a.75.75 0 01-1.06 0L6.38 4.44a.75.75 0 011.06-1.06l1.97 1.97 3.72-3.72a.75.75 0 111.06 1.06z" clipRule="evenodd" />
    </svg>
);


interface ProductCardProps {
  product: Product;
  seller: Seller;
  onProductSelect: (product: Product) => void;
  onSellerSelect: (seller: Seller) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, seller, onProductSelect, onSellerSelect }) => {
  const imageUrl = product.imageUrls?.[0] || 'https://via.placeholder.com/300';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group transform hover:-translate-y-1 transition-all duration-300">
      <div 
        className="relative cursor-pointer"
        onClick={() => onProductSelect(product)}
        role="button"
        aria-label={`View details for ${product.name}`}
      >
        <img src={imageUrl} alt={product.name} className="w-full h-48 object-cover bg-gray-200" />
        <div className="absolute top-2 right-2 bg-secondary/90 text-white text-sm font-bold px-2 py-1 rounded-full">
          ₱{product.price.toLocaleString()}
        </div>
        {product.stock <= 0 && (
            <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs font-bold px-2 py-1 rounded-full">
                OUT OF STOCK
            </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-2 left-2 bg-red-600/90 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                LOW STOCK
            </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-dark-gray truncate group-hover:text-primary transition-colors">{product.name}</h3>
        
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <button
            onClick={() => onSellerSelect(seller)}
            className="hover:underline hover:text-brand-blue focus:outline-none"
            aria-label={`View profile for ${seller.name}`}
          >
            {seller.name}
          </button>
          {seller.isVerified && (
            <span title="Legit Vendor" className="ml-1 text-blue-500 flex items-center">
                <VerifiedIcon className="w-4 h-4" />
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">{product.location.city}, {product.location.province}</p>
        
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <StarIcon className="w-5 h-5 text-yellow-400" />
          <span className="ml-1 font-bold">{product.reviewSummary.rating.toFixed(1)}</span>
          <span className="ml-2 text-gray-400">({product.reviewSummary.count} reviews)</span>
        </div>
        
        <div className="mt-auto pt-4">
             <button 
                onClick={() => onProductSelect(product)}
                className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-label={`View details for ${product.name}`}
            >
                View Product
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;