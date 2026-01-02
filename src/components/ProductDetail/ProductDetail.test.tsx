import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { ProductDetail } from './index';
import { CartProvider } from '../../contexts';
import type { Product } from '../../types/product';

// Mock product data
const mockProduct: Product = {
  id: 1,
  title: 'Test Product',
  description: 'This is a test product description',
  category: 'Electronics',
  price: 99.99,
  rating: 4.5,
  stock: 10,
  brand: 'TestBrand',
  availabilityStatus: 'In Stock',
  returnPolicy: '30 days',
  thumbnail: 'https://example.com/thumbnail.jpg',
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
};

// Helper function to render component with all required providers
const renderWithProviders = (
  productData: Product | null = mockProduct
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Get the product ID from the product data, or use 1 as default
  const productId = productData?.id ?? 1;

  // Pre-populate the query cache with product data
  if (productData) {
    queryClient.setQueryData(['product', productId], productData);
  }

  // Create router setup
  const rootRoute = createRootRoute();
  const productRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/products/$productId',
    component: () => (
      <CartProvider>
        <ProductDetail />
      </CartProvider>
    ),
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([productRoute]),
    history: createMemoryHistory({
      initialEntries: [`/products/${productId}`],
    }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

describe('ProductDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly with valid product data', async () => {
    renderWithProviders();

    // Check if all key product information is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    
    // Check meta information
    expect(screen.getByText('TestBrand')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('⭐ 4.5')).toBeInTheDocument();

    // Check if image is rendered
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');

    // Check if "Add to Cart" button is rendered
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('should display key product information (title, price, description)', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Verify title
    const title = screen.getByText('Test Product');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H1');

    // Verify price
    const price = screen.getByText('$99.99');
    expect(price).toBeInTheDocument();

    // Verify description
    const description = screen.getByText('This is a test product description');
    expect(description).toBeInTheDocument();
  });

  it('should handle product data with missing optional fields', async () => {
    const productWithoutBrand: Product = {
      ...mockProduct,
      brand: undefined,
    };

    renderWithProviders(productWithoutBrand);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Should display "N/A" for missing brand
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should render navigation back to products list', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Check if back link is present
    const backLink = screen.getByRole('link', { name: /back to products/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('should handle user interaction - adding product to cart', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addToCartButton).toBeInTheDocument();

    // Click the "Add to Cart" button
    await user.click(addToCartButton);

    // The button should still be clickable after adding to cart
    expect(addToCartButton).toBeEnabled();
  });

  it('should display product image with fallback to thumbnail', async () => {
    const productWithoutImages: Product = {
      ...mockProduct,
      images: [],
    };

    renderWithProviders(productWithoutImages);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Should fall back to thumbnail when images array is empty
    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
  });
});
