import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCatalog from './ProductCatalog.jsx';
import ShoppingCart from './ShoppingCart.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { fetchProducts } from '../services/productService';

jest.mock('../services/productService', () => ({
  fetchProducts: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

jest.mock('../services/orderService', () => ({
  createOrder: jest.fn(),
}));

describe('Product and cart integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the cart when a product is added from the catalog', async () => {
    const user = userEvent.setup();

    fetchProducts.mockResolvedValue([
      {
        id: 'prod-1',
        title: 'Wireless Earbuds',
        category: 'Audio',
        price: 49.99,
        stock: 8,
        image: 'https://example.com/earbuds.png',
        description: 'Compact earbuds with active noise cancellation.',
      },
    ]);

    renderWithProviders(
      <>
        <ProductCatalog />
        <ShoppingCart />
      </>,
      {
        preloadedState: {
          auth: {
            user: { uid: 'user-1', email: 'alex@example.com', displayName: 'Alex Morgan' },
            isAuthenticated: true,
          },
          cart: { items: [] },
        },
      },
    );

    await screen.findByRole('heading', { name: /wireless earbuds/i });
    await user.click(screen.getAllByRole('button', { name: /add to cart/i })[0]);

    const cartHeading = screen.getByRole('heading', { name: /shopping cart/i });
    const cartSection = cartHeading.closest('section');

    expect(cartSection).not.toBeNull();
    expect(within(cartSection).getByText(/wireless earbuds/i)).toBeInTheDocument();
    expect(within(cartSection).getByText(/\$49\.99 x 1/i)).toBeInTheDocument();
    expect(within(cartSection).getByText(/1 items/i)).toBeInTheDocument();
  });
});