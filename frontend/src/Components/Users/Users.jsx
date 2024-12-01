import React, { useEffect, useState } from 'react';
import './Users.css';
import UCoin from '../../imgs/uCoinLogo.png';
import userPhoto from '../../imgs/userPhoto.png';
import undo from '../../imgs/undo.png';

const Users = () => {
  const [data, setData] = useState({ users: [], len: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [ucoinIcon, setUcoinIcon] = useState(true);
  const [photoUrl, setPhotoURL] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [deletedPhoto, setDeletedPhoto] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const usersPerPage = 5;

  const access_token = localStorage.getItem('accessToken');

  const fetchUsers = async (currentPage, field = sortField, order = sortOrder) => {
    const start = (currentPage - 1) * usersPerPage;
    const sortQuery = field ? `&order_by=${field}&sort_order=${order}` : '';
    try {
      const response = await fetch(`http://26.15.99.17:8000/u/?start=${start}&offset=${usersPerPage}${sortQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      const result = await response.json();
      setData(result);
      setIsSearching(false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSearchResults = async (searchQuery) => {
    try {
      const response = await fetch(`http://26.15.99.17:8000/u/search?q=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      const result = await response.json();
      setData({ users: result, len: result.length });
      setIsSearching(true);
    } catch (error) {
      console.error('Ошибка при поиске:', error);
      setData({ users: [], len: 0 });
    }
  };

  const handleSearchChange = (e) => setQuery(e.target.value);

  const handleSearch = () => {
    if (query.trim()) {
      fetchSearchResults(query);
    } else {
      fetchUsers(currentPage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const uploadUserPhoto = async (userId) => {
    const formData = new FormData();
    formData.append('photo', photo);

    try {
      const response = await fetch(`http://26.15.99.17:8000/u/${userId}/photo/update`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: formData,
      });

      if (response.ok) {
        // alert('Фото успешно загружено');
        setPhoto(null);
      } else {
        // alert('Не удалось загрузить фото');
      }
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
    }
  };

  const handleUserPhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setPhotoURL(URL.createObjectURL(e.target.files[0]));
      setDeletedPhoto(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, []);

  const totalPages = Math.ceil(data.len / usersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchUsers(page);
    }
  };
  const handleNumberPageChange = (page) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
    setCurrentPage(1);
    fetchUsers(1, field, order);
  };

  const [isModalbenefitsUserOpen, setIsModalbenefitsUserOpen] = useState(false);
  const [selectedUserBenefits, setSelectedUserBenefits] = useState([]);

  const openBenefitUserModal = async (user) => {
    const response = await fetch(`http://26.15.99.17:8000/u/${user.uuid}/benefits`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();
    setSelectedUserBenefits(data);
    setIsModalbenefitsUserOpen(true);
  };

  const openModal = async (user) => {
    const response = await fetch(`http://26.15.99.17:8000/u/${user.uuid}/info/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();
    setSelectedUser(data);
    setOriginalData(JSON.parse(JSON.stringify(user)));
    setIsModalOpen(true);
    setIsModalbenefitsUserOpen(false);

    const photoResponse = await fetch(`http://26.15.99.17:8000/u/${user.uuid}/photo/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (photoResponse.ok) {
      const imageBlob = await photoResponse.blob();
      setPhotoURL(URL.createObjectURL(imageBlob));
    }
  };

  const handleDeleteUserBenefit = async (user, benefit) => {
    const deniedStatus = { status: 'Denied' };
    const response = await fetch(`http://26.15.99.17:8000/u/${user.uuid}/benefits/${benefit}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deniedStatus),
    });
    if (response.ok) {
      openBenefitUserModal(user);
    }
  };

  const handleDeletePhoto = async (userId) => {
    const deleteResponse = await fetch(`http://26.15.99.17:8000/u/${userId}/photo/delete`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (deleteResponse.ok) {
      console.log('ok');
    }
  };

  const closeModal = (user) => {
    setIsModalOpen(false);
    setIsEditing(false);
    setUcoinIcon(true);
    setSelectedUser(null);
    setDeletedPhoto(false);
    setIsModalbenefitsUserOpen(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setUcoinIcon(false);
  };

  const handleInputChange = (field, value) => {
    if (field === 'email') {
      setSelectedUser((prevUser) => ({
        ...prevUser,
        email: value,
      }));
    } else if (field === 'super_user' || field === 'active' || field === 'adap_period') {
      setSelectedUser((prevUser) => ({
        ...prevUser,
        [field]: value,
      }));
    } else if (field === 'ucoin') {
      setSelectedUser((prevUser) => ({
        ...prevUser,
        ucoin: parseFloat(value) || 0,
      }));
    } else if (field === 'create_at') {
      const formattedDate = parseAndFormatDate(value);
      setSelectedUser((prevUser) => ({
        ...prevUser,
        create_at: formattedDate || value,
      }));
    } else {
      setSelectedUser((prevUser) => ({
        ...prevUser,
        profile: {
          ...prevUser.profile,
          [field]: value,
        },
      }));
    }
  };

  const openConfirmModal = () => setShowConfirmModal(true);

  const closeConfirmModal = () => {
    setSelectedUser((prevUser) => ({
      ...originalData,
      ucoin: originalData.ucoin || prevUser.ucoin,
    }));
    setShowConfirmModal(false);
    setSelectedUser(originalData);
    setIsEditing(false);
    setUcoinIcon(true);
  };

  const handleSaveChange = async () => {
    try {
      const response = await fetch(`http://26.15.99.17:8000/u/${selectedUser.uuid}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(selectedUser),
      });
      if (response.ok) {
        if (deletedPhoto) {
          handleDeletePhoto(selectedUser.uuid);
        }
        setDeletedPhoto(false);
        setOriginalData(selectedUser);
        setShowConfirmModal(false);
        setIsEditing(false);
        setUcoinIcon(true);
      } else if (response.status === 422) {
        // alert('Вы ввели неправильные данные (алерты уберутся до финального прода)')
        setShowConfirmModal(false);
      } else {
        console.error(response.statusText);
      }
    } catch (error) {
      console.error(error);
    }
    if (photo) {
      uploadUserPhoto(selectedUser.uuid);
    }
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
    const yearsWord = `${years} ${years % 100 >= 11 && years % 100 <= 19 ? 'г' : years % 10 === 1 ? 'г' : years % 10 >= 2 && years % 10 <= 4 ? 'г' : 'г'}`;
    if (months === 0) {
      return yearsWord;
    }

    return `${yearsWord}, ${months} ${months === 1 ? 'м' : months < 5 ? 'м' : 'м'}`;
  };

  const deletePhoto = () => {
    setPhoto(null);
    setPhotoURL(userPhoto);
    setDeletedPhoto(true);
  };

  const parseAndFormatDate = (input) => {
    const dateFormats = [
      /^(\d{2})\.(\d{2})\.(\d{4})$/, // DD.MM.YYYY
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
      /^(\d{2})-(\d{2})-(\d{4})$/,
    ];

    for (const format of dateFormats) {
      const match = input.match(format);
      if (match) {
        const [, part1, part2, part3] = match;
        if (format === dateFormats[0] || format === dateFormats[3]) {
          return `${part3}-${part2}-${part1}`;
        } else if (format === dateFormats[2]) {
          return `${part3}-${part1}-${part2}`;
        }
        return input;
      }
    }
    return null;
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="users-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Поиск"
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleKeyPress}
            />
            <button onClick={handleSearch}>Найти</button>
          </div>
          <div className={`header-row ${isSearching ? 'header-row-none' : ''}`}>
            <span>
              <span
                className={`clickable-text ${sortField === 'name' ? sortOrder : ''}`}
                onClick={() => handleSort('name')}
              >
                Имя пользователя
              </span>
            </span>
            <span>
              <span
                className={`clickable-text ${sortField === 'create_at' ? sortOrder : ''}`}
                onClick={() => handleSort('create_at')}
              >
                Стаж
              </span>
            </span>
            <span>
              <span
                className={`clickable-text ${sortField === 'job_title' ? sortOrder : ''}`}
                onClick={() => handleSort('job_title')}
              >
                Должность
              </span>
            </span>
            <span>
              <span
                className={`clickable-text ${sortField === 'email' ? sortOrder : ''}`}
                onClick={() => handleSort('email')}
              >
                Почта
              </span>
            </span>
          </div>
          {data.users.map((user) => (
            <div
              key={user.uuid}
              className="user-card"
              onClick={() => openModal(user)}
            >
              <span>
                {user.profile.firstname} {user.profile.lastname}
              </span>
              <span>{calculateExperience(user.create_at)}</span>
              <span>{user.profile.job_title ? user.profile.job_title : 'Нет'}</span>
              <span>{user.email}</span>
              <span className="more">...</span>
            </div>
          ))}

          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {'<'}
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? 'active-pagination' : ''}
                onClick={() => handleNumberPageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {'>'}
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div
            className="modal-content-hr"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal-hr"
              onClick={closeModal}
            >
              ✕
            </button>
            {selectedUser && (
              <div className="user-container-hr-wrapper">
                <div className="user-container-hr">
                  <div className="close-modal-div-users">
                    <img
                      className="close-modal-hr-benefit"
                      alt="close"
                      onClick={closeModal}
                      src={undo}
                      width={'34px'}
                      height={'34px'}
                    />
                    <button
                      className={`close-modal-users-info-item-hr ${isModalbenefitsUserOpen ? 'unactive-benefit-btn' : ''}`}
                      onClick={() => {
                        setIsModalOpen(true);
                        setIsModalbenefitsUserOpen(false);
                      }}
                    >
                      Профиль пользователя
                    </button>
                    <button
                      className={`close-modal-users-info-item-hr ${!isModalbenefitsUserOpen ? 'unactive-benefit-btn' : ''}`}
                      onClick={() => openBenefitUserModal(selectedUser)}
                    >
                      Льготы пользователя
                    </button>
                  </div>
                  {!isEditing ? (
                    <div className="user-photo">
                      <div className="avatar-container">
                        <img
                          src={photoUrl ? photoUrl : userPhoto}
                          alt="user-avatar"
                          className="user-avatar"
                        />
                      </div>
                      <a
                        className="change-info-hr"
                        onClick={handleEditClick}
                      >
                        Редактировать
                      </a>
                    </div>
                  ) : (
                    <div className="user-photo">
                      <button
                        className="delete-user-photo"
                        onClick={deletePhoto}
                      >
                        ✕
                      </button>
                      <div className="avatar-container">
                        <img
                          src={photoUrl ? photoUrl : userPhoto}
                          alt="user-avatar"
                          className="user-avatar"
                        />
                      </div>
                      <label className="custom-file-upload-avatar">
                        <input
                          type="file"
                          accept="image/*"
                          className="upload-avatar-text"
                          onChange={handleUserPhotoChange}
                        />
                        Загрузить изображение
                      </label>
                      <a
                        className="change-info-hr"
                        onClick={handleEditClick}
                      >
                        Редактировать
                      </a>
                    </div>
                  )}

                  <div className="user-info-container">
                    <p className="user-fullname-hr">
                      {selectedUser.profile.lastname} {selectedUser.profile.firstname} {selectedUser.profile.middlename}
                    </p>
                    <p className="user-info-item-hr">
                      <label>Email:</label>
                      {isEditing ? (
                        <input
                          className="input-user-class"
                          type="text"
                          value={selectedUser.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      ) : (
                        <span>{selectedUser.email}</span>
                      )}
                    </p>
                    <p className="user-info-item-hr">
                      <label>Должность:</label>
                      {isEditing ? (
                        <input
                          className="input-user-class"
                          type="text"
                          value={selectedUser.profile.job_title || ''}
                          onChange={(e) => handleInputChange('job_title', e.target.value)}
                        />
                      ) : (
                        <span>{selectedUser.profile.job_title || 'Нет'}</span>
                      )}
                    </p>
                    <p className="user-info-item-hr">
                      <label>Права администратора:</label>
                      {isEditing ? (
                        <select
                          className="input-user-class"
                          value={selectedUser.super_user ? 'Да' : 'Нет'}
                          onChange={(e) => handleInputChange('super_user', e.target.value === 'Да')}
                        >
                          <option value="Да">Да</option>
                          <option value="Нет">Нет</option>
                        </select>
                      ) : (
                        <span>{selectedUser.super_user ? 'Да' : 'Нет'}</span>
                      )}
                    </p>
                    <p className="user-info-item-hr">
                      <label>Юр.лицо:</label>
                      {isEditing ? (
                        <input
                          className="input-user-class"
                          type="text"
                          value={selectedUser.profile.legal_entity || ''}
                          onChange={(e) => handleInputChange('legal_entity', e.target.value)}
                        />
                      ) : (
                        <span>{selectedUser.profile.legal_entity || 'Нет'}</span>
                      )}
                    </p>
                    <p className="user-info-item-hr">
                      <label>Дата трудоустройства:</label>
                      {isEditing ? (
                        <input
                          className="input-user-class"
                          type="text"
                          placeholder="гггг-мм-дд"
                          value={selectedUser.create_at || ''}
                          onChange={(e) => handleInputChange('create_at', e.target.value)}
                        />
                      ) : (
                        <span>{formatDate(selectedUser.create_at)}</span>
                      )}
                    </p>
                    <p className="user-info-item-hr">
                      <label>Стаж:</label> <span>{calculateExperience(selectedUser.create_at ? selectedUser.create_at : 'Нет')}</span>
                    </p>
                    <p className="user-info-item-hr">
                      <label>Адаптационный период:</label>
                      {isEditing ? (
                        <select
                          className="input-user-class"
                          value={selectedUser.adap_period ? 'Пройден' : 'Не пройден'}
                          onChange={(e) => handleInputChange('adap_period', e.target.value === 'Пройден')}
                        >
                          <option value="Пройден">Пройден</option>
                          <option value="Не пройден">Не пройден</option>
                        </select>
                      ) : (
                        <span>{selectedUser.adap_period ? 'Пройден' : 'Не пройден'}</span>
                      )}
                    </p>
                    <p className="user-info-item-ucoin">
                      UCoin:{''}
                      {isEditing ? (
                        <input
                          className="input-user-class"
                          type="number"
                          value={selectedUser.ucoin || ''}
                          onChange={(e) => handleInputChange('ucoin', e.target.value)}
                        />
                      ) : (
                        <span className="UCoin-value">{selectedUser.ucoin}</span>
                      )}
                      {ucoinIcon && (
                        <img
                          src={UCoin}
                          alt=""
                          className="UCoin-logo-hr"
                        />
                      )}
                    </p>
                    <p className="user-info-item-hr">
                      <label className="status-user">Статус пользователя:</label>
                      {isEditing ? (
                        <select
                          className="input-user-class"
                          value={selectedUser.active ? 'Активен' : 'Удален'}
                          onChange={(e) => handleInputChange('active', e.target.value === 'Активен')}
                        >
                          <option value="Активен">Активен</option>
                          <option value="Удален">Удален</option>
                        </select>
                      ) : (
                        <span className={`${selectedUser.active === true ? 'active-input' : 'inactive-input'}`}>{selectedUser.active ? 'Активен' : 'Удален'}</span>
                      )}
                    </p>
                    {isEditing && (
                      <button
                        className="save-button-benefit save-button-benefit-user"
                        onClick={openConfirmModal}
                      >
                        Сохранить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {showConfirmModal && (
            <div className="dark-bgr-application">
              <div className="apply-application">
                <div className="first-application-row">
                  <p>Вы хотите сохранить изменения?</p>
                </div>
                <div className="second-application-row">
                  <button
                    className="application-deni-button"
                    onClick={closeConfirmModal}
                  >
                    Отмена
                  </button>
                  <button
                    className="application-apply-button"
                    onClick={handleSaveChange}
                  >
                    Да, я уверен
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isModalbenefitsUserOpen && (
        <div className="open-user-benefits">
          <div className="open-user-benefits-content">
            {selectedUserBenefits.filter((element) => element.status === 'Approved').length === 0 ? (
              <h2 className="zero-benefits-user">Льгот нет</h2>
            ) : (
              selectedUserBenefits
                .filter((element) => element.status === 'Approved')
                .map((benefit) => (
                  <div className="benefit-user-card">
                    <div className="benefit-row">
                      <p className="choosen-benefit-label">Название льготы</p>
                      <p className="choosen-benefit-value">{benefit.name}</p>
                    </div>
                    <div className="benefit-row">
                      <p className="choosen-benefit-label">Категория</p>
                      <p className="choosen-benefit-value">{benefit.category?.name || 'Нет'}</p>
                    </div>
                    <div className="benefit-row">
                      <p className="choosen-benefit-label">Статус</p>
                      <p className="choosen-benefit-value">{benefit?.status === 'Approved' ? 'Активна' : 'Ожидает'}</p>
                    </div>
                    {benefit?.status === 'Approved' ? (
                      <div className="delete-user-benefit">
                        <button
                          className="delete-user-benefit-btn"
                          onClick={() => handleDeleteUserBenefit(selectedUser, benefit.uuid)}
                        >
                          Отключить
                        </button>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
