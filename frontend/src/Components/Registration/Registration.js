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
  const [modalConfirmCode, setModalConfirmCode] = useState(false);
  const [code, setCode] = useState('');
  const [errorCode, setErrorCode] = useState(false);

  const navigate = useNavigate();

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleCodeInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCode(value.slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lastname || !firstname || !email || !password) {
      return;
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
        setModalConfirmCode(true);
        localStorage.setItem('accessToken', response.accessToken);
      }
    } catch (error) {
      console.error('Ошибка регистрации', error);
    }
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
          setModalConfirmCode(false);
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
      {modalConfirmCode && (
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

export default Registration;
