import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../services/store';

function ShoppingCart() {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);

  // Dynamic calculations
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2);

  const handleCheckout = () => {
    dispatch(clearCart());
    alert('Checkout successful! Your order has been placed and your cart is cleared.');
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/50?text=No+Image';
  };

  return (
    <div>
      <h2>Your Shopping Cart</h2>
      
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <img 
                src={item.image} 
                alt={item.title} 
                onError={handleImageError}
                style={{ width: '50px', height: '50px', objectFit: 'contain' }}/>
              <div style={{ flex: 1 }}>
                <h4>{item.title}</h4>
                <p>${item.price} x {item.quantity}</p>
              </div>
              <button onClick={() => dispatch(removeFromCart(item.id))}>Remove</button>
            </div>
          ))}

          <div style={{ marginTop: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
            <p><strong>Total Items:</strong> {totalItems}</p>
            <p><strong>Total Price:</strong> ${totalPrice}</p>
            <button 
              onClick={handleCheckout} 
              style={{ width: '100%', padding: '10px', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingCart;