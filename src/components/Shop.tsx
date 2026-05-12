import React from 'react';
import { Store, Plus } from 'lucide-react';
import { addToCart } from '../lib/cart';

const mockProducts = [
  { id: '1', name: 'Maize flour', category: 'grain', price: 2.50, location: 'Kinshasa', sellerId: 'seller_001' },
  { id: '2', name: 'Rice', category: 'grain', price: 3.20, location: 'Kinshasa', sellerId: 'seller_002' },
  { id: '3', name: 'Cooking oil', category: 'oil', price: 4.00, location: 'Kinshasa', sellerId: 'seller_001' },
  { id: '4', name: 'Tomatoes', category: 'vegetable', price: 1.80, location: 'Lubumbashi', sellerId: 'seller_003' },
  { id: '5', name: 'Onions', category: 'vegetable', price: 1.50, location: 'Lubumbashi', sellerId: 'seller_003' },
  { id: '6', name: 'Sugar', category: 'grocery', price: 2.90, location: 'Kinshasa', sellerId: 'seller_004' }
];

export function Shop() {
  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      sellerId: product.sellerId
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-200 flex items-center gap-2">
          <Store className="w-6 h-6 text-emerald-500" />
          Marketplace
        </h2>
        <p className="text-slate-400 text-[10px] font-mono tracking-widest mt-1 uppercase">Browse products and add them to your cart.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockProducts.map((product) => (
          <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col hover:border-slate-700 transition-colors">
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-200 text-lg">{product.name}</h3>
                <span className="text-emerald-400 font-mono font-bold">${product.price.toFixed(2)}</span>
              </div>
              <div className="space-y-1 mb-6">
                <p className="text-xs text-slate-500 font-mono uppercase">Category: {product.category}</p>
                <p className="text-xs text-slate-500 font-mono uppercase">Location: {product.location}</p>
                <p className="text-xs text-slate-500 font-mono uppercase">Seller: {product.sellerId}</p>
              </div>
            </div>
            
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors group"
            >
              <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
