# ProductCard Component Tests

## Overview
This test suite provides coverage for the ProductCard component, focusing on key features and real component interactions without unnecessary mocking.

## Test Cases

### 1. Discount Badge and Price Calculations
**Tests**: Discount badge visibility, price calculations, original price, and savings display
- Verifies that the discount badge appears when `discountPercentage > 0`
- Validates correct calculation of original price from discounted price
- Confirms savings amount is calculated correctly
- Also tests the inverse: no badge when `discountPercentage = 0`

### 2. Product Rating Display
**Tests**: Star rating visualization and numeric rating display
- Checks that the rating value is displayed correctly (e.g., "4.7")
- Verifies that the correct number of stars are rendered (based on rounded rating)

### 3. Stock Status Display
**Tests**: Dynamic stock status messages
- Validates "In Stock" message when stock ≥ 10
- Validates "Only X left!" message when stock < 10

### 4. Add to Cart Interaction
**Tests**: User interaction with Add to Cart button
- Confirms button is present and accessible
- Simulates real user click event using `@testing-library/user-event`
- Verifies button remains functional after interaction

## Testing Approach

### What We Tested
- **Real component rendering**: Uses actual CartProvider context
- **User interactions**: Real clicks via userEvent (no mocks)
- **Visual feedback**: Badge rendering, price formatting, stock messages
- **Dynamic calculations**: Price math, rating rounding

### What We Avoided
- **Unnecessary mocks**: Only TanStack Router Link component is mocked (minimal surface)
- **Implementation details**: Focus on user-visible behavior
- **Overly specific assertions**: Tests are resilient to styling changes

## Test Infrastructure

### Dependencies Added
- `vitest`: Fast, Vite-native test runner
- `@testing-library/react`: React component testing utilities
- `@testing-library/jest-dom`: Custom matchers for DOM testing
- `@testing-library/user-event`: User interaction simulation
- `jsdom`: Browser-like environment for tests

### Configuration
- **Test setup**: `src/test/setup.ts` - Configures testing library matchers and cleanup
- **Vitest config**: Added to `vite.config.ts` for seamless integration
- **Scripts**: `npm test`, `npm run test:run`, `npm run test:ui`

## Limitations and Future Coverage Opportunities

### Current Limitations
1. **Router Navigation**: Link clicks are mocked rather than fully tested. Future tests could validate navigation behavior.
2. **Cart State Verification**: While we test the button click, we don't verify the cart state changes. This could be enhanced with additional assertions on cart context state.
3. **Image Loading**: Thumbnail images are not validated (e.g., alt text, src attributes).
4. **Accessibility**: No specific ARIA or keyboard navigation tests.

### Future Enhancement Ideas
1. **Integration Tests**: Test ProductCard within ProductGrid to verify grid layout behavior
2. **Visual Regression**: Screenshot comparison tests for different product states
3. **Edge Cases**: 
   - Very long product titles
   - Zero or negative stock
   - Extreme discount percentages (e.g., 100%)
   - Missing/undefined fields
4. **Performance**: Test rendering performance with many cards
5. **Responsive Design**: Test behavior at different viewport sizes

## Running Tests

```bash
# Run tests once
npm test -- --run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui
```

## Notes
- Tests use `vi.mock` to mock the TanStack Router `Link` component, as full router setup in tests would be complex and fragile
- The `createTestProduct` helper provides sensible defaults for all required Product fields
- Tests use React Testing Library's `rerender` to efficiently test multiple states in a single test
