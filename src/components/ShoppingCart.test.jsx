import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShoppingCart from './ShoppingCart.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { createOrder } from '../services/orderService';

jest.mock('../services/orderService', () => ({
  createOrder: jest.fn(),
}));

describe('ShoppingCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes an item from the cart', async () => {
    const user = userEvent.setup();
    const preloadedState = {
      auth: {
        user: { uid: 'user-1', email: 'alex@example.com', displayName: 'Alex Morgan' },
        isAuthenticated: true,
      },
      cart: {
        items: [
          {
            id: 'prod-1',
            title: 'Wireless Earbuds',
            price: 49.99,
            quantity: 1,
            image: 'https://example.com/earbuds.png',
          },
        ],
      },
    };

    renderWithProviders(<ShoppingCart />, { preloadedState });

    const cartHeading = screen.getByRole('heading', { name: /shopping cart/i });
    const cartSection = cartHeading.closest('section');

    expect(cartSection).not.toBeNull();
    expect(within(cartSection).getByText(/wireless earbuds/i)).toBeInTheDocument();

    await user.click(within(cartSection).getByRole('button', { name: /remove/i }));

    expect(within(cartSection).queryByText(/wireless earbuds/i)).not.toBeInTheDocument();
    expect(within(cartSection).getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
  });
});