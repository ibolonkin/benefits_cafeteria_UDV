import React, { useEffect, useState } from 'react';
import userPhoto from '../../imgs/userPhoto.png';
import './Profile.css';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const access_token = localStorage.getItem('accessToken');

    fetch('http://26.15.99.17:8000/v1/me/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUserInfo(data))
      .catch((error) => console.error(error));
  }, []);

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-')
    return `${day}.${month}.${year}`
  }

  const calculateExperience = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (months === 0) {
        return `${years} ${years === 1 ? 'год' : (years < 5 ? 'года' : 'лет')}`
    }

    return `${years} ${years === 1 ? 'год' : (years < 5 ? 'года' : 'лет')}, ${months} ${months === 1 ? 'месяц' : (months < 5 ? 'месяца' : 'месяцев')}`;
  };

  console.log(userInfo);
  return (
    <div className="profile-container">
      <div className="user-photo">
        <img
          src={userPhoto}
          alt="user-photo"
          style={{ borderRadius: '360px' }}
        />
        <a className='change-profile-photo' onClick={() => alert('В разработке')}>Изменить фото</a>
      </div>

      <div className="user-self-info">
        {userInfo.profile ? (
          <div user-info-container>
            <p className="user-fullname">
              {userInfo.profile.lastname} {userInfo.profile.firstname} {userInfo.profile.middlename}
            </p>
            <p className="user-info-item">
              <label>Email:</label>
              <span>{userInfo.email}</span>
            </p>
            <p className="user-info-item"><label>Должность:</label> <span>{userInfo.profile.job_title ? userInfo.profile.job_title : 'Нет'}</span></p>
            <p className="user-info-item"><label>Юр.лицо:</label> <span>{userInfo.profile.legal_entity ? userInfo.profile.legal_entity : 'Нет'}</span></p>
            <p className="user-info-item"><label>Дата трудоустройства:</label> <span>{formatDate(userInfo.create_at ? userInfo.create_at : 'Нет')}</span></p>
            <p className="user-info-item"><label>Стаж:</label> <span>{calculateExperience(userInfo.create_at ? userInfo.create_at : 'Нет')}</span></p>
            <p className="user-info-item"><label>Адаптационный период:</label><span>{userInfo.adap_period ? 'Пройден' : 'Не пройден'}</span></p>
          </div>
        ) : (
          <p>Загрузка страницы...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
