export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sellerId: string;
  image?: string;
}

export const getCartItems = (): CartItem[] => {
  const items = localStorage.getItem("cart_items");
  return items ? JSON.parse(items) : [];
};

export const saveCartItems = (items: CartItem[]) => {
  localStorage.setItem("cart_items", JSON.stringify(items));
  // Fire event so other tabs can update
  window.dispatchEvent(new Event("cart_updated"));
};

export const addToCart = (item: CartItem) => {
  const items = getCartItems();
  const existing = items.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }
  saveCartItems(items);
};

export const removeFromCart = (id: string) => {
  const items = getCartItems();
  const newItems = items.filter((i) => i.id !== id);
  saveCartItems(newItems);
};

export const updateQuantityInCart = (id: string, delta: number) => {
  const items = getCartItems();
  const item = items.find((i) => i.id === id);
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta);
    saveCartItems(items);
  }
};

export const clearCart = () => {
  localStorage.removeItem("cart_items");
  window.dispatchEvent(new Event("cart_updated"));
};
