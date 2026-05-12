import React, { useState, useEffect } from "react";
import { ShoppingCart, Trash2, CreditCard } from "lucide-react";
import {
  getCartItems,
  removeFromCart,
  updateQuantityInCart,
  clearCart,
  CartItem,
} from "../lib/cart";

export function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadItems = () => setItems(getCartItems());
    loadItems();
    window.addEventListener("cart_updated", loadItems);
    return () => window.removeEventListener("cart_updated", loadItems);
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

  const getFallbackImage = (name: string) => {
    let emoji = '📦';
    if (name.includes('Maize')) emoji = '🌽';
    else if (name.includes('Rice')) emoji = '🍚';
    else if (name.includes('oil')) emoji = '🛢️';
    else if (name.includes('Tomatoes')) emoji = '🍅';
    else if (name.includes('Onions')) emoji = '🧅';
    else if (name.includes('Sugar')) emoji = '🧂';

    const svg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#f8fafc"/><circle cx="200" cy="150" r="60" fill="#2E7D32" opacity="0.1"/><text x="200" y="175" font-family="sans-serif" font-size="64" text-anchor="middle">${emoji}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[#2E7D32]/20 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[#4E342E]">
          <ShoppingCart className="w-8 h-8 p-1.5 bg-[#FF8F00] text-[#4E342E] rounded-lg shadow-md" />
          My Cart
        </h1>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm text-red-600 hover:text-red-500 font-medium transition-colors"
          >
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <ShoppingCart className="w-16 h-16 text-[#4E342E]/30 mx-auto" />
          <p className="text-[#4E342E]/70 text-lg font-medium">
            Your cart is empty.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-[#2E7D32]/20 gap-4 hover:border-[#2E7D32]/40 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {item.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackImage(item.name);
                          e.currentTarget.onerror = null;
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-[#4E342E]">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[#4E342E]/60">
                      Seller: {item.sellerId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdate(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAFAFA] border border-[#2E7D32]/20 hover:bg-[#FFF8E7] text-[#4E342E] font-medium transition-colors"
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-bold text-[#4E342E]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdate(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAFAFA] border border-[#2E7D32]/20 hover:bg-[#FFF8E7] text-[#4E342E] font-medium transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-[#FF8F00]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-[#4E342E]/60 font-mono">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-[#4E342E]/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 mt-8 border border-[#2E7D32]/20 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#4E342E]/70 font-bold uppercase tracking-widest text-sm">
                Subtotal
              </span>
              <span className="text-3xl font-bold text-[#2E7D32]">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <button className="w-full bg-[#FF8F00] hover:bg-[#e68100] text-[#4E342E] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
              <CreditCard className="w-5 h-5" />
              Proceed to Checkout
            </button>
            <p className="text-center text-xs text-[#4E342E]/60 mt-4 font-medium uppercase tracking-widest">
              Items will sync when you are back online.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
