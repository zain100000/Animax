import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { getSuperAdmin } from "../../redux/slices/userSlice";
import { toast } from "react-hot-toast";
import Logo from "../../assets/logo/logo.png";
import imgPlaceholder from "../../assets/placeholders/img-placeholder.png";
import Button from "../customButton/Button";
import "../../styles/globalStyles.css";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const superAdmin = useSelector((state) => state.users.superAdmin);
  const profilePicture = superAdmin?.profilePicture || imgPlaceholder;

  useEffect(() => {
    if (user?.id) {
      dispatch(getSuperAdmin(user.id));
    }
  }, [dispatch, user?.id]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const resultAction = await dispatch(logout());
      if (logout.fulfilled.match(resultAction)) {
        localStorage.removeItem("authToken");
        toast.success("Logout Successfully");
        setTimeout(() => navigate("/"), 2000);
      } else {
        const errorMessage =
          logout.rejected.match(resultAction) && resultAction.payload
            ? resultAction.payload.error || "Logout failed. Please try again."
            : "Unexpected response from server.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src={Logo} alt="Logo" className="logo-img" />
          <span className="logo-text">CoffeeSpot</span>
        </div>
        <nav className="nav">
          <div className="profile-section">
            <img src={profilePicture} alt="Profile" className="profile-img" />
            <Button
              className="logout-btn"
              onPress={handleLogout}
              loading={loading}
              title="Logout"
              icon={<i class="fas fa-sign-out-alt"></i>}
            />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
