import { useEffect, useState } from 'react';
import './Applications.css';

const Applications = () => {
  const [data, setData] = useState({ applications: [], len: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const access_token = localStorage.getItem('accessToken');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeniModal, setShowDeniModal] = useState(false);
  const usersPerPage = 5;

  const handleApplication = async (status) => {
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/application/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ status: status }),
      });
      if (response.ok) {
        setSelectedApplication(null);
        setIsModalOpen(false);
        setShowConfirmModal(false);
        setShowDeniModal(false);

        setData((prevData) => ({
          ...prevData,
          applications: prevData.applications.filter((app) => app.id !== selectedApplication.id),
        }));
      } else {
        console.error(response.statusText);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchApplication = async (currentPage, field = sortField, order = sortOrder) => {
    const start = (currentPage - 1) * usersPerPage;
    const sortQuery = field ? `&order_by=${field}&sort_order=${order}` : '';
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/application/?start=${start}&offset=${usersPerPage}${sortQuery}`, {
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
    fetchApplication(currentPage);
  }, []);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
    setCurrentPage(1);
    fetchApplication(1, field, order);
  };

  const totalPages = Math.ceil(data.len / usersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchApplication(page);
    }
  };
  const handleNumberPageChange = (page) => {
    setCurrentPage(page);
    fetchApplication(page);
  };

  const openModal = async (application) => {
    const response = await fetch(`http://26.15.99.17:8000/b/application/${application.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();
    setSelectedApplication(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
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


  const openConfirmModal = () => setShowConfirmModal(true);
  const openDeniModal = () => setShowDeniModal(true);

  const closeDeniModal = () => {
    setShowDeniModal(false);
  };

  const closeApplyModal = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className='application-container'>
      <div className="main-content-app">
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
                Название льготы
              </span>
            </span>
            <span>
              <span
                className={`clickable-text ${sortField === 'job_title' ? sortOrder : ''}`}
                onClick={() => handleSort('job_title')}
              >
                Тип льготы
              </span>
            </span>
            <span>
              <span
                className={`clickable-text ${sortField === 'email' ? sortOrder : ''}`}
                onClick={() => handleSort('email')}
              >
                Дата заявки
              </span>
            </span>
          </div>
          {data.applications.map((application) => (
            <div
              key={application.id}
              className="user-card"
              onClick={() => openModal(application)}
            >
              <span>
                {application.user.profile.firstname} {application.user.profile.lastname}
              </span>
              <span>{application.benefit.name}</span>
              <span>{application.benefit.category.name}</span>
              <span>{application.create_at}</span>
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
        <div className="modal-overlay-application">
          <div
            className="modal-application-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal-application-hr"
              onClick={closeModal}
            >
              ✕
            </button>
            {selectedApplication && (
              <div className="application-container-hr">
                <div className="user-info-container-application">
                  <div className="apllication-from-name">{`Заявка от пользователя ${selectedApplication.user.profile.firstname} ${selectedApplication.user.profile.lastname}`}</div>
                  <p className="application-user-info-item">
                    <label>Имя пользователя: </label>
                    <span>
                      {selectedApplication.user.profile.firstname} {selectedApplication.user.profile.lastname}
                    </span>
                  </p>

                  <p className="application-user-info-item">
                    <label>Должность:</label> <span>{selectedApplication.user.profile.job_title}</span>
                  </p>

                  <p className="application-user-info-item">
                    <label>Email:</label> <span>{selectedApplication.user.email}</span>
                  </p>

                  <p className="application-user-info-item">
                    <label>Стаж:</label> <span>{calculateExperience(selectedApplication.create_at ? selectedApplication.create_at : 'Нет')}</span>
                  </p>

                  <p className="application-user-info-item">
                    <label>Адаптационный период:</label> <span>{selectedApplication.user.adap_period ? 'Пройден' : 'Не пройден'}</span>
                  </p>

                  <p className="application-user-info-item">
                    <label>Юр.лицо:</label> <span>{selectedApplication.user.profile.legal_entity || 'Нет'}</span>
                  </p>
                </div>
                <div className="split-line"></div>
                <div className="benefit-info-container-application">
                  <p className="application-benefit-info-item">
                    <label>Название льготы:</label> <span>{selectedApplication.benefit.name}</span>
                  </p>

                  <p className="application-benefit-info-item">
                    <label>Категория льготы:</label> <span>{selectedApplication.benefit.category.name}</span>
                  </p>

                  <p className="application-benefit-info-item">
                    <label>Требуемый стаж:</label> <span>{selectedApplication.benefit.experience_month === 12 ? `${selectedApplication.benefit.experience_month / 12} г` : selectedApplication.benefit.experience_month === 0 ? 'нет' : Math.floor(selectedApplication.benefit.experience_month / 12) + ' г'}</span>
                  </p>

                  <p className="application-benefit-info-item">
                    <label>Адаптационный период должен быть пройден:</label> <span>{selectedApplication.benefit.adap_period ? 'Да' : 'Нет'}</span>
                  </p>

                  <p className="application-benefit-info-item">
                    <label>Требуемое количество UCoin:</label> <span>{selectedApplication.benefit.ucoin}</span>
                  </p>
                </div>
                <div className="apply-deni-buttons">
                  <button
                    className="application-deni-button"
                    onClick={openDeniModal}
                  >
                    Отклонить заявку
                  </button>
                  <button
                    className="application-apply-button"
                    onClick={openConfirmModal}
                  >
                    Одобрить заявку
                  </button>
                </div>
              </div>
            )}
          </div>
          {showDeniModal && (
            <div className="dark-bgr-application">
              <div className="deni-application">
                <div className="first-application-row">
                  <p>Отклонить заявку</p>
                </div>
                <div className="second-application-row">
                  <button
                    className="application-deni-button-inside"
                    onClick={closeDeniModal}
                  >
                    Отмена
                  </button>
                  <button
                    className="application-apply-button-inside"
                    onClick={() => handleApplication('Denied')}
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          )}

          {showConfirmModal && (
            <div className="dark-bgr-application">
              <div className="apply-application">
                <div className="first-application-row">
                  <p>Вы хотите одобрить заявку?</p>
                </div>
                <div className="second-application-row">
                  <button
                    className="application-deni-button"
                    onClick={closeApplyModal}
                  >
                    Отмена
                  </button>
                  <button
                    className="application-apply-button"
                    onClick={() => handleApplication('Approved')}
                  >
                    Да, я уверен
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Applications;
