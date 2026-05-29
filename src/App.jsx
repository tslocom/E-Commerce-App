import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { store } from './services/store.js';
import { useAuthSync } from './services/useAuthSync.js';
import AuthPanel from './components/AuthPanel.jsx';
import ProductCatalog from './components/ProductCatalog.jsx';
import ShoppingCart from './components/ShoppingCart.jsx';
import ProfilePanel from './components/ProfilePanel.jsx';
import OrderHistory from './components/OrderHistory.jsx';
import { useSelector } from 'react-redux';
import { logoutUser } from './services/authService';

const queryClient = new QueryClient();

function AppShell() {
  useAuthSync();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Firebase commerce workspace</p>
          <h1>Authentication, products, carts, and orders in one Firestore-backed app.</h1>
          <p className="hero-copy">
            Users can register, log in, edit their profile, manage products, and place orders that are stored in Firebase.
          </p>
        </div>

        {user ? (
          <button type="button" className="ghost-button" onClick={handleLogout}>
            Logout
          </button>
        ) : null}
      </header>

      {!user ? (
        <div className="auth-stage">
          <AuthPanel />
        </div>
      ) : (
        <div className="dashboard-layout">
          <div className="main-column">
            <ProductCatalog />
            <OrderHistory />
          </div>
          <aside className="side-column">
            <ProfilePanel />
            <ShoppingCart />
          </aside>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;