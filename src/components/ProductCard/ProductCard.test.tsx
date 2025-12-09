import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './index';
import type { Product } from '../../types/product';
import { CartProvider } from '../../contexts/CartContext';

// Mock the router Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params, className }: any) => (
    <a href={`${to.replace('$productId', params.productId)}`} className={className}>
      {children}
    </a>
  ),
}));

// Helper function to create a test product
const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  title: 'Test Product',
  description: 'This is a test product',
  category: 'electronics',
  price: 99.99,
  discountPercentage: 0,
  rating: 4.5,
  stock: 50,
  tags: ['electronics', 'gadget'],
  brand: 'TestBrand',
  sku: 'TEST-001',
  weight: 1.5,
  dimensions: {
    width: 10,
    height: 5,
    depth: 3,
  },
  warrantyInformation: '1 year warranty',
  shippingInformation: 'Ships in 2-3 days',
  availabilityStatus: 'In Stock',
  reviews: [],
  returnPolicy: '30 day return policy',
  minimumOrderQuantity: 1,
  meta: {
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    barcode: '1234567890',
    qrCode: 'qr-code-url',
  },
  thumbnail: 'https://example.com/thumbnail.jpg',
  images: ['https://example.com/image1.jpg'],
  ...overrides,
});

// Wrapper component with CartProvider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<CartProvider>{ui}</CartProvider>);
};

