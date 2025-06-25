import styled from "@emotion/styled";
import { faBars, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MuiButton from "@mui/material/Button";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logo1.png"
import { API_BASE_URL } from "@/config";
import { useTranslation } from "react-i18next";
import Flag from 'react-world-flags';
import { useLanguage } from "../context/LanguageContext";

export const Button = styled(MuiButton)((props) => ({
  borderRadius: "25px",
  color: "#111",
  borderColor: "#111",
  padding: "8px 25px",
  ":hover": {
    borderColor: "#080",
  },
}));
const Navbar = () => {
  const [Visible, setVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [Official, setOfficial] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

 const { changeLanguage } = useLanguage();
 const { t } = useTranslation();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/");
  };
  useEffect(() => {
    if (userId && token) {
      // Fetch user info from backend using the token
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
      <div className="Navbar w-screen flex justify-between items-center px-4 py-2 lg:py-4 lg:px-8">
        <Link to={Official ? "/official-dashboard" : "/citizen-dashboard"}>
          <div className="LogoGroup flex items-center gap-3">
            <img className="logo h-12 lg:h-12 w-12 rounded-full object-cover" src={Logo} />
            <h2 className="font-bold text-sm animate-typing whitespace-nowrap overflow-hidden lg:text-lg">{t('shiv vihar vikas samiti')}</h2>
          </div>
        </Link>
        {user ? (
          <div className="ButtonGroup gap-8 hidden lg:flex">

            <Button
              component={Link}
             
              to={{
                      pathname: `/report`,
                      state: { user }, // ✅ Pass user in state
                    }}
              state={{ user }} 
              variant="outlined"
            >
              {t('New Complaint')}
            </Button>

            <Button
              component={Link}
              to={Official ? "/official-dashboard" : "/citizen-dashboard"}
              variant="outlined"
            >
              {t('Dashboard')}
            </Button>

            <Button
              component={Link}
              to="/profile-dashboard"
              variant="outlined"
              className="flex gap-3"
            >
              <img
                src={
                  user?.mediaPath?.buffer
                    ? `data:image/png;base64,${user.mediaPath.buffer}`
                    : "/default-avatar.png" // Use your local or hosted default image
                }
                alt="Profile"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span>
                {t('Profile')}
              </span>
            </Button>

            <Button onClick={handleLogout} variant="outlined">


               {t('Logout')}
            </Button>
            <button onClick={() => changeLanguage('en')}><Flag code="US" style={{ width: 24, height: 16 }} /></button>
            <button onClick={() => changeLanguage('hi')}><Flag code="IN" style={{ width: 24, height: 16 }} /></button>
          </div>
        ) : (
          <div className="ButtonGroup gap-8 hidden lg:flex">
            <Button component={Link} to={"/official-login"} variant="outlined">
              {t("Official Login")}
            </Button>
            <Button component={Link} to={"/citizen-login"} variant="outlined">
              {t("Citizen Login")}
            </Button>
            <button onClick={() => changeLanguage('en')}><Flag code="US" style={{ width: 24, height: 16 }} /></button>
      <button onClick={() => changeLanguage('hi')}><Flag code="IN" style={{ width: 24, height: 16 }} /></button>
          </div>
        )}

        <FontAwesomeIcon
          className="lg:hidden"
          icon={Visible ? faClose : faBars}
          onClick={() => {
            setVisible(!Visible);
          }}
        />
      </div>
      <div
        className={`MenuMobile lg:hidden w-full text-center py-20 absolute bg-white z-10 rounded-3xl ${Visible ? "block" : "hidden"
          }`}
      >
        <ul className=" flex flex-col gap-16 font-bold">
          {user ? (
            <>
              <Link
                to={Official ? "/official-dashboard" : "/citizen-dashboard"}
              >
                {t('Dashboard')}
              </Link>
              <Link
                to={{
                      pathname: `/report`,
                      state: { user }, // ✅ Pass user in state
                    }}
              state={{ user }} 
                >
                {t('New Complaint')}
              </Link>
              <Link
                to={"/profile-dashboard"}
              >
              {t('Profile')}
              </Link>
              <Link onClick={handleLogout}>
              {t('Logout')}
              </Link>{" "}
              <Link onClick={() => changeLanguage('en')}><Flag code="US" style={{ width: 24, height: 16 }} /></Link>
              <Link onClick={() => changeLanguage('hi')}><Flag code="IN" style={{ width: 24, height: 16 }} /></Link>      
              <Link
                to={"https://8bit.co.in/"}
              >
                Developed By : 8bit System Private Limited
              </Link>
            </>
          ) : (
            <>
              <Link to={"/citizen-login"}>{t("Citizen Login")}</Link>
              <Link to={"/official-login"}>{t("Official Login")}</Link>
            </>
          )}
        </ul>
      </div>
    </>
  );
};

export default Navbar;
