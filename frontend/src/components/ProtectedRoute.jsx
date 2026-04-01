import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <div className="spinner" />;
  }

  if (!currentUser && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userProfile?.role !== 'admin' && userProfile?.role !== 'team') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
