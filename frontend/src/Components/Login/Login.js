import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../auth';
import './Login.css';
import logo from '../../imgs/logoUDV.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Все поля должны быть заполнены');
      return;
    }

    if (password.length < 4 || password.length > 15) {
      alert('Пароль должен быть от 4 до 15 символов');
      return;
    }

    try {
      const response = await login({ email, password });
      let token = (await response.json()).accessToken;
      console.log(token);
      localStorage.setItem('accessToken', token);
      if (response) {
        alert('Вход успешен!');
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
            onSubmit={handleLogin}
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
    </div>
  );
};

export default Login;
