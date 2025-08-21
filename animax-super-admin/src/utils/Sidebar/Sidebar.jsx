import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    {
      path: "/admin/dashboard",
      icon: "fas fa-home",
      text: "Dashboard",
      exact: true,
    },
    {
      path: "/admin/anime/manage-anime",
      icon: "fas fa-film",
      text: "Manage Anime",
      match: "/admin/anime",
    },
    {
      path: "/admin/episodes/manage-episodes",
      icon: "fas fa-play-circle",
      text: "Episodes",
      match: "/admin/episodes",
    },
    {
      path: "/admin/users/manage-users",
      icon: "fas fa-users",
      text: "Users",
      match: "/admin/users",
    },
    {
      path: "/admin/comments/manage-comments",
      icon: "fas fa-comments",
      text: "Comments",
      match: "/admin/comments",
    },
  ];

  return (
    <section id="sidebar" className="bg-dark text-white">
      <ul className="nav flex-column px-3">
        {navItems.map((item) => (
          <li className="nav-item mb-2" key={item.path}>
            <NavLink
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center rounded-pill p-3 ${
                  isActive ||
                  (item.match && location.pathname.startsWith(item.match))
                    ? "active bg-primary"
                    : "hover-effect"
                }`
              }
            >
              <div className="icon-wrapper">
                <i
                  className={`${item.icon} ${
                    isSmallScreen ? "fs-4" : "me-3 fs-5"
                  }`}
                ></i>
              </div>
              {!isSmallScreen && <span className="fw-medium">{item.text}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Sidebar;
