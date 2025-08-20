import styled from "@emotion/styled";
import { faBars, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MuiButton from "@mui/material/Button";
import { Menu, MenuItem, Tooltip, Badge } from "@mui/material";
import { ExpandMore, Dashboard, Report, People, Person, ExitToApp, AdminPanelSettings } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/logo1.png";
import { API_BASE_URL } from "@/config";
import { useTranslation } from "react-i18next";
import Flag from "react-world-flags";
import { useLanguage } from "../context/LanguageContext";

export const Button = styled(MuiButton)(({ theme, active }) => ({
  borderRadius: "25px",
  color: active ? "#fff" : "#111",
  borderColor: active ? "#4f46e5" : "#111",
  backgroundColor: active ? "#4f46e5" : "transparent",
  padding: "8px 20px",
  fontSize: "0.875rem",
  fontWeight: "500",
  textTransform: "none",
  transition: "all 0.2s ease-in-out",
  ":hover": {
    borderColor: "#4f46e5",
    backgroundColor: active ? "#4338ca" : "#f8fafc",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.15)",
  },
  ":active": {
    transform: "translateY(0)",
  },
}));

const Navbar = () => {
  const [Visible, setVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [Official, setOfficial] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const { changeLanguage } = useLanguage();
  const { t, i18n } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = (lang) => {
    if (lang) changeLanguage(lang);
    setAnchorEl(null);
  };

  // Helper function to check if current route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Navigation items configuration
  const getNavigationItems = () => {
    if (!user) {
      return [
        { path: "/citizen-login", label: t("Citizen Login"), icon: <Person />, variant: "outlined" },
        { path: "/official-login", label: t("Official Login"), icon: <AdminPanelSettings />, variant: "contained" },
      ];
    }

    const baseItems = [
      { 
        path: Official ? "/official-dashboard" : "/citizen-dashboard", 
        label: t("Dashboard"), 
        icon: <Dashboard />,
        primary: true
      },
      { path: "/report", label: t("New Complaint"), icon: <Report />, state: { user } },
      { path: "/level-tree", label: t("Members"), icon: <People /> },
    ];

    if (Official) {
      baseItems.splice(2, 0, {
        path: "/user-dashboard",
        label: t("Users"),
        icon: <AdminPanelSettings />
      });
    }

    return baseItems;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/");
  };

  useEffect(() => {
    if (userId && token) {
      fetch(API_BASE_URL + "/user/" + userId, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          setUser(user);
          setOfficial(user.type === "admin");
        })
        .catch(() => {
          setUser(null);
          setOfficial(false);
        });
    } else {
      setUser(null);
      setOfficial(false);
    }
  }, [userId, token]);

  return (
    <>
      <div
        className="
            Navbar
            fixed top-0 left-0 w-full z-50
            h-16          
            bg-white/95 backdrop-blur-md
            border-b border-gray-200
            flex justify-between items-center
            px-4 py-2 lg:py-4 lg:px-8
            shadow-sm
          "
      >
        <Link 
          to={user ? (Official ? "/official-dashboard" : "/citizen-dashboard") : "/"}
          className="hover:opacity-80 transition-opacity"
        >
          <div className="LogoGroup flex items-center gap-3">
            <div className="relative">
              <img 
                className="logo h-12 lg:h-12 w-12 rounded-full object-cover ring-2 ring-indigo-100" 
                src={Logo} 
                alt="Shiv Vihar Vikas Samiti Logo" 
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="font-bold text-lg text-gray-900 leading-tight">
                {t("shiv vihar vikas samiti")}
              </h2>
              <p className="text-xs text-gray-500 -mt-1">
                Community Management System
              </p>
            </div>
          </div>
        </Link>

        <div className="ButtonGroup gap-3 hidden lg:flex items-center">
          {/* Main Navigation Items */}
          {getNavigationItems().map((item) => (
            <Tooltip key={item.path} title={item.label} arrow>
              <Button
                component={Link}
                to={item.path}
                state={item.state}
                variant={item.primary ? "contained" : "outlined"}
                active={isActiveRoute(item.path)}
                startIcon={item.icon}
                className="nav-item"
              >
                {item.label}
              </Button>
            </Tooltip>
          ))}

          {/* User Profile & Actions */}
          {user && (
            <>
              <div className="h-6 w-px bg-gray-300 mx-2" />
              <Tooltip title={t("Profile")} arrow>
                <Button 
                  component={Link} 
                  to="/profile-dashboard" 
                  variant="outlined"
                  active={isActiveRoute("/profile-dashboard")}
                  className="profile-btn"
                >
                  <img
                    src={
                      user?.mediaPath?.buffer
                        ? `data:image/png;base64,${user.mediaPath.buffer}`
                        : "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover mr-2"
                  />
                  <span className="hidden xl:inline">{user.name || t("Profile")}</span>
                </Button>
              </Tooltip>
              <Tooltip title={t("Logout")} arrow>
                <Button 
                  onClick={handleLogout} 
                  variant="outlined"
                  startIcon={<ExitToApp />}
                  className="logout-btn text-red-600 border-red-300 hover:border-red-500 hover:bg-red-50"
                >
                  <span className="hidden xl:inline">{t("Logout")}</span>
                </Button>
              </Tooltip>
            </>
          )}

          {/* Language Dropdown */}
          <div className="ml-2">
            <Tooltip title={t("Language")} arrow>
              <Button 
                variant="outlined" 
                onClick={handleMenuClick} 
                endIcon={<ExpandMore />}
                className="language-btn min-w-0"
              >
                <Flag code={i18n.language === "en" ? "US" : "IN"} style={{ width: 20, marginRight: 8 }} />
                <span className="hidden xl:inline">
                  {i18n.language === "en" ? t("English") : t("Hindi")}
                </span>
              </Button>
            </Tooltip>
            <Menu 
              anchorEl={anchorEl} 
              open={open} 
              onClose={() => handleMenuClose(null)}
              PaperProps={{
                sx: {
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0'
                }
              }}
            >
              <MenuItem 
                onClick={() => handleMenuClose("en")}
                selected={i18n.language === "en"}
                sx={{ borderRadius: '8px', margin: '4px' }}
              >
                <Flag code="US" style={{ width: 24, marginRight: 12 }} /> 
                {t("English")}
              </MenuItem>
              <MenuItem 
                onClick={() => handleMenuClose("hi")}
                selected={i18n.language === "hi"}
                sx={{ borderRadius: '8px', margin: '4px' }}
              >
                <Flag code="IN" style={{ width: 24, marginRight: 12 }} /> 
                {t("Hindi")}
              </MenuItem>
            </Menu>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setVisible(!Visible)}
          aria-label={Visible ? t("Close Menu") : t("Open Menu")}
        >
          <FontAwesomeIcon 
            icon={Visible ? faClose : faBars} 
            className="w-5 h-5 text-gray-700"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`MenuMobile lg:hidden w-full absolute bg-white z-40 shadow-xl border-t transition-all duration-300 ease-in-out ${
          Visible ? "top-16 opacity-100" : "-top-full opacity-0"
        }`}
      >
        <div className="px-4 py-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* User Profile Section (Mobile) */}
          {user && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
              <img
                src={
                  user?.mediaPath?.buffer
                    ? `data:image/png;base64,${user.mediaPath.buffer}`
                    : "/default-avatar.png"
                }
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">
                  {Official ? t("admin") : t("citizen")}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="space-y-2">
            {getNavigationItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                state={item.state}
                onClick={() => setVisible(false)}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                  isActiveRoute(item.path)
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {user && (
              <>
                <div className="border-t border-gray-200 my-4" />
                <Link
                  to="/profile-dashboard"
                  onClick={() => setVisible(false)}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                    isActiveRoute("/profile-dashboard")
                      ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Person />
                  <span className="font-medium">{t("Profile")}</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setVisible(false);
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left"
                >
                  <ExitToApp />
                  <span className="font-medium">{t("Logout")}</span>
                </button>
              </>
            )}
          </nav>

          {/* Language Selection (Mobile) */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-3">{t("Language")}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  changeLanguage("en");
                  setVisible(false);
                }}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  i18n.language === "en"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Flag code="US" style={{ width: 20 }} />
                <span className="text-sm font-medium">{t("English")}</span>
              </button>
              <button
                onClick={() => {
                  changeLanguage("hi");
                  setVisible(false);
                }}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  i18n.language === "hi"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Flag code="IN" style={{ width: 20 }} />
                <span className="text-sm font-medium">{t("Hindi")}</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <a 
              href="https://8bit.co.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Developed By: 8bit System Private Limited
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
