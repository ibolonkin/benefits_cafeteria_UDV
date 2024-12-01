import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../auth';
import './Login.css';
import logo from '../../imgs/logoUDV.png';
import { isVerified } from '../AuthContext'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const [code, setCode] = useState('');
  const [errorCode, setErrorCode] = useState(false);

  const handleCodeInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCode(value.slice(0, 5));
  };

  const handleConfirmCode = async () => {
    if (code.length === 5) {
      const access_token = localStorage.getItem('accessToken');
      const response = await fetch('http://26.15.99.17:8000/v1/verify_mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ user_code: code }),
      });
      if (response.ok) {
        const waitToken = await response.json();
        if (waitToken.accessToken) {
          localStorage.setItem('accessToken', waitToken.accessToken);
          navigate('/dashboard');
        }
      } else {
        setErrorCode(true);
      }
    } else {
      setErrorCode(true);
    }
  };

  const handleAgainGetCode = async () => {
    const access_token = localStorage.getItem('accessToken');
      const response = await fetch('http://26.15.99.17:8000/v1/verify_code', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      if(response.ok) {
        return;
      }
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      // alert('Все поля должны быть заполнены');
      return;
    }

    if (password.length < 4 || password.length > 15) {
      // alert('Пароль должен быть от 4 до 15 символов');
      return;
    }

    try {
      const response = await login({ email, password });
      let token = (await response.json()).accessToken;
      console.log(token);
      localStorage.setItem('accessToken', token);
      console.log(response)
      if (response.ok) {
        navigate('/dashboard/choose-benefit');
      }
    } catch (error) {
      console.error('Ошибка входа', error);
    }
  };

  return (
    <div className="container-log">
      <div className="header-log">
        <img
          src={logo}
          alt="logoUDV"
          className="logo-log"
          width={'231px'}
          height={'46px'}
        />
      </div>
      <div className="form-container-log">
        <div className="form-rectangle-log">
          <form
            className="form-log"
          >
            <h2 className="log">Вход</h2>
            <input
              onChange={(e) => setEmail(e.target.value)}
              className="input-log"
              value={email}
              type="email"
              placeholder="Email"
            />

            <input
              onChange={(e) => setPassword(e.target.value)}
              className="input-log"
              value={password}
              type="password"
              minLength={4}
              maxLength={15}
              required
              placeholder="Пароль"
            />

            <button
              type="submit"
              className="btn-log"
              onClick={handleLogin}
            >
              Войти
            </button>
            <div className="new-account">
              <span className="have-account">Ещё нет аккаунта?</span>
              <a
                href="/"
                className="to-reg"
              >
                Зарегистрироваться
              </a>
            </div>
          </form>
        </div>
      </div>
      {!isVerified && (
        <div className="modal-overlay-code">
          <div className="modal-window-code">
            <h2>На вашу почту был отправлен код для подтверждения</h2>
            <p className="modal-text-code">Введите код:</p>
            <input
              className="code-input"
              type="text"
              value={code}
              onChange={handleCodeInput}
              placeholder="_____"
              maxLength={5}
            />
            <button
              className="again-code-btn"
              onClick={handleAgainGetCode}
            >
              Запросить код снова
            </button>
            {errorCode && <p className="error-code-msg">Неправильно введён код!</p>}
            <button
              className="code-btn"
              onClick={handleConfirmCode}
            >
              Отправить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
