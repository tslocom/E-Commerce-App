import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createAppStore } from '../services/store.js';

export const renderWithProviders = (ui, { preloadedState, store = createAppStore(preloadedState) } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );

  return {
    store,
    queryClient,
    ...render(ui, { wrapper: Wrapper }),
  };
};