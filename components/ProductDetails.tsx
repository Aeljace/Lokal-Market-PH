import React, { useState } from 'react';
import { Product, User, ReviewDetail, Seller } from '../types';
import Reviews from './Reviews';
import ChatModal from './ChatModal';
import ConfirmationModal from './ConfirmationModal';

// Reusable icons for consistency
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

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

interface ProductDetailsProps {
  product: Product;
  seller?: Seller;
  onBack: () => void;
  currentUser: User | null;
  onLoginClick: () => void;
  onMarkAsSold: (product: Product, quantity: number) => void;
  onSellerSelect: (seller: Seller) => void;
  onSendMessage: (sellerId: string, messageText: string) => void;
  onReportSeller: (seller: Seller) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, seller, onBack, currentUser, onLoginClick, onMarkAsSold, onSellerSelect, onSendMessage, onReportSeller }) => {
  const [quantity, setQuantity] = useState(1);
  const [currentReviews, setCurrentReviews] = useState<ReviewDetail[]>(product.reviews || []);
  const [mainImage, setMainImage] = useState(product.imageUrls?.[0] || 'https://via.placeholder.com/600');
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  
  const imageUrls = product.imageUrls || [];

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  };
  
  const handleBuyNow = () => {
    if (!currentUser) {
        onLoginClick();
        return;
    }
    if (currentUser.id === product.sellerId) {
        alert("You cannot buy your own product.");
        return;
    }
    if (currentUser.role !== 'buyer') {
        alert("Only buyers can purchase products.");
        return;
    }
     if (product.stock <= 0) {
        alert("This product is out of stock.");
        return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirmPurchase = () => {
    setConfirmModalOpen(false);
    onMarkAsSold(product, quantity);
  };


  const handleReviewSubmit = (review: { rating: number; comment: string }) => {
    if (!currentUser) return; // Should not happen if form is disabled, but good practice
    
    const newReview: ReviewDetail = {
      id: (currentReviews.length + 100).toString(), // mock ID
      author: currentUser.fullName,
      rating: review.rating,
      comment: review.comment,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };
    
    setCurrentReviews([newReview, ...currentReviews]);
  };
  
  if (!seller) {
    return <div>Loading seller information...</div>;
  }

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg animate-fade-in">
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="flex items-center text-brand-blue font-semibold mb-6 hover:underline"
        aria-label="Back to marketplace"
      >
        <ChevronLeftIcon className="w-5 h-5 mr-1" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image Gallery */}
        <div>
          <div className="mb-4 aspect-square">
            <img 
              src={mainImage} 
              alt={product.name} 
              className="w-full h-full object-cover rounded-lg shadow-md bg-gray-200" 
            />
          </div>
          {imageUrls.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {imageUrls.map((url, index) => (
                <button 
                  key={index} 
                  onClick={() => setMainImage(url)} 
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${mainImage === url ? 'border-brand-blue ring-2 ring-brand-blue' : 'border-gray-200 hover:border-brand-blue'}`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={url} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-dark-gray">{product.name}</h1>
          
          <div className="flex items-center mt-2 text-gray-600">
            <span className="text-sm">Sold by</span>
            <button onClick={() => onSellerSelect(seller)} className="font-semibold ml-2 text-brand-blue hover:underline cursor-pointer">
                {seller.name}
            </button>
            {seller.isVerified && (
              <span title="Legit Vendor" className="ml-1.5 text-blue-500 flex items-center">
                  <VerifiedIcon className="w-5 h-5" />
              </span>
            )}
            <button onClick={() => onReportSeller(seller)} className="ml-4 text-xs text-gray-500 hover:text-red-600 hover:underline">Report Seller</button>
          </div>
          
          <p className="text-xs text-gray-400 mt-1">{product.location.city}, {product.location.province}</p>

          <div className="flex items-center mt-4 text-gray-700">
            <StarIcon className="w-6 h-6 text-yellow-400" />
            <span className="ml-2 text-xl font-bold">{product.reviewSummary.rating.toFixed(1)}</span>
            <span className="ml-2 text-gray-500">({product.reviewSummary.count} reviews)</span>
          </div>

          <p className="text-4xl font-bold text-secondary my-4">
            ₱{product.price.toLocaleString()}
          </p>
          
           <div className="my-2">
                {product.stock > 0 ? (
                    <p className={`font-semibold ${product.stock <= 5 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                        {product.stock <= 5 ? `Only ${product.stock} left in stock!` : `${product.stock} available`}
                    </p>
                ) : (
                    <p className="font-bold text-red-600">Out of Stock</p>
                )}
            </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label htmlFor="quantity-selector" className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div id="quantity-selector" className="flex items-center border border-gray-300 rounded-lg w-fit">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="px-4 py-2 text-lg font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-5 py-2 text-lg font-semibold text-dark-gray w-16 text-center" aria-live="polite">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= product.stock}
                className="px-4 py-2 text-lg font-semibold text-gray-600 hover:bg-gray-100 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-auto space-y-4">
             <button 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold text-lg hover:bg-brand-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
              {product.stock <= 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
            <button 
                onClick={() => setChatModalOpen(true)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-bold text-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Chat with Seller
            </button>
          </div>
        </div>
      </div>
      
      {/* Description Section */}
      <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold text-dark-gray mb-4">Product Description</h2>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
      </div>

      {/* Seller Information Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold text-dark-gray mb-4">About the Seller</h2>
        <div className="flex items-center justify-between bg-light-gray p-4 rounded-lg">
            <div>
                <button
                    type="button"
                    onClick={() => onSellerSelect(seller)}
                    className="font-bold text-lg text-dark-gray hover:text-brand-blue transition-colors text-left"
                >
                    {seller.name}
                </button>
                {seller.isVerified ? (
                    <div className="flex items-center text-sm text-blue-600 font-semibold mt-1">
                        <VerifiedIcon className="w-4 h-4 mr-1" />
                        <span>Legit Vendor</span>
                    </div>
                ) : (
                     <p className="text-sm text-gray-500 mt-1">Small Enterprise – No Business Permit</p>
                )}
            </div>
            <button 
                onClick={() => onSellerSelect(seller)}
                className="border border-brand-blue text-brand-blue font-semibold px-4 py-2 rounded-lg hover:bg-brand-blue/10 transition-colors"
            >
                View Seller Profile
            </button>
        </div>
        <div className="mt-4 p-4 border-l-4 border-yellow-400 bg-yellow-50 text-sm text-yellow-800">
            <p className="font-bold mb-2">Our Commitment to Safety</p>
            <p>For your security, we thoroughly check our sellers. Verified sellers have submitted documents such as a Barangay Clearance, Business Permit/DTI, and a Valid ID. Additionally, all product listings are subject to approval by our team before they are posted.</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <Reviews 
            reviews={currentReviews} 
            currentUser={currentUser} 
            onSubmitReview={handleReviewSubmit}
            onLoginClick={onLoginClick}
        />
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setChatModalOpen(false)}
        seller={seller}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
      />
      
      {/* Confirmation Modal for Purchase */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmPurchase}
        title="Finalize Purchase?"
        confirmText="Yes, Mark as Sold"
        confirmColor="bg-primary hover:bg-green-700"
      >
        <p className="text-sm text-gray-600">
            This action will finalize the purchase and generate a commission fee for the seller.
        </p>
        <p className="font-bold text-gray-800 mt-2">This cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
};

export default ProductDetails;