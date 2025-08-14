import { Routes, Route } from "react-router-dom";

// Authentication Screens
import Signin from "../screens/auth/Signin";
import NotFound from "../screens/notFound/NotFound";

const AppNavigator = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Signin />} />

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppNavigator;
