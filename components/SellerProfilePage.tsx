import React from 'react';
import { Seller, Product, ReviewDetail } from '../types';
import ProductCard from './ProductCard';

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const VerifiedIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44-1.22l-4.25 4.25a.75.75 0 01-1.06 0L6.38 4.44a.75.75 0 011.06-1.06l1.97 1.97 3.72-3.72a.75.75 0 111.06 1.06z" clipRule="evenodd" />
    </svg>
);

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


interface SellerProfilePageProps {
  seller: Seller;
  products: Product[];
  sellers: Seller[];
  onProductSelect: (product: Product) => void;
  onBack: () => void;
  onSellerSelect: (seller: Seller) => void;
  onReportSeller: (seller: Seller) => void;
}

const SellerProfilePage: React.FC<SellerProfilePageProps> = ({ seller, products, sellers, onProductSelect, onBack, onSellerSelect, onReportSeller }) => {
    
    const sellerProducts = products.filter(p => p.sellerId === seller.id && p.status === 'available');
    
    const allReviews = products
        .filter(p => p.sellerId === seller.id)
        .flatMap(p => (p.reviews || []).map(r => ({ ...r, productName: p.name })));

    return (
        <div className="bg-white rounded-lg shadow-lg animate-fade-in overflow-hidden">
            {/* Back Button */}
            <div className="p-4 sm:p-6">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-brand-blue font-semibold hover:underline"
                    aria-label="Back to marketplace"
                >
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Back to Marketplace
                </button>
            </div>
            
            {/* Banner */}
            <div className="h-48 md:h-64 bg-gray-200">
                <img src={seller.bannerUrl} alt={`${seller.name} banner`} className="w-full h-full object-cover" />
            </div>

            {/* Seller Info */}
            <div className="p-4 sm:p-6 border-b">
                <div className="flex justify-between items-start">
                    <div className="flex items-center">
                        <h1 className="text-3xl font-bold text-gray-800">{seller.name}</h1>
                        {seller.isVerified && (
                            <div className="ml-3 flex items-center space-x-1 text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                <VerifiedIcon className="w-5 h-5" />
                                <span>Legit Vendor</span>
                            </div>
                        )}
                    </div>
                     <button 
                        onClick={() => onReportSeller(seller)}
                        className="text-xs font-semibold text-gray-500 hover:text-red-600 border border-gray-300 hover:border-red-500 px-3 py-1 rounded-full transition-colors"
                    >
                        Report this Seller
                    </button>
                </div>
            </div>

            {/* Products Section */}
            <div className="p-4 sm:p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Products from this Seller</h2>
                {sellerProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {sellerProducts.map(product => {
                            const productSeller = sellers.find(s => s.id === product.sellerId);
                            if (!productSeller) return null;
                            return <ProductCard key={product.id} product={product} seller={productSeller} onProductSelect={onProductSelect} onSellerSelect={onSellerSelect}/>
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50">
                        <p className="text-gray-500 font-semibold">This seller has no available products right now.</p>
                        <p className="text-sm text-gray-400 mt-1">Check back later for new items!</p>
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <div className="p-4 sm:p-6 border-t mt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Seller Reviews</h2>
                <div className="space-y-6">
                    {allReviews.length > 0 ? (
                        allReviews.map((review) => (
                            <div key={review.id} className="border-b pb-6 last:border-b-0">
                                <div className="flex items-center mb-2">
                                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-3">
                                        {review.author.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-dark-gray">{review.author}</p>
                                        <p className="text-xs text-gray-500">
                                            Reviewed <span className="font-medium text-gray-700">{review.productName}</span> on {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center my-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <StarIcon key={star} className="w-5 h-5 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50">
                            <p className="text-gray-500 font-semibold">No reviews for this seller yet.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default SellerProfilePage;