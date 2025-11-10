import React from 'react';
import ProductCard from './ProductCard';
import { Product, Seller, User } from '../types';

interface ProductFeedProps {
  products: Product[];
  sellers: Seller[];
  users: User[];
  onProductSelect: (product: Product) => void;
  onSellerSelect: (seller: Seller) => void;
}

const ProductFeed: React.FC<ProductFeedProps> = ({ products, sellers, users, onProductSelect, onSellerSelect }) => {
  if (products.length === 0) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-700">No Products Found</h2>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
      {products.map((product) => {
        let seller = sellers.find(s => s.id === product.sellerId);
        
        if (!seller) {
            const userAsSeller = users.find(u => u.id === product.sellerId);
            if (userAsSeller) {
                seller = {
                    id: userAsSeller.id,
                    name: userAsSeller.penName || userAsSeller.fullName,
                    isVerified: true, // Assume admin is verified
                    bannerUrl: '', // Not used in card
                };
            } else {
                 // Final fallback if user is also not found
                 seller = {
                    id: product.sellerId,
                    name: 'Unknown Seller',
                    isVerified: false,
                    bannerUrl: '',
                };
            }
        }

        return (
            <ProductCard 
                key={product.id} 
                product={product} 
                seller={seller} 
                onProductSelect={onProductSelect} 
                onSellerSelect={onSellerSelect} 
            />
        )
      })}
    </div>
  );
};

export default ProductFeed;
