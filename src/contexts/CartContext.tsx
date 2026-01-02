import { createContext } from 'react';
import type { ReactNode } from 'react';
import { useCart } from '../hooks/useCart';

interface CartContextValue {
  items: ReturnType<typeof useCart>['items'];
  addToCart: ReturnType<typeof useCart>['addToCart'];
  removeFromCart: ReturnType<typeof useCart>['removeFromCart'];
  updateQuantity: ReturnType<typeof useCart>['updateQuantity'];
  clearCart: ReturnType<typeof useCart>['clearCart'];
  totalItems: ReturnType<typeof useCart>['totalItems'];
  totalPrice: ReturnType<typeof useCart>['totalPrice'];
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export { CartContext };
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const cart = useCart();

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
};
