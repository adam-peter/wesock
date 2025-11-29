import { Route, Routes } from 'react-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import RootPage from './Page';
import { LoginPage } from './login/Page';

export default function RootRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RootPage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
