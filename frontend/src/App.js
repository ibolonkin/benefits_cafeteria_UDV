import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Registration from './Components/Registration/Registration';
import ProtectedRoute from './Components/ProtectedRoute';
import Dashboard from './Components/Dashboard/Dashboard';
import Login from './Components/Login/Login';
import ChooseBenefit from './Components/ChooseBenefit/ChooseBenefit';
import Profile from './Components/Profile/Profile';
import Users from './Components/Users/Users';
import MyBenefits from './Components/MyBenefits/MyBenefits';
import BenefitsHR from './Components/BenefitsHR/BenefitsHR'
import { HRProvider, useHR } from './Components/HRContext';

function HRProtectedRoute({component: Component}) {
  const { isHRMode } = useHR();
  return isHRMode ? <Component /> : <Navigate to='/dashboard/' />
}

function App() {
  return (
    <HRProvider>
      <Routes>
        <Route
          path="/"
          element={<Registration />}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/dashboard/*"
          element={<ProtectedRoute component={Dashboard} />}
        >
          <Route
            path=""
            element={<Navigate to="choose-benefit" />}
          />
          <Route
            path="choose-benefit"
            element={<ChooseBenefit />}
          />
          <Route
            path="profile"
            element={<Profile />}
          />
          <Route
            path="my-benefits"
            element={<MyBenefits />}
          />
          <Route path='benefits' element={<HRProtectedRoute component={BenefitsHR} />} />
           <Route path='users' element={<HRProtectedRoute component={Users} />} />
        </Route>
      </Routes>
    </HRProvider>
  );
}

export default App;
