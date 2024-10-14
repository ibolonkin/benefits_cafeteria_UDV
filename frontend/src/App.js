import { Route, Routes } from 'react-router-dom';
import './App.css';
import Registration from './Components/Registration/Registration';
import ProtectedRoute from './Components/ProtectedRoute';
import Dashboard from './Components/Dashboard/Dashboard';
import Login from './Components/Login/Login'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Registration />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard/*"
        element={<ProtectedRoute component={Dashboard} />}
      />
    </Routes>
  );
}

export default App;
