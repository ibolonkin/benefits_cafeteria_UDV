import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registration } from '../../auth';
import logo from '../../imgs/logoUDV.png';
import './Registration.css';

const Registration = () => {
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lastname || !firstname || !email || !password) {
      alert('Все поля должны быть заполнены');
      return;
    }

    if (password.length < 4 || password.length > 15) {
      alert('Пароль должен быть от 4 до 15 символов');
    }
    try {
      const response = await registration({
        lastname,
        firstname,
        middlename,
        email,
        password,
      });

      if (response) {
        alert('Регистрация прошла успешна!');
        navigate('/login');
      }
      localStorage.setItem('accessToken', response.accessToken);
    } catch (error) {
      console.error('Ошибка регистрации', error);
    }
  };

  return (
    <div className="container-reg">
      <div className="header-reg">
        <img
          src={logo}
          alt="logoUDV"
          className="logo-reg"
          width={'231px'}
          height={'46px'}
        />
      </div>
      <div className="form-container-reg">
        <div className="form-rectangle-reg">
          <form className="form-reg">
            <h2 className="reg">Регистрация</h2>
            <input
              onChange={(e) => setLastname(e.target.value)}
              className="input-reg"
              value={lastname}
              type="text"
              placeholder="Фамилия"
              required
            />

            <input
              onChange={(e) => setFirstname(e.target.value)}
              className="input-reg"
              value={firstname}
              type="text"
              placeholder="Имя"
              required
            />

            <input
              onChange={(e) => setMiddlename(e.target.value)}
              className="input-reg"
              value={middlename}
              type="text"
              placeholder="Отчество (при наличии)"
              required
            />

            <input
              onChange={handleEmail}
              className="input-reg"
              value={email}
              type="email"
              placeholder="Email"
            />

            <input
              onChange={handlePassword}
              className="input-reg"
              value={password}
              type="password"
              minLength={4}
              maxLength={15}
              placeholder="Пароль"
            />

            <button
              onClick={handleSubmit}
              className="btn"
              type="submit"
            >
              Зарегистрироваться
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
