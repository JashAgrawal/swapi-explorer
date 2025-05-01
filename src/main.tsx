import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import Landing from './pages/landing/Landing';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import ResourceList from './pages/resources/ResourceList';
import ResourceDetail from './pages/resources/ResourceDetail';
import NotFound from './pages/errors/NotFound';
import ErrorPage from './pages/errors/ErrorPage';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

// Define application routes
export const routes = [
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        // Public routes
        path: '/',
        element: <Landing />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        // Protected routes with AppShell layout
        element: (
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />
          },
          {
            path: '/resources/:type',
            element: <ResourceList />
          },
          {
            path: '/resources/:type/:id',
            element: <ResourceDetail />
          }
        ]
      },
      // 404 route - must be last
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];

// Create router
const router = createBrowserRouter(routes);

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 1000,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 15, // 15 minutes
      suspense: false,
      useErrorBoundary: false,
      // Keep previous data to avoid UI flashing during refetches
      keepPreviousData: true,
    }
  }
});

// Render application
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
