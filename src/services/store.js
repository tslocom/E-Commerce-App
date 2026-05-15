import { configureStore, createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  const savedCart = sessionStorage.getItem('shoppingCart');
  return savedCart ? JSON.parse(savedCart) : [];
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartFromStorage(),
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      sessionStorage.setItem('shoppingCart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      sessionStorage.setItem('shoppingCart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      sessionStorage.removeItem('shoppingCart');
    }
  }
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;

export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer
  }
});