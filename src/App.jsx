import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './services/store.js';
import ProductCatalog from './components/ProductCatalog.jsx';
import ShoppingCart from './components/ShoppingCart.jsx';

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <div style={{ display: 'flex', padding: '20px', gap: '40px', fontFamily: 'sans-serif' }}>
          <div style={{ flex: 2 }}>
            <ProductCatalog />
          </div>
          <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
            <ShoppingCart />
          </div>
        </div>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;