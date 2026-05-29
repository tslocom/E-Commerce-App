import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, removeFromCart } from '../services/store';
import { createOrder } from '../services/orderService';

function ShoppingCart() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const authUser = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  const totalItems = cartItems.reduce((accumulator, item) => accumulator + item.quantity, 0);
  const totalPrice = cartItems.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0);

  const checkoutMutation = useMutation({
    mutationFn: () => createOrder(authUser, cartItems, totalPrice),
    onSuccess: () => {
      dispatch(clearCart());
      setCheckoutMessage('Order stored in Firestore.');
      queryClient.invalidateQueries({ queryKey: ['orders', authUser.uid] });
    },
  });

  const handleCheckout = async () => {
    if (!authUser) {
      setCheckoutMessage('Sign in to place an order.');
      return;
    }

    if (cartItems.length === 0) {
      setCheckoutMessage('Your cart is empty.');
      return;
    }

    setCheckoutMessage('');
    await checkoutMutation.mutateAsync();
  };

  const handleImageError = (event) => {
    event.currentTarget.src = 'https://via.placeholder.com/72?text=No+Image';
  };

  return (
    <section className="panel cart-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Current cart</p>
          <h2>Shopping cart</h2>
        </div>
        <p className="panel-meta">{totalItems} items</p>
      </div>

      {!authUser && <p className="notice info">Sign in to save orders to Firestore.</p>}

      {cartItems.length === 0 ? (
        <p className="muted-copy">Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.title} onError={handleImageError} />
              <div className="cart-item-body">
                <strong>{item.title}</strong>
                <p className="muted-copy">
                  ${Number(item.price).toFixed(2)} x {item.quantity}
                </p>
              </div>
              <button type="button" className="ghost-button compact" onClick={() => dispatch(removeFromCart(item.id))}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="summary-card">
        <div>
          <p className="label">Total items</p>
          <strong>{totalItems}</strong>
        </div>
        <div>
          <p className="label">Total price</p>
          <strong>${totalPrice.toFixed(2)}</strong>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={handleCheckout}
          disabled={checkoutMutation.isPending || cartItems.length === 0}
        >
          {checkoutMutation.isPending ? 'Placing order...' : 'Place order'}
        </button>
        {(checkoutMessage || checkoutMutation.isError) && (
          <div className={checkoutMutation.isError ? 'notice error' : 'notice info'}>
            {checkoutMutation.error?.message ?? checkoutMessage}
          </div>
        )}
      </div>
    </section>
  );
}

export default ShoppingCart;