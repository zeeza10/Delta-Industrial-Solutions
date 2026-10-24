import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routerConfig } from './routes';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';

const router = createBrowserRouter(routerConfig);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StoreProvider>
          <RouterProvider router={router} />
        </StoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