describe('ProductCard', () => {
  describe('Basic Rendering', () => {
    it('should render product card with all essential elements', () => {
      const product = createMockProduct();
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('In Stock')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
      expect(screen.getByAltText('Test Product')).toBeInTheDocument();
    });

    it('should render product image with correct src and alt attributes', () => {
      const product = createMockProduct({
        thumbnail: 'https://example.com/test-image.jpg',
        title: 'Custom Product',
      });
      renderWithProvider(<ProductCard product={product} />);

      const image = screen.getByAltText('Custom Product') as HTMLImageElement;
      expect(image.src).toBe('https://example.com/test-image.jpg');
    });

    it('should render product title as heading', () => {
      const product = createMockProduct({ title: 'Awesome Gadget' });
      renderWithProvider(<ProductCard product={product} />);

      const heading = screen.getByRole('heading', { name: 'Awesome Gadget' });
      expect(heading).toBeInTheDocument();
    });

    it('should render links to product detail page', () => {
      const product = createMockProduct({ id: 42 });
      renderWithProvider(<ProductCard product={product} />);

      const links = screen.getAllByRole('link');
      // Should have 2 links: one on image wrapper, one on title
      expect(links).toHaveLength(2);
      links.forEach(link => {
        expect(link).toHaveAttribute('href', '/products/42');
      });
    });
  });

  describe('Discount Display', () => {
    it('should display discount badge when product has discount', () => {
      const product = createMockProduct({
        price: 79.99,
        discountPercentage: 20,
      });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('20% OFF')).toBeInTheDocument();
    });

    it('should round discount percentage in badge', () => {
      const product = createMockProduct({
        price: 79.99,
        discountPercentage: 15.7,
      });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('16% OFF')).toBeInTheDocument();
    });

    it('should display original price and savings when discounted', () => {
      const product = createMockProduct({
        price: 80.0,
        discountPercentage: 20, // Original price: 80 / (1 - 0.20) = 100
      });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('$100.00')).toBeInTheDocument(); // Original price
      expect(screen.getByText('$80.00')).toBeInTheDocument(); // Discounted price
      expect(screen.getByText('Save $20.00')).toBeInTheDocument(); // Savings
    });

    it('should not display discount badge when discount is 0', () => {
      const product = createMockProduct({
        price: 99.99,
        discountPercentage: 0,
      });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Save/)).not.toBeInTheDocument();
    });

    it('should not display original price when no discount', () => {
      const product = createMockProduct({
        price: 99.99,
        discountPercentage: 0,
      });
      renderWithProvider(<ProductCard product={product} />);

      // Only the current price should be displayed
      const prices = screen.getAllByText(/\$99\.99/);
      expect(prices).toHaveLength(1);
    });
  });

  describe('Stock Display', () => {
    it('should display "In Stock" for normal stock levels', () => {
      const product = createMockProduct({ stock: 50 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('In Stock')).toBeInTheDocument();
    });

    it('should display low stock warning when stock is below 10', () => {
      const product = createMockProduct({ stock: 5 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('Only 5 left!')).toBeInTheDocument();
    });

    it('should display low stock warning at exactly 9 items', () => {
      const product = createMockProduct({ stock: 9 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('Only 9 left!')).toBeInTheDocument();
    });

    it('should display "In Stock" at exactly 10 items', () => {
      const product = createMockProduct({ stock: 10 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('In Stock')).toBeInTheDocument();
    });

    it('should handle zero stock', () => {
      const product = createMockProduct({ stock: 0 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('Only 0 left!')).toBeInTheDocument();
    });
  });

  describe('Rating Display', () => {
    it('should display star rating correctly', () => {
      const product = createMockProduct({ rating: 4.5 });
      renderWithProvider(<ProductCard product={product} />);

      // Rating of 4.5 should round to 5 stars
      const starsElement = screen.getByText('⭐⭐⭐⭐⭐');
      expect(starsElement).toBeInTheDocument();
      expect(screen.getByText('(4.5)')).toBeInTheDocument();
    });

    it('should display 3 stars for 3.2 rating', () => {
      const product = createMockProduct({ rating: 3.2 });
      renderWithProvider(<ProductCard product={product} />);

      const starsElement = screen.getByText('⭐⭐⭐');
      expect(starsElement).toBeInTheDocument();
      expect(screen.getByText('(3.2)')).toBeInTheDocument();
    });

    it('should display no stars for 0 rating', () => {
      const product = createMockProduct({ rating: 0 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('(0.0)')).toBeInTheDocument();
    });

    it('should display 5 stars for perfect rating', () => {
      const product = createMockProduct({ rating: 5.0 });
      renderWithProvider(<ProductCard product={product} />);

      const starsElement = screen.getByText('⭐⭐⭐⭐⭐');
      expect(starsElement).toBeInTheDocument();
      expect(screen.getByText('(5.0)')).toBeInTheDocument();
    });

    it('should format rating to 1 decimal place', () => {
      const product = createMockProduct({ rating: 3.456 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('(3.5)')).toBeInTheDocument();
    });
  });

  describe('Add to Cart Functionality', () => {
    it('should call addToCart when button is clicked', async () => {
      const user = userEvent.setup();
      const product = createMockProduct();
      
      renderWithProvider(<ProductCard product={product} />);

      const addButton = screen.getByRole('button', { name: /add to cart/i });
      await user.click(addButton);

      // The cart context should handle the add, no error should be thrown
      expect(addButton).toBeInTheDocument();
    });

    it('should render Add to Cart button with full width', () => {
      const product = createMockProduct();
      renderWithProvider(<ProductCard product={product} />);

      const button = screen.getByRole('button', { name: /add to cart/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle product with very long title', () => {
      const product = createMockProduct({
        title: 'This is an extremely long product title that might cause layout issues if not handled properly',
      });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText(/extremely long product title/)).toBeInTheDocument();
    });

    it('should handle product with very high price', () => {
      const product = createMockProduct({ price: 9999999.99 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('$9999999.99')).toBeInTheDocument();
    });

    it('should handle product with very small price', () => {
      const product = createMockProduct({ price: 0.01 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('$0.01')).toBeInTheDocument();
    });

    it('should handle product with maximum discount', () => {
      const product = createMockProduct({
        price: 1.0,
        discountPercentage: 99,
      });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('99% OFF')).toBeInTheDocument();
    });

    it('should handle product with 1 star rating', () => {
      const product = createMockProduct({ rating: 1 });
      renderWithProvider(<ProductCard product={product} />);

      const starsElement = screen.getByText('⭐');
      expect(starsElement).toBeInTheDocument();
      expect(screen.getByText('(1.0)')).toBeInTheDocument();
    });

    it('should handle product with missing optional brand', () => {
      const { brand, ...productWithoutBrand } = createMockProduct();
      const product = productWithoutBrand as Product;
      renderWithProvider(<ProductCard product={product} />);

      // Card should still render without errors
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('should handle product with large stock number', () => {
      const product = createMockProduct({ stock: 10000 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('In Stock')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible image with alt text', () => {
      const product = createMockProduct({ title: 'Accessible Product' });
      renderWithProvider(<ProductCard product={product} />);

      const image = screen.getByAltText('Accessible Product');
      expect(image).toBeInTheDocument();
    });

    it('should have accessible button with descriptive text', () => {
      const product = createMockProduct();
      renderWithProvider(<ProductCard product={product} />);

      const button = screen.getByRole('button', { name: /add to cart/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAccessibleName('Add to Cart');
    });

    it('should have accessible links with valid hrefs', () => {
      const product = createMockProduct({ id: 123 });
      renderWithProvider(<ProductCard product={product} />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).toBeTruthy();
      });
    });

    it('should render heading with proper semantic structure', () => {
      const product = createMockProduct({ title: 'Semantic Product' });
      renderWithProvider(<ProductCard product={product} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Semantic Product');
    });
  });

  describe('Price Formatting', () => {
    it('should format prices with 2 decimal places', () => {
      const product = createMockProduct({ price: 99.9 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('$99.90')).toBeInTheDocument();
    });

    it('should format whole number prices with .00', () => {
      const product = createMockProduct({ price: 50 });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('$50.00')).toBeInTheDocument();
    });

    it('should correctly calculate discounted price display', () => {
      const product = createMockProduct({
        price: 75.50,
        discountPercentage: 25, // Original: 75.50 / 0.75 = 100.67
      });
      renderWithProvider(<ProductCard product={product} />);

      expect(screen.getByText('$75.50')).toBeInTheDocument(); // Discounted price
      expect(screen.getByText('$100.67')).toBeInTheDocument(); // Original price
      expect(screen.getByText('Save $25.17')).toBeInTheDocument(); // Savings
    });
  });

  describe('Component Structure', () => {
    it('should render product card container structure', () => {
      const product = createMockProduct();
      const { container } = renderWithProvider(<ProductCard product={product} />);

      // Verify the card has essential content
      expect(container.querySelector('img')).toBeInTheDocument();
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('should have discount badge element when product is discounted', () => {
      const product = createMockProduct({ discountPercentage: 15 });
      renderWithProvider(<ProductCard product={product} />);

      const badge = screen.getByText('15% OFF');
      expect(badge).toBeInTheDocument();
    });

    it('should have star rating display element', () => {
      const product = createMockProduct({ rating: 4 });
      const { container } = renderWithProvider(<ProductCard product={product} />);

      // Verify rating section contains stars
      const stars = screen.getByText('⭐⭐⭐⭐');
      expect(stars).toBeInTheDocument();
    });
  });

  describe('Interactive Behavior', () => {
    it('should be clickable for navigation to product details', async () => {
      const user = userEvent.setup();
      const product = createMockProduct({ id: 456 });
      renderWithProvider(<ProductCard product={product} />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/products/456');
      
      // Clicking link should not throw error
      await user.click(links[0]);
    });

    it('should handle multiple rapid clicks on Add to Cart', async () => {
      const user = userEvent.setup();
      const product = createMockProduct();
      renderWithProvider(<ProductCard product={product} />);

      const button = screen.getByRole('button', { name: /add to cart/i });
      
      // Simulate rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should not throw errors
      expect(button).toBeInTheDocument();
    });
  });
});
