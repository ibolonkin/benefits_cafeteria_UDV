import { useEffect, useState } from 'react';
import './BenefitHR.css';
import benefitCreate from '../../imgs/benefitCreate.png';
import undo from '../../imgs/undo.png';
import redactCategory from '../../imgs/pencil.png';
import deleteCategory from '../../imgs/bin.png';
import noPhotoIcon from '../../imgs/noPhotoMoc.png';

const BenefitsHR = () => {
  const [categories, setCategories] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [data, setData] = useState({ benefits: [], len: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCategoryCreateModal, setIsCategoryCreateModal] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [newCategoryPhoto, setNewCategoryPhoto] = useState(null);
  const [photoURLCategory, setPhotoURLCategory] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [showConfirmDeleteCategoryModal, setShowConfirmDeleteCategoryModal] = useState(false);
  const [benefitToDelete, setBenefitToDelete] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryEditModalOpen, setIsCategoryEditModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [bgrIcon, setBgrIcon] = useState({});
  const benefitsPerPage = 5

  const access_token = localStorage.getItem('accessToken');

  const totalPages = Math.ceil(data.len / benefitsPerPage);

  const toggleCategoryModal = () => {
    setIsCategoryModalOpen(!isCategoryModalOpen);
    fetchBgrIcon();
  };

  const toggleCategoryEditModal = (category) => {
    setIsCategoryEditModalOpen(!isCategoryEditModalOpen);
    setSelectedCategory(category);
    setNewCategoryPhoto(null);
    setPhotoURLCategory(category.photo ? bgrIcon[category.photo] : null);
    setTempCategoryInputs({
      name: category.name || '',
      is_published: category.is_published,
    });
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/a/categories/`, {
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
    is_published: false,
    price: '',
  });

  const [tempCategoryInputs, setTempCategoryInputs] = useState({
    name: '',
    is_published: false,
  });

  const fetchBenefits = async (currentPage) => {
    const start = (currentPage - 1) * benefitsPerPage;
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/a/benefits/?start=${start}&offset=${benefitsPerPage}`, {
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
    const TARGET_WIDTH = 523;
    const TARGET_HEIGHT = 381;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Устанавливаем размер канваса в целевые размеры
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;

        // Рассчитываем центр для обрезки
        const scale = Math.min(img.width / TARGET_WIDTH, img.height / TARGET_HEIGHT);
        const cropWidth = TARGET_WIDTH * scale;
        const cropHeight = TARGET_HEIGHT * scale;
        const cropX = (img.width - cropWidth) / 2;
        const cropY = (img.height - cropHeight) / 2;

        // Обрезаем и рисуем изображение
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        // Получаем новое изображение в виде URL и Blob
        canvas.toBlob(
          (blob) => {
            const resizedURL = URL.createObjectURL(blob);
            setPhotoURL(resizedURL); // Устанавливаем обрезанное изображение для preview
            setNewPhoto(blob); // Сохраняем Blob для отправки на сервер
          },
          file.type || 'image/jpeg',
          0.9
        );
      };

      img.onerror = () => {
        console.error('Невозможно загрузить изображение.');
      };

      img.src = URL.createObjectURL(file);
    }
  };

  const handlePhotoCategoryChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewCategoryPhoto(e.target.files[0]);
      setPhotoURLCategory(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleInputChange = (field, value) => {
    setTempInputs((prev) => ({
      ...prev,
      [field]: value === '' ? '' : value,
    }));
  };

  const handleCategoryInputChange = (field, value) => {
    setTempCategoryInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeletePhoto = async (benefitId) => {
    const deleteResponse = await fetch(`http://26.15.99.17:8000/b/benefits/${benefitId}/delete/photo`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (deleteResponse.ok) {
      console.log('ok');
    }
  };

  const handleDeleteCategoryPhoto = async (categoryId) => {
    const deleteResponse = await fetch(`http://26.15.99.17:8000/b/categories/${categoryId}/delete/photo`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (deleteResponse.ok) {
      console.log('ok');
    }
  };

  const [deletedPhoto, setDeletedPhoto] = useState(false);

  const deletePhoto = () => {
    setPhotoURL(benefitCreate);
    setDeletedPhoto(true);
  };

  const [deletedCategoryPhoto, setDeletedCategoryPhoto] = useState(false);

  const deleteCategoryPhoto = () => {
    setPhotoURLCategory(benefitCreate);
    setDeletedCategoryPhoto(true);
  }

  const openModal = async (benefit) => {
    setIsCreating(false);
    const response = await fetch(`http://26.15.99.17:8000/b/a/benefits/${benefit.uuid}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });
    const data = await response.json();
    setSelectedBenefit(data);
    setPhotoURL(null);
    if (data.main_photo) {
      const photoResponse = await fetch(`http://26.15.99.17:8000/b/images/${data.main_photo}/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const imageBlob = await photoResponse.blob();
      setPhotoURL(URL.createObjectURL(imageBlob));
    }

    setTempInputs({
      name: data.name || '',
      description: data.description || '',
      experience_years: ~~(data.experience_month / 12) || 0,
      experience_months: data.experience_month % 12 || 0,
      ucoin: data.ucoin || 0,
      adap_period: data.adap_period || false,
      duration_in_days: data.duration_in_days || 0,
      category_id: data.category ? data.category.id : null,
      is_published: data.is_published,
      price: data.price || 0,
    });
    await fetchCategories();

    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  useEffect(() => {
    fetchBenefits(currentPage);
    fetchCategories();
    setSelectedCategory(null);
    const isEmpty = tempInputs.price === '' || tempInputs.experience_months === '' || tempInputs.experience_years === '' || tempInputs.experience_years < 0 || tempInputs.experience_months < 0 || tempInputs.name === '' || tempInputs.description === '' || tempInputs.ucoin === '' || tempInputs.ucoin < 0 || tempInputs.price < 0 || tempInputs.duration_in_days < 0;
    setIsFormValid(!isEmpty);
  }, [currentPage, tempInputs]);

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
      is_published: false,
      price: 0,
    });
    setPhotoURL(null);
    setNewPhoto(null);
    await fetchCategories();
    setIsModalOpen(true);
  };

  const openCreateCategoryModal = () => {
    setIsCategoryCreateModal(true);
    setSelectedCategory(null);
    setTempCategoryInputs({
      name: '',
      is_published: false,
    });
    setPhotoURLCategory(null);
    setNewCategoryPhoto(null);
    setIsCategoryEditModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreating(false);
    setSelectedBenefit(null);
    setIsCategoryEditModalOpen(false);
    setIsCategoryCreateModal(false);
    setSelectedCategory(null);
    setDeletedPhoto(false);
    setDeletedCategoryPhoto(false);
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
  };

  const fetchDeleteBenefit = async (benefitId) => {
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/benefits/${benefitId}/delete`, {
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

  const fetchDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/categories/${categoryId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (response.ok) {
        setCategories(categories.filter((category) => category.id !== categoryId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveEditedBenefit = async () => {
    closeApplyModal();
    const experience_month = parseInt(tempInputs.experience_years) * 12 + parseInt(tempInputs.experience_months);
    const updatedBenefit = {
      name: tempInputs.name,
      description: tempInputs.description,
      ucoin: tempInputs.ucoin,
      category_id: tempInputs.category_id || null,
      experience_month: experience_month,
      adap_period: tempInputs.adap_period,
      duration_in_days: tempInputs.duration_in_days || null,
      is_published: tempInputs.is_published,
      price: tempInputs.price,
    };

    try {
      const response = await fetch(`http://26.15.99.17:8000/b/benefits/${selectedBenefit.uuid}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(updatedBenefit),
      });
      console.log(await response.json());

      if (response.ok) {
        if (deletedPhoto) {
          handleDeletePhoto(selectedBenefit.uuid);
        }
        setDeletedCategoryPhoto(false);
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
    closeApplyModal();
    const experience_month = parseInt(tempInputs.experience_years) * 12 + parseInt(tempInputs.experience_months);
    const newBenefit = {
      name: tempInputs.name,
      description: tempInputs.description,
      category_id: tempInputs.category_id,
      experience_month: experience_month,
      ucoin: tempInputs.ucoin || 0,
      adap_period: tempInputs.adap_period || false,
      duration_in_days: tempInputs.duration_in_days || 0,
      is_published: tempInputs.is_published,
      price: tempInputs.price,
    };

    try {
      const response = await fetch(`http://26.15.99.17:8000/b/benefits/`, {
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

  const saveEditedCategory = async () => {
    closeApplyModal();
    const editedCategory = {
      name: tempCategoryInputs.name,
      is_published: tempCategoryInputs.is_published,
    };

    try {
      const response = await fetch(`http://26.15.99.17:8000/b/categories/${selectedCategory.id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(editedCategory),
      });

      if (response.ok) {
        if (deletedCategoryPhoto) {
          handleDeleteCategoryPhoto(selectedCategory.id)
        }
        setDeletedCategoryPhoto(false);
        const editedCategory = await response.json();
        setIsCategoryEditModalOpen(false);
        let tempCategory;
        if (newCategoryPhoto) {
          tempCategory = await uploadCategoryPhoto(editedCategory.id);
        }
        if (tempCategory) {
          const response = await fetch(`http://26.15.99.17:8000/b/images/${tempCategory.photo}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${access_token}`,
            },
          });
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setBgrIcon((prevImages) => ({ ...prevImages, [tempCategory.photo]: imageUrl }));
        }
        await fetchCategories();
      }
    } catch (error) {
      console.error('Ошибка при добавлении категории:', error);
    }
  };

  const saveNewCategory = async () => {
    closeApplyModal();
    const newCategory = {
      name: tempCategoryInputs.name,
      is_published: tempCategoryInputs.is_published,
    };

    try {
      const response = await fetch(`http://26.15.99.17:8000/b/categories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        const createdCategory = await response.json();
        // alert('Льгота успешно добавлена');
        setIsCategoryCreateModal(false);
        let tempCategory;
        if (newCategoryPhoto) {
          tempCategory = await uploadCategoryPhoto(createdCategory.id);
        }
        if (tempCategory) {
          const response = await fetch(`http://26.15.99.17:8000/b/images/${tempCategory.photo}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${access_token}`,
            },
          });
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setBgrIcon((prevImages) => ({ ...prevImages, [tempCategory.photo]: imageUrl }));
        }
        await fetchCategories();
      }
    } catch (error) {
      console.error('Ошибка при добавлении категории:', error);
    }
  };

  const uploadCategoryPhoto = async (categoryId) => {
    const formCategoryData = new FormData();
    formCategoryData.append('photo', newCategoryPhoto);

    try {
      const response = await fetch(`http://26.15.99.17:8000/b/categories/${categoryId}/photo`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: formCategoryData,
      });

      if (response.ok) {
        // alert('Фото успешно загружено');
        setNewCategoryPhoto(null);
        return await response.json();
      } else {
        // alert('Не удалось загрузить фото');
      }
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
    }
  };

  const uploadPhoto = async (benefitId) => {
    const formData = new FormData();
    formData.append('photo', newPhoto);

    try {
      const response = await fetch(`http://26.15.99.17:8000/b/benefits/${benefitId}/photo`, {
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
  const [showConfirmCategoryModal, setShowConfirmCategoryModal] = useState(false);
  const openConfirmModal = () => setShowConfirmModal(true);
  const openConfirmCategoryModal = () => setShowConfirmCategoryModal(true);
  const closeApplyModal = () => {
    fetchCategories();
    setShowConfirmModal(false);
    setShowConfirmCategoryModal(false);
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
  };

  const confirmDeleteBenefit = (benefitId) => {
    setBenefitToDelete(benefitId);
    setShowConfirmDeleteModal(true);
  };

  const handleDeleteBenefit = async () => {
    if (benefitToDelete) {
      await fetchDeleteBenefit(benefitToDelete);
      setShowConfirmDeleteModal(false);
      setBenefitToDelete(null);
    }
  };

  const confirmDeleteCategory = (categoryId) => {
    setCategoryToDelete(categoryId);
    setShowConfirmDeleteCategoryModal(true);
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      await fetchDeleteCategory(categoryToDelete);
      setShowConfirmDeleteCategoryModal(false);
      setCategoryToDelete(null);
    }
  };


  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchBenefits(page);
    }
  };
  const handleNumberPageChange = (page) => {
    setCurrentPage(page);
    fetchBenefits(page);
  };

  const fetchBgrIcon = async () => {
    const access_token = localStorage.getItem('accessToken');
    try {
      categories.map(async (category) => {
        if (category.photo) {
          const response = await fetch(`http://26.15.99.17:8000/b/images/${category.photo}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${access_token}`,
            },
          });
          if (response.ok) {
            setNewCategoryPhoto(null);
          }
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setBgrIcon((prevImages) => ({ ...prevImages, [category.photo]: imageUrl }));
        }
      });
      console.log(bgrIcon);
    } catch (error) {
      console.log('Ошибка при загрузке изображения', error);
    }
  };

  return (
    <div className="benefit-hr-container">
      <div className="all-benefit-hr-container">
        <button
          className="manage-categories-button"
          onClick={toggleCategoryModal}
        >
          Управление категориями
        </button>

        {data.benefits.map((benefit) => (
          <div
            key={benefit.id}
            className="benefit-hr-card"
            onClick={() => openModal(benefit)}
          >
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
              <p className="benefit-hr-value">
                {~~(benefit.experience_month / 12)} {getYearWord(~~(benefit.experience_month / 12))} {benefit.experience_month % 12} {getMonthWord(benefit.experience_month % 12)}
              </p>
            </div>
            <div className="benefit-row">
              <p className="benefit-hr-label">Статус заявки:</p>
              <p className="benefit-hr-value">{benefit.is_published && (benefit.category ? benefit.category.is_published : true) ? 'Активна' : 'Не активна'}</p>
            </div>
            <div>
              <div
                className="benefit-hr-dots"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown(benefit.uuid);
                }}
              >
                ...
              </div>
              {openDropdownId === benefit.uuid && (
                <div className="dropdown-menu-new active">
                  <button
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(benefit);
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteBenefit(benefit.uuid);
                    }}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <button
          className="benefit-hr-add"
          onClick={openCreateModal}
        >
          Добавить льготу
        </button>
        <div className="pagination-benefits">
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

      {isModalOpen && (
        <div className="modal-overlay-benefit">
          <div
            className="modal-content-hr-benefit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="close-modal-div">
              <img
                className="close-modal-hr-benefit"
                alt="close"
                onClick={closeModal}
                src={undo}
                width={'34px'}
                height={'34px'}
              />
              <p className="close-modal-benefit-info-item-hr"> Редактирование льготы </p>
            </div>
            <div className="benefit-container-hr">
              <div className="benefit-info-container">
                <p className="benefit-info-item-hr">
                  <label>Название льготы:</label>
                  <input
                    className={`input-benefit input-benefit-name ${tempInputs.name === '' ? 'empty-value' : ''}`}
                    type="text"
                    value={tempInputs.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </p>
                <p className="benefit-info-item-hr">
                  <label>Требуемый стаж:</label>
                  <input
                    className={`input-benefit input-benefit-number ${tempInputs.experience_years === '' ? 'empty-value' : ''}`}
                    type="number"
                    min="0"
                    value={tempInputs.experience_years !== null && tempInputs.experience_years !== undefined ? tempInputs.experience_years : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('experience_years', value === '' ? '' : parseInt(value, 10));
                    }}
                  />
                  г.
                  <input
                    className={`input-benefit input-benefit-number ${tempInputs.experience_months === '' ? 'empty-value' : ''}`}
                    type="number"
                    min="0"
                    max="12"
                    value={tempInputs.experience_months !== null && tempInputs.experience_months !== undefined ? tempInputs.experience_months : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('experience_months', value === '' ? '' : parseInt(value, 10));
                    }}
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
                      <option
                        className="input-benefit"
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </p>
                <p className="benefit-info-item-hr benefit-textarea">
                  <label className="benefit-label">Описание льготы:</label>
                  <textarea
                    className={`input-benefit input-benefit-textarea ${tempInputs.description === '' ? 'empty-value' : ''}`}
                    value={tempInputs.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </p>

                <p className="benefit-info-item-hr">
                  <div className="price-one">
                    <label>Цена, Ucoin:</label>
                    <input
                      contentEditable="true"
                      className={`input-benefit input-benefit-number ${tempInputs.ucoin === '' ? 'empty-value' : ''}`}
                      type="number"
                      min="0"
                      value={tempInputs.ucoin !== null && tempInputs.ucoin !== undefined ? tempInputs.ucoin : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange('ucoin', value === '' ? '' : parseInt(value, 10));
                      }}
                    />
                  </div>

                  <div className="price-two">
                    <label>Цена льготы, ₽:</label>
                    <input
                      className={`input-benefit input-benefit-number ${tempInputs.price === '' ? 'empty-value' : ''}`}
                      type="number"
                      min="0"
                      value={tempInputs.price !== null && tempInputs.price !== undefined ? tempInputs.price : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange('price', value === '' ? '' : parseInt(value, 10));
                      }}
                    />
                  </div>
                </p>

                <p className="benefit-info-item-hr">
                  <label>Срок действия льготы:</label>
                  <input
                    className="input-benefit input-benefit-number"
                    type="number"
                    min="0"
                    value={tempInputs.duration_in_days !== null && tempInputs.duration_in_days !== undefined ? tempInputs.duration_in_days : null}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('duration_in_days', value === '' ? null : parseInt(value, 10));
                    }}
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
                <button
                  className="delete-benefit-photo"
                  onClick={deletePhoto}
                >
                  ✕
                </button>
                <img
                  src={photoURL || benefitCreate}
                  alt="Предпросмотр льготы"
                  className="benefit-photo-preview"
                />

                <label className="custom-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  Выберите файл
                </label>
                <div className="is-published-checkbox">
                  <label>Опубликовать льготу?</label>
                  <input
                    className="published-benefit"
                    type="checkbox"
                    onClick={(e) => handleInputChange('is_published', e.target.checked)}
                    checked={tempInputs.is_published}
                  />
                </div>
                <button
                  className={`save-button-benefit ${!isFormValid ? 'button-inactive' : ''}`}
                  onClick={openConfirmModal}
                  disabled={!isFormValid}
                >
                  {isCreating ? 'Добавить' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmDeleteModal && (
        <div className="dark-bgr-application">
          <div className="apply-application">
            <div className="first-application-row">
              <p className="delete-message">Вы точно хотите удалить льготу?</p>
            </div>
            <div className="second-application-row">
              <button
                className="application-deni-button"
                onClick={() => setShowConfirmDeleteModal(false)}
              >
                Нет
              </button>
              <button
                className="application-apply-button"
                onClick={handleDeleteBenefit}
              >
                Да, удалить
              </button>
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

      {isCategoryModalOpen && (
        <div className="modal-overlay-category">
          <div className="modal-content-category">
            <button
              className="close-modal-category"
              onClick={toggleCategoryModal}
            >
              &times;
            </button>
            <div className="modal-header">
              <h2>Управление категориями</h2>
            </div>
            <div className="modal-body">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="category-item-edit"
                >
                  <div className="category-icon-wrapper">
                    <img
                      src={category.photo ? bgrIcon[category.photo] : noPhotoIcon}
                      alt={category.name}
                      className="category-icon-edit"
                    />
                  </div>
                  <div className="category-name-edit">
                    <p className="category-name-edit-title">Название</p>
                    <p className="category-name-edit-value">{category.name}</p>
                  </div>
                  <button
                    className="edit-category-button"
                    onClick={() => toggleCategoryEditModal(category)}
                  >
                    <img
                      src={redactCategory}
                      alt="redact-category"
                      style={{ width: 32 }}
                    />
                  </button>
                  <button
                    className="delete-category-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteCategory(category.id);
                    }}
                  >
                    <img
                      src={deleteCategory}
                      alt="delete-category"
                      style={{ width: 32 }}
                    />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="add-category-btn"
              onClick={openCreateCategoryModal}
            >
              Добавить категорию
            </button>
          </div>
        </div>
      )}

      {isCategoryCreateModal && (
        <div className="modal-overlay-category">
          <div className="modal-content-category">
            <img
              className="close-category-modal-edit"
              alt="close"
              onClick={closeModal}
              src={undo}
              width={'34px'}
              height={'34px'}
            />
            <div className="category-modal-edit-title">
              <h2>Создать категорию</h2>
            </div>
            <div className="category-modal-edit-photo">
              <img
                src={photoURLCategory || benefitCreate}
                alt="Предпросмотр категории"
                className="category-modal-edit-photo-preview"
              />

              <label className="custom-file-upload-category">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoCategoryChange}
                />
                Загрузить изображение
              </label>

              <label className="create-category-name">
                <p>Название категории</p>
                <input
                  type="text"
                  value={tempCategoryInputs.name}
                  onChange={(e) => handleCategoryInputChange('name', e.target.value)}
                />
              </label>

              <div className="is-published-checkbox-edit">
                <label>Опубликовать категорию?</label>
                <input
                  className="published-category"
                  type="checkbox"
                  onClick={(e) => handleCategoryInputChange('is_published', e.target.checked)}
                  checked={tempCategoryInputs.is_published}
                />
              </div>

              <button
                className="save-button-category-modal-edit"
                onClick={openConfirmCategoryModal}
              >
                {isCategoryCreateModal ? 'Добавить' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCategoryEditModalOpen && (
        <div className="modal-overlay-category">
          <div className="modal-content-category">
            <button
              className="delete-category-photo"
              onClick={deleteCategoryPhoto}
            >
              ✕
            </button>
            <img
              className="close-category-modal-edit"
              alt="close"
              onClick={closeModal}
              src={undo}
              width={'34px'}
              height={'34px'}
            />
            <div className="category-modal-edit-title">
              <h2>Изменить</h2>
            </div>
            <div className="category-modal-edit-photo">
              <img
                src={photoURLCategory || noPhotoIcon}
                alt="Предпросмотр категории"
                className="category-modal-edit-photo-preview"
              />

              <label className="custom-file-upload-category">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoCategoryChange}
                />
                Загрузить изображение
              </label>

              <label className="create-category-name">
                <p>Название категории</p>
                <input
                  type="text"
                  value={tempCategoryInputs.name}
                  onChange={(e) => handleCategoryInputChange('name', e.target.value)}
                />
              </label>

              <div className="is-published-checkbox-edit">
                <label>Опубликовать категорию?</label>
                <input
                  className="published-category"
                  type="checkbox"
                  onClick={(e) => handleCategoryInputChange('is_published', e.target.checked)}
                  checked={tempCategoryInputs.is_published}
                />
              </div>

              <button
                className="save-button-category-modal-edit"
                onClick={openConfirmCategoryModal}
              >
                {isCategoryCreateModal ? 'Добавить' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmCategoryModal && (
        <div className="dark-bgr-application">
          <div className="apply-application">
            <div className="first-application-row">
              <p>Вы хотите {isCategoryCreateModal ? 'добавить' : 'сохранить'} категорию?</p>
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
                onClick={isCategoryCreateModal ? saveNewCategory : saveEditedCategory}
              >
                Да, я уверен
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDeleteCategoryModal && (
        <div className="dark-bgr-application">
          <div className="apply-application">
            <div className="first-application-row">
              <p className="delete-message">Вы точно хотите удалить категорию?</p>
            </div>
            <div className="second-application-row">
              <button
                className="application-deni-button"
                onClick={() => setShowConfirmDeleteCategoryModal(false)}
              >
                Нет
              </button>
              <button
                className="application-apply-button"
                onClick={handleDeleteCategory}
              >
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenefitsHR;
