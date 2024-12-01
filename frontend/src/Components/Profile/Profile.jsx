import React, { useEffect, useState } from 'react';
import userPhoto from '../../imgs/userPhoto.png';
import './Profile.css';
import { useAvatar } from '../../AvatarContext';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({});
  const { avatar, setAvatar } = useAvatar();
  const [deletedPhoto, setDeletedPhoto] = useState(false);

  useEffect(() => {
    const access_token = localStorage.getItem('accessToken');

    fetch('http://26.15.99.17:8000/profile/info/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => {
        if (deletedPhoto) {
          handleDeletePhoto();
        }
        setDeletedPhoto(false);
        return res.json();
      })
      .then((data) => {
        setUserInfo(data);
      })
      .catch((error) => console.error(error));

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
        setAvatar(userPhoto);
      });
  }, [setAvatar]);

  const handleUserPhotoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {
        const imageUrl = reader.result;
        setAvatar(imageUrl);
      };
    };

    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('photo', file);

    const access_token = localStorage.getItem('accessToken');

    fetch(`http://26.15.99.17:8000/profile/photo/update`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка при загрузке аватара');
        }
      })
      .catch((error) => console.error(error));
  };

  const handleDeletePhoto = async () => {
    const access_token = localStorage.getItem('accessToken');
    const deleteResponse = await fetch(`http://26.15.99.17:8000/profile/photo/delete`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    setDeletedPhoto(true);
    setAvatar(userPhoto);
    setIsModalOpen(false);
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

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
      return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`;
    }

    return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}, ${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}`;
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModalOpenWhenDenied = () => {
    setIsModalOpen(false);
    setDeletedPhoto(false);
  };

  const deletePhoto = () => {
    setIsModalOpen(true);
    setDeletedPhoto(false);
  };

  return (
    <div className="profile-container">
      <div className="user-photo">
        <button
          className="delete-user-photo"
          onClick={deletePhoto}
        >
          ✕
        </button>
        <div className="avatar-container">
          <img
            src={avatar}
            alt="user-avatar"
            style={{
              backgroundImage: `url(${avatar})`,
            }}
            className="user-avatar"
          />
        </div>
        <label className="custom-file-upload-avatar">
          <input
            type="file"
            accept="image/*"
            onChange={handleUserPhotoChange}
            className="upload-avatar-text"
          />
          Загрузить изображение
        </label>
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
            <p className="user-info-item">
              <label>Должность:</label> <span>{userInfo.profile.job_title ? userInfo.profile.job_title : 'Нет'}</span>
            </p>
            <p className="user-info-item">
              <label>Юр.лицо:</label> <span>{userInfo.profile.legal_entity ? userInfo.profile.legal_entity : 'Нет'}</span>
            </p>
            <p className="user-info-item">
              <label>Дата трудоустройства:</label> <span>{formatDate(userInfo.create_at ? userInfo.create_at : 'Нет')}</span>
            </p>
            <p className="user-info-item">
              <label>Стаж:</label> <span>{calculateExperience(userInfo.create_at ? userInfo.create_at : 'Нет')}</span>
            </p>
            <p className="user-info-item">
              <label>Адаптационный период:</label>
              <span>{userInfo.adap_period ? 'Пройден' : 'Не пройден'}</span>
            </p>
          </div>
        ) : (
          <p>Загрузка страницы...</p>
        )}
      </div>
      {isModalOpen && (
        <div className="dark-bgr-application">
          <div className="apply-application">
            <div className="first-application-row">
              <p>Удалить фото?</p>
            </div>
            <div className="second-application-row">
              <button
                className="application-deni-button"
                onClick={closeModalOpenWhenDenied}
              >
                Отмена
              </button>
              <button
                className="application-apply-button"
                onClick={handleDeletePhoto}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
