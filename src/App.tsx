import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
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
import Companies from '@/pages/Companies';
import CompanyCreate from '@/pages/CompanyCreate';
import CompanyEdit from '@/pages/CompanyEdit';
import CompanyDetail from '@/pages/CompanyDetail';
import Jobs from '@/pages/Jobs';
import JobCreate from '@/pages/JobCreate';
import JobEdit from '@/pages/JobEdit';
import JobDetail from '@/pages/JobDetail';
import Agent from '@/pages/Agent';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/companies/create" element={<CompanyCreate />} />
                    <Route path="/companies/:id/edit" element={<CompanyEdit />} />
                    <Route path="/companies/:id" element={<CompanyDetail />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/create" element={<JobCreate />} />
                    <Route path="/jobs/:id/edit" element={<JobEdit />} />
                    <Route path="/jobs/:id" element={<JobDetail />} />
                    <Route path="/agent" element={<Agent />} />
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
    </QueryClientProvider>
  );
}

export default App;
