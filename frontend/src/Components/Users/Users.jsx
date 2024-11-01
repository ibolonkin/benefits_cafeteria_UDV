import React, { useEffect, useState } from 'react';
import './Users.css';
import UCoin from '../../imgs/uCoinLogo.png';
import userPhoto from '../../imgs/userPhoto.png';

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
    } catch (error) {
      console.error(error);
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

  const openModal = async (user) => {
    const response = await fetch(`http://26.15.99.17:8000/u/${user.uuid}`, {
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
  };

  const closeModal = (user) => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedUser(null);
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
      setSelectedUser((prevUser) => ({
        ...prevUser,
        create_at: value,
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
    }))
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
      console.log(selectedUser);
      if (response.ok) {
        setOriginalData(selectedUser)
        setShowConfirmModal(false);
        setIsEditing(false);
        setUcoinIcon(true);
      } else if(response.status === 422){
        alert('Вы ввели неправильные данные (алерты уберутся до финального прода)')
        setShowConfirmModal(false)
      }else {
        console.error(response.statusText);
      }
    } catch (error) {
      console.error(error);
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
    const yearsWord = `${years} ${years % 100 >= 11 && years % 100 <= 19 ? 'лет' : years % 10 === 1 ? 'год' : years % 10 >= 2 && years % 10 <= 4 ? 'года' : 'лет'}`;
    if (months === 0) {
      return yearsWord;
    }

    return `${yearsWord}, ${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}`;
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="users-container">
          <div className="header-row">
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
              <span>{user.create_at}</span>
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
              <div className="user-container-hr">
                <div className="user-photo-hr">
                  <img
                    src={userPhoto}
                    alt="user-photo"
                    style={{ borderRadius: '360px' }}
                  />
                  <a
                    className="change-info-hr"
                    onClick={handleEditClick}
                  >
                    Редактировать
                  </a>
                </div>
                <div user-info-container>
                  <p className="user-fullname-hr">
                    {selectedUser.profile.lastname} {selectedUser.profile.firstname} {selectedUser.profile.middlename}
                  </p>
                  <p className="user-info-item-hr">
                    <label>Email:</label>
                    {isEditing ? (
                      <input
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
                    <label>Статус пользователя:</label>
                    {isEditing ? (
                      <select
                        value={selectedUser.active ? 'Активен' : 'Удален'}
                        onChange={(e) => handleInputChange('active', e.target.value === 'Активен')}
                      >
                        <option value="Активен">Активен</option>
                        <option value="Удален">Удален</option>
                      </select>
                    ) : (
                      <span>{selectedUser.active ? 'Активен' : 'Удален'}</span>
                    )}
                  </p>
                  {isEditing && <button onClick={openConfirmModal}>Сохранить</button>}
                </div>
              </div>
            )}
          </div>
          {showConfirmModal && (
            <div
              className="confirm-modal-overlay"
              onClick={closeConfirmModal}
            >
              <div
                className="confirm-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <p>Вы хотите сохранить изменения?</p>
                <button
                  className="apply-change-btn"
                  onClick={handleSaveChange}
                >
                  Да
                </button>
                <button
                  className="deni-change-btn"
                  onClick={closeConfirmModal}
                >
                  Нет
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;
