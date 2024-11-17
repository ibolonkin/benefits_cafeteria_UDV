import { useEffect, useState } from 'react';
import './BenefitHR.css';
import benefitCreate from '../../imgs/benefitCreate.png';
import undo from '../../imgs/undo.png';

const BenefitsHR = () => {
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ benefits: [], len: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);

  const access_token = localStorage.getItem('accessToken');
  const usersPerPage = 5;

  const fetchCategories = async () => {
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/category/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      const categoriesData = await response.json();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Ошибка при подгрузке категорий:', error);
    }
  };

  const [tempInputs, setTempInputs] = useState({
    name: '',
    description: '',
    experience_years: '',
    experience_months: '',
    ucoin: '',
    adap_period: false,
    duration_in_days: '',
    category_id: null,
  });

  const fetchBenefits = async (currentPage) => {
    const start = (currentPage - 1) * usersPerPage;
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/benefit/?start=${start}&offset=${usersPerPage}`, {
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

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewPhoto(e.target.files[0]);
      setPhotoURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleInputChange = (field, value) => {
    setTempInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openModal = async (benefit) => {
    setIsCreating(false);
    const response = await fetch(`http://26.15.99.17:8000/b/benefits/${benefit.uuid}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();
    setSelectedBenefit(data);

    const photoResponse = await fetch(`http://26.15.99.17:8000/b/image/${data.main_photo}/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const imageBlob = await photoResponse.blob();
    setPhotoURL(photoResponse.ok ? URL.createObjectURL(imageBlob) : null);

    setTempInputs({
      name: data.name || '',
      description: data.description || '',
      experience_years: ~~(data.experience_month / 12) || 0,
      experience_months: data.experience_month % 12 || 0,
      ucoin: data.ucoin || 0,
      adap_period: data.adap_period || false,
      duration_in_days: data.duration_in_days || 0,
      category_id: data.category ? data.category.id : null,
    });
    await fetchCategories();

    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  useEffect(() => {
    fetchBenefits(currentPage);
  }, [currentPage]);

  const openCreateModal = async () => {
    setIsCreating(true);
    setSelectedBenefit(null);
    setTempInputs({
      name: '',
      description: '',
      experience_years: 0,
      experience_months: 0,
      ucoin: 0,
      adap_period: false,
      duration_in_days: '',
      category_id: null,
    });
    setPhotoURL(null);
    setNewPhoto(null);
    await fetchCategories();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreating(false);
    setSelectedBenefit(null);
  };

  const toggleDropdown = (benefitId) => {
    setOpenDropdownId((prevId) => (prevId === benefitId ? null : benefitId));
  };
  const getYearWord = (number) => {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `г`;
    } else if (lastDigit === 1) {
      return `г`;
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      return `г`;
    } else {
      return `г`;
    }
  }

  const fetchDeleteBenefit = async (benefitId) => {
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/benefit/${benefitId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (response.ok) {
        setData((prevData) => ({
          ...prevData,
          benefits: prevData.benefits.filter((benefit) => benefit.uuid !== benefitId),
        }));
        setOpenDropdownId(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveEditedBenefit = async () => {
    const experience_month = parseInt(tempInputs.experience_years) * 12 + parseInt(tempInputs.experience_months);
    const updatedBenefit = {
      name: tempInputs.name,
      description: tempInputs.description,
      ucoin: tempInputs.ucoin,
      category_id: tempInputs.category_id || 0,
      experience_month: experience_month,
      adap_period: tempInputs.adap_period,
      duration_in_days: tempInputs.duration_in_days,
    };

    try {
      const response = await fetch(`http://26.15.99.17:8000/b/${selectedBenefit.uuid}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(updatedBenefit),
      });

      if (response.ok) {
        // alert('Изменения успешно сохранены');
        setIsModalOpen(false);
        fetchBenefits(currentPage);

        if (newPhoto) {
          await uploadPhoto(selectedBenefit.uuid);
        }
      } else {
        // alert('Не удалось сохранить изменения');
      }
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
    }
    setShowConfirmModal(false);
  };

  const saveNewBenefit = async () => {
    const experience_month = parseInt(tempInputs.experience_years) * 12 + parseInt(tempInputs.experience_months);
    const newBenefit = {
      name: tempInputs.name,
      description: tempInputs.description,
      category_id: tempInputs.category_id,
      experience_month: experience_month,
      ucoin: tempInputs.ucoin,
      adap_period: tempInputs.adap_period,
      duration_in_days: tempInputs.duration_in_days,
    };

    try {
      const response = await fetch(`http://26.15.99.17:8000/b/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(newBenefit),
      });

      if (response.ok) {
        const createdBenefit = await response.json();
        // alert('Льгота успешно добавлена');
        setIsModalOpen(false);
        fetchBenefits(currentPage);

        if (newPhoto) {
          await uploadPhoto(createdBenefit.uuid);
        }
      } else {
        // alert('Не удалось добавить льготу');
      }
    } catch (error) {
      console.error('Ошибка при добавлении льготы:', error);
    }

    setShowConfirmModal(false);

  };

  const uploadPhoto = async (benefitId) => {
    const formData = new FormData();
    formData.append('photo', newPhoto);

    try {
      const response = await fetch(`http://26.15.99.17:8000/b/${benefitId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: formData,
      });

      if (response.ok) {
        // alert('Фото успешно загружено');
        setNewPhoto(null);
      } else {
        // alert('Не удалось загрузить фото');
      }
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
    }
  };
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const openConfirmModal = () => setShowConfirmModal(true);
  const closeApplyModal = () => {
    setShowConfirmModal(false);
  };
  const getMonthWord = (number) => {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `м`;
    } else if (lastDigit === 1) {
      return `м`;
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      return `м`;
    } else {
      return `м`;
    }
  }


  return (
    <div className="benefit-hr-container">
      <div className="all-benefit-hr-container">
        {data.benefits.map((benefit) => (
          <div key={benefit.id} className="benefit-hr-card">
            <div className="benefit-row">
              <p className="benefit-hr-label">Название льготы:</p>
              <p className="benefit-hr-value">{benefit.name}</p>
            </div>
            <div className="benefit-row">
              <p className="benefit-hr-label">Категория:</p>
              <p className="benefit-hr-value">{benefit.category ? benefit.category.name : 'Нет категории'}</p>
            </div>
            <div className="benefit-row">
              <p className="benefit-hr-label">Требуемый стаж:</p>
              <p className="benefit-hr-value">{~~(benefit.experience_month / 12)} {getYearWord(~~(benefit.experience_month / 12))} {benefit.experience_month % 12} {getMonthWord(benefit.experience_month % 12)}</p>
            </div>
            <div className="benefit-row">
              <p className="benefit-hr-label">Статус заявки:</p>
              <p className="benefit-hr-value">Активна</p>
            </div>
            <div>
              <div className="benefit-hr-dots" onClick={() => toggleDropdown(benefit.uuid)}>...</div>
              {openDropdownId === benefit.uuid && (
                <div className="dropdown-menu-new active">
                  <button className="dropdown-item" onClick={() => openModal(benefit)}>Редактировать</button>
                  <button className="dropdown-item" onClick={() => fetchDeleteBenefit(benefit.uuid)}>Удалить</button>
                </div>
              )}
            </div>
          </div>
        ))}
        <button className="benefit-hr-add" onClick={openCreateModal}>
          Добавить льготу
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay-benefit">
          <div className="modal-content-hr-benefit" onClick={(e) => e.stopPropagation()}>
            <div className='close-modal-div'>
            <img className="close-modal-hr-benefit" onClick={closeModal} src={undo} width={'34px'} height={'34px'}/>
            <p className="close-modal-benefit-info-item-hr"> Редактирование льготы </p>
            </div>
            <div className="benefit-container-hr">
              <div className="benefit-info-container">
                <p className="benefit-info-item-hr">
                  <label>Название льготы:</label>
                  <input
                    className="input-benefit input-benefit-name"
                    type="text"
                    value={tempInputs.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </p>
                <p className="benefit-info-item-hr">
                  <label>Требуемый стаж:</label>
                  <input className="input-benefit input-benefit-number"
                    type="number"
                    value={tempInputs.experience_years || 0}
                    onChange={(e) => handleInputChange('experience_years', e.target.value)}
                    placeholder="Годы"
                  />
                  г.

                  <input
                    className="input-benefit input-benefit-number"
                    type="number"
                    value={tempInputs.experience_months || 0}
                    onChange={(e) => handleInputChange('experience_months', e.target.value)}
                    placeholder="Месяцы"
                  />
                  м.

                </p>
                <p className="benefit-info-item-hr">
                  <label>Категория:</label>
                  <select
                    className="input-benefit"

                    value={tempInputs.category_id || ''}
                    onChange={(e) => handleInputChange('category_id', e.target.value || null)}
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((category) => (
                      <option className="input-benefit" key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </p>
                <p className="benefit-info-item-hr benefit-textarea">
                  <label className='benefit-label'>Описание льготы:</label>
                  <textarea className="input-benefit input-benefit-textarea"
                    value={tempInputs.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </p>
                
                
                <p className="benefit-info-item-hr">
                  <label>Цена, Ucoin:</label>
                  <input
                    className="input-benefit input-benefit-number"
                    type="number"
                    value={tempInputs.ucoin}
                    onChange={(e) => handleInputChange('ucoin', parseInt(e.target.value))}
                  />
                </p>
                
                <p className="benefit-info-item-hr">
                  <label>Срок действия льготы:</label>
                  <input
                    className="input-benefit input-benefit-number"
                    type="number"
                    value={tempInputs.duration_in_days||0}
                    onChange={(e) => handleInputChange('duration_in_days', parseInt(e.target.value))}
                  />
                  д.
                </p>
                <p className="benefit-info-item-hr">
                  <label>Необходимо прохождение адаптационного периода:</label>
                  <input
                    className="input-benefit"
                    type="checkbox"
                    checked={tempInputs.adap_period}
                    onChange={(e) => handleInputChange('adap_period', e.target.checked)}
                  />
                </p>
                
              </div>
              <div className="benefit-photo">
                <img src={photoURL || benefitCreate} alt="Предпросмотр льготы" className="benefit-photo-preview" />

                <label className="custom-file-upload">
                  <input type="file" accept="image/*" onChange={handlePhotoChange} />
                  Выберите файл
                  </label>
                <button className="save-button-benefit"  onClick={openConfirmModal}>
                  {isCreating ? 'Добавить' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="dark-bgr-application">
          <div className="apply-application">
            <div className="first-application-row">
              <p>Вы хотите {isCreating ? 'добавить' : 'сохранить'} бенефит?</p>
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
                onClick={isCreating ? saveNewBenefit : saveEditedBenefit}
              >
                Да, я уверен
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenefitsHR;


