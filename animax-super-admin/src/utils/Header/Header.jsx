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
    <header id="header" className="shadow-sm">
      <div className="container-fluid">
        <div className="row align-items-center">
          {/* Left: Logo */}
          <div className="col-6 col-md-4 d-flex align-items-center anime-logo">
            <img src={Logo} alt="Logo" className="logo-img me-2" />
            <span className="logo-text d-none d-md-inline">Animax</span>
          </div>

          <div className="col-6 col-md-8 d-flex justify-content-end align-items-center gap-2 gap-md-3">
            <img
              src={profilePicture}
              alt="Profile"
              className="profile-img anime-avatar"
            />
            <div className="d-none d-md-inline-block">
              <Button
                className="logout-btn anime-btn"
                onPress={handleLogout}
                loading={loading}
                title="Logout"
                icon={<i className="fas fa-sign-out-alt"></i>}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
