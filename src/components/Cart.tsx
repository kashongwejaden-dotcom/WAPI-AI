import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, CreditCard } from 'lucide-react';
import { getCartItems, removeFromCart, updateQuantityInCart, clearCart, CartItem } from '../lib/cart';

export function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadItems = () => setItems(getCartItems());
    loadItems();
    window.addEventListener('cart_updated', loadItems);
    return () => window.removeEventListener('cart_updated', loadItems);
  }, []);

  const handleRemove = (id: string) => {
    removeFromCart(id);
  };

  const handleUpdate = (id: string, delta: number) => {
    updateQuantityInCart(id, delta);
  };

  const handleClear = () => {
    clearCart();
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-emerald-500" />
          My Cart
        </h1>
        {items.length > 0 && (
          <button 
            onClick={handleClear}
            className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors"
          >
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto" />
          <p className="text-slate-500 text-lg">Your cart is empty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900 rounded-xl shadow-sm border border-slate-800 gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-200">{item.name}</h3>
                  <p className="text-sm text-slate-500">Seller: {item.sellerId}</p>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleUpdate(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                    >-</button>
                    <span className="w-4 text-center font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdate(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                    >+</button>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <p className="font-semibold text-slate-200">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-slate-500">${item.price.toFixed(2)} each</p>
                  </div>

                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-xl p-6 mt-8 border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-400 font-medium">Subtotal</span>
              <span className="text-2xl font-bold text-slate-200">${totalPrice.toFixed(2)}</span>
            </div>
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <CreditCard className="w-5 h-5" />
              Proceed to Checkout
            </button>
            <p className="text-center text-sm text-slate-500 mt-3">
              Items will sync when you are back online.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
