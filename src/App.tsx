import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { Layout } from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Candidates from '@/pages/Candidates';
import CandidateCreate from '@/pages/CandidateCreate';
import CandidateImport from '@/pages/CandidateImport';
import CandidateDetail from '@/pages/CandidateDetail';
import CandidateEdit from '@/pages/CandidateEdit';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Protected routes with sidebar layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/candidates" element={<Candidates />} />
                    <Route path="/candidates/create" element={<CandidateCreate />} />
                    <Route path="/candidates/import" element={<CandidateImport />} />
                    <Route path="/candidates/:id/edit" element={<CandidateEdit />} />
                    <Route path="/candidates/:id" element={<CandidateDetail />} />
                    <Route path="/organizations" element={<div className="p-8"><h1 className="text-2xl font-bold">Organizations - Coming Soon</h1></div>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
