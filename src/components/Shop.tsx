import React from "react";
import { Store, Plus } from "lucide-react";
import { addToCart } from "../lib/cart";

const mockProducts = [
  {
    id: "1",
    name: "Maize flour",
    category: "grain",
    price: 2.5,
    location: "Kinshasa",
    sellerId: "seller_001",
    description:
      "Fine-milled white maize flour, perfect for making fufu or ugali.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Cornmeal.jpg/400px-Cornmeal.jpg",
  },
  {
    id: "2",
    name: "Rice",
    category: "grain",
    price: 3.2,
    location: "Kinshasa",
    sellerId: "seller_002",
    description: "Long grain white rice, locally sourced and sorted.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/White_rice_in_a_bowl.jpg/400px-White_rice_in_a_bowl.jpg",
  },
  {
    id: "3",
    name: "Cooking oil",
    category: "oil",
    price: 4.0,
    location: "Kinshasa",
    sellerId: "seller_001",
    description: "Pure palm cooking oil, refined for everyday cooking.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Sunflower_seed_oil.jpg/400px-Sunflower_seed_oil.jpg",
  },
  {
    id: "4",
    name: "Tomatoes",
    category: "vegetable",
    price: 1.8,
    location: "Lubumbashi",
    sellerId: "seller_003",
    description: "Fresh, ripe red tomatoes delivered directly from the farm.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/400px-Tomato_je.jpg",
  },
  {
    id: "5",
    name: "Onions",
    category: "vegetable",
    price: 1.5,
    location: "Lubumbashi",
    sellerId: "seller_003",
    description: "Dry red onions, long shelf life and great flavor.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Red_Onions.jpg/400px-Red_Onions.jpg",
  },
  {
    id: "6",
    name: "Sugar",
    category: "grocery",
    price: 2.9,
    location: "Kinshasa",
    sellerId: "seller_004",
    description: "Refined white sugar, ideal for baking or beverages.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Sucre_blanc_cassonade_complet_rpad.jpg/400px-Sucre_blanc_cassonade_complet_rpad.jpg",
  },
];

export function Shop() {
  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      sellerId: product.sellerId,
      image: product.image,
    });
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#4E342E] flex items-center gap-2">
          <Store className="w-8 h-8 p-1.5 bg-[#2E7D32] text-[#FFF8E7] rounded-lg shadow-md" />
          Marketplace
        </h2>
        <p className="text-[#4E342E]/70 text-[10px] font-mono tracking-widest mt-1 uppercase">
          Browse products and add them to your cart.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-[#2E7D32]/20 shadow-sm rounded-2xl p-4 flex flex-col hover:border-[#2E7D32]/50 hover:shadow-md transition-all overflow-hidden"
          >
            <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = getFallbackImage(product.name);
                  e.currentTarget.onerror = null;
                }}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[#4E342E] text-lg">
                  {product.name}
                </h3>
                <span className="text-[#FF8F00] font-mono font-bold">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-[#4E342E]/70 mb-4 line-clamp-2">
                {product.description}
              </p>

              <div className="space-y-1 mt-auto pb-4">
                <p className="text-xs text-[#4E342E]/50 font-mono uppercase">
                  Category: {product.category}
                </p>
                <p className="text-xs text-[#4E342E]/50 font-mono uppercase">
                  Location: {product.location}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleAddToCart(product)}
              className="w-full bg-[#2E7D32]/10 hover:bg-[#2E7D32] hover:text-[#FFF8E7] text-[#2E7D32] font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors group mt-auto"
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
