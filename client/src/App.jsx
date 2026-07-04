import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Orphanages from './pages/Orphanages';
import Children from './pages/Children';
import Donate from './pages/Donate';
import Volunteer from './pages/Volunteer';
import Sponsor from './pages/Sponsor';
import Adoption from './pages/Adoption';
import Impact from './pages/Impact';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Route guards to protect pages based on login status and roles
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hn-white dark:bg-hn-dark">
        <div className="w-12 h-12 rounded-full border-4 border-hn-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized for admin, redirect to normal dashboard
    return <Navigate to={user.role === 'public' ? '/dashboard' : '/admin'} replace />;
  }

  return children;
};

const AppContent = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Sync Tailwind Dark Mode class on toggle
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-hn-white dark:bg-hn-dark transition-colors duration-300">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        {/* Main Pages Content Frame */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/orphanages" element={<Orphanages />} />
            <Route path="/children" element={<Children />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/sponsor" element={<Sponsor />} />
            <Route path="/adoption" element={<Adoption />} />
            <Route path="/impact" element={<Impact />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute allowedRoles={['public']}>
                  <UserDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute allowedRoles={['orphanageAdmin', 'superAdmin']}>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
