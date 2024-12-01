import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import logo from '../../imgs/logoUDV.png';
import './Dashboard.css';
import userImg from '../../imgs/userPhoto.png';
import vectorOpen from '../../imgs/VectorOpen.png';
import { useHR } from '../HRContext';
import { useAvatar } from '../../AvatarContext';

const Dashboard = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [superUser, setSuperUser] = useState(false);
  const { isHRMode, setIsHRMode } = useHR();
  const { avatar, setAvatar } = useAvatar();
  const navigate = useNavigate();

  useEffect(() => {
    const access_token = localStorage.getItem('accessToken');
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://26.15.99.17:8000/profile/check/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        });
        const data = await response.json();
        setFirstName(data.firstname);
        setLastName(data.lastname);
        setSuperUser(data.super_user);
      } catch (error) {
        console.error('Ошибка при получении данных пользователя', error);
      }
    };

    fetch('http://26.15.99.17:8000/profile/photo/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.blob();
        }
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setAvatar(imageUrl);
      })
      .catch((error) => {
        console.error(error);
      });

    fetchUserData();
  }, [setAvatar]);

  const fullName = `${firstName} ${lastName}`;

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleLogout = async () => {
    await fetch('http://26.15.99.17:8000/v1/logout', {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem('accessToken');
    setIsHRMode(false);
    navigate('/login');
  };

  const toggleHRMode = (mode) => {
    setIsHRMode(mode);
    setIsDropdownOpen(false);
  };

  return (
    <div className="big-container">
      {isHRMode ? (
        <div className="container-hr">
          <div className="header-hr">
            <NavLink
              to="/dashboard/benefits"
              className="logo-link-hr"
              onClick={() => toggleHRMode(false)}
            >
              <img
                src={logo}
                alt="logoUDV"
                className="logo-hr"
              />
            </NavLink>

            <nav className="nav-hr">
              <ul className="nav-list-hr">
                <li className="nav-item-hr">
                  <NavLink
                    to="/dashboard/benefits"
                    className="item-hr"
                  >
                    Льготы
                  </NavLink>
                </li>

                <li className="nav-item-hr">
                  <NavLink
                    to="/dashboard/applications"
                    className="item-hr"
                  >
                    Заявки
                  </NavLink>
                </li>

                <li className="nav-item-hr">
                  <NavLink
                    to="/dashboard/statistics"
                    className="item-hr"
                  >
                    Статистика
                  </NavLink>
                </li>

                <li className="nav-item-hr">
                  <NavLink
                    to="/dashboard/users"
                    className="item-hr"
                  >
                    Пользователи
                  </NavLink>
                </li>
              </ul>
            </nav>

            <div className="user-profile-hr">
              <span className="username">{fullName}</span>
              <div className="user-icon-container">
                <img
                  src={avatar || userImg}
                  alt="account"
                  className="user-icon"
                />
              </div>
              <img
                src={vectorOpen}
                alt="open-logout"
                className="open-logout-vector"
                onClick={toggleDropdown}
              />
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {!isHRMode ? (
                    superUser && (
                      <NavLink to="/dashboard/benefits">
                        <button
                          className="dropdown-item"
                          onClick={() => toggleHRMode(true)}
                        >
                          Перейти в режим HR
                        </button>
                      </NavLink>
                    )
                  ) : (
                    <NavLink to="/dashboard/choose-benefit">
                      <button
                        className="dropdown-item"
                        onClick={() => toggleHRMode(false)}
                      >
                        Выйти из режима HR
                      </button>
                    </NavLink>
                  )}

                  <button
                    className="dropdown-item quit"
                    onClick={handleLogout}
                  >
                    Выйти из аккаунта
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="header">
          <NavLink
            to="/dashboard/choose-benefit"
            className={`logo-link`}
          >
            <img
              src={logo}
              alt="logoUDV"
              className={`logo`}
            />
          </NavLink>

          <nav className="nav">
            <ul className="nav-list">
              <li className="nav-item">
                <NavLink
                  to="/dashboard/choose-benefit"
                  className="item"
                  activeClassName="active"
                >
                  Выбор льгот
                </NavLink>
              </li>

              <li className={`nav-item`}>
                <NavLink
                  to="/dashboard/my-benefits"
                  className={`item`}
                >
                  Мои льготы
                </NavLink>
              </li>
              <li className={`nav-item`}>
                <NavLink
                  to="/dashboard/profile"
                  className={`item`}
                >
                  Личная информация
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className={`user-profile`}>
            <span className="username">{fullName}</span>
            <div className="user-icon-container">
              <img
                src={avatar || userImg}
                alt="account"
                className="user-icon"
              />
            </div>
            <img
              src={vectorOpen}
              alt="open-logout"
              className="open-logout-vector"
              onClick={toggleDropdown}
            />
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {!isHRMode ? (
                  superUser && (
                    <NavLink to="/dashboard/benefits">
                      <button
                        className="dropdown-item"
                        onClick={() => toggleHRMode(true)}
                      >
                        Перейти в режим HR
                      </button>
                    </NavLink>
                  )
                ) : (
                  <NavLink to="/dashboard/choose-benefit">
                    <button
                      className="dropdown-item"
                      onClick={() => toggleHRMode(false)}
                    >
                      Выйти из режима HR
                    </button>
                  </NavLink>
                )}

                <button
                  className="dropdown-item quit"
                  onClick={handleLogout}
                >
                  Выйти из аккаунта
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`content ${isHRMode && superUser ? 'content-hr' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
