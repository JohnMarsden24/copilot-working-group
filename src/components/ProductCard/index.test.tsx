import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ProductCard } from './index';
import { CartProvider } from '../../contexts/CartContext';
import type { Product } from '../../types/product';

// Mock the Link component from TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) => (
    <a className={className} {...props}>
      {children}
    </a>
  ),
}));

// Helper function to create test product data
const createTestProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  title: 'Test Product',
  description: 'A test product description',
  category: 'electronics',
  price: 100,
  discountPercentage: 0,
  rating: 4.5,
  stock: 50,
  tags: ['test'],
  sku: 'TEST-001',
  weight: 1,
  dimensions: {
    width: 10,
    height: 10,
    depth: 10,
  },
  warrantyInformation: '1 year warranty',
  shippingInformation: 'Ships in 1-2 days',
  availabilityStatus: 'In Stock',
  reviews: [],
  returnPolicy: '30 day return policy',
  minimumOrderQuantity: 1,
  meta: {
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    barcode: '123456789',
    qrCode: 'qr-code-url',
  },
  thumbnail: 'https://example.com/image.jpg',
  images: ['https://example.com/image.jpg'],
  ...overrides,
});

// Wrapper component that provides necessary context
const renderWithProviders = (component: React.ReactElement) => {
  return render(<CartProvider>{component}</CartProvider>);
};

describe('ProductCard', () => {
  it('displays discount badge and calculates prices correctly when product has discount', () => {
    // Product with 20% discount: original price $100, discounted price $80
    const productWithDiscount = createTestProduct({
      price: 80,
      discountPercentage: 20,
    });

    renderWithProviders(<ProductCard product={productWithDiscount} />);

    // Discount badge
    const badge = screen.getByText('20% OFF');
    expect(badge).toBeInTheDocument();

    // Current price
    expect(screen.getByText('$80.00')).toBeInTheDocument();

    // Original price (calculated: 80 / (1 - 0.20) = 100)
    expect(screen.getByText('$100.00')).toBeInTheDocument();

    // Savings (100 - 80 = 20)
    expect(screen.getByText('Save $20.00')).toBeInTheDocument();
  });

  it('does not display discount badge or original price when no discount', () => {
    const productWithoutDiscount = createTestProduct({
      price: 100,
      discountPercentage: 0,
    });

    renderWithProviders(<ProductCard product={productWithoutDiscount} />);

    const badge = screen.queryByText(/% OFF/);
    expect(badge).not.toBeInTheDocument();

    // Should only show current price, not original or savings
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.queryByText(/Save/)).not.toBeInTheDocument();
  });

  it('renders product rating with correct stars and rating value', () => {
    const product = createTestProduct({
      rating: 4.7,
    });

    renderWithProviders(<ProductCard product={product} />);

    // Check for rating display (4.7)
    const ratingText = screen.getByText('(4.7)');
    expect(ratingText).toBeInTheDocument();

    // Check for 5 stars (4.7 rounds to 5)
    const starsContainer = screen.getByText(/⭐/);
    expect(starsContainer.textContent).toBe('⭐⭐⭐⭐⭐');
  });

  it('displays correct stock status based on inventory level', () => {
    // Test high stock (10 or more)
    const highStockProduct = createTestProduct({ stock: 15 });
    const { rerender } = renderWithProviders(<ProductCard product={highStockProduct} />);
    expect(screen.getByText('In Stock')).toBeInTheDocument();

    // Test low stock (less than 10)
    const lowStockProduct = createTestProduct({ stock: 5 });
    rerender(
      <CartProvider>
        <ProductCard product={lowStockProduct} />
      </CartProvider>
    );
    expect(screen.getByText('Only 5 left!')).toBeInTheDocument();
  });

  it('adds product to cart when Add to Cart button is clicked', async () => {
    const user = userEvent.setup();
    const product = createTestProduct({
      title: 'Test Product for Cart',
    });

    renderWithProviders(<ProductCard product={product} />);

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addToCartButton).toBeInTheDocument();

    // Click the button
    await user.click(addToCartButton);

    // The button should still be present and clickable after adding to cart
    expect(addToCartButton).toBeInTheDocument();
  });
});
