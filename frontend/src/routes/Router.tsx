import { Route, Routes } from 'react-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import RoomPage from './room/Page';
import { LandingPage } from './landing/Page';
import { JoinPage } from './join/Page';

export default function RootRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route
        path="/room/:roomId"
        element={
          <ProtectedRoute>
            <RoomPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}