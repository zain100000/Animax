import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../navigation/outlet/Outlet";
import ProtectedRoute from "./protectedRoutes/ProtectedRoutes";

// Authentication Screens
import Signin from "../screens/auth/Signin";

// Dashboard Screens
import Dashboard from "../screens/dashboard/Dashboard";

// Not Found Screen
import NotFound from "../screens/notFound/NotFound";

const AppNavigator = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Signin />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppNavigator;
