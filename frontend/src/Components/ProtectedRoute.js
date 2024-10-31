import { useContext, Navigate, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ component: Component }) => {
  const { isAuth, checkAuthStatus } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      await checkAuthStatus();
      setLoading(false);
    };
    checkAuth();
  }, [checkAuthStatus]);

  if (loading) {
    return (
      <div className="check-token">
        Загрузка
        <span className="dots">
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </span>
      </div>
    );
  }

  return isAuth ? <Component /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
