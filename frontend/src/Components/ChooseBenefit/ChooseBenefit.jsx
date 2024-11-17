import React, { useEffect, useState, useMemo } from 'react';
import BenefitCard from './BenefitCard';
import './ChooseBenefit.css';
import uCoinLogo from '../../imgs/uCoinLogo.png';
import { useHR } from '../HRContext';

const ChooseBenefit = () => {
  const [benefits, setBenefits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedBenefit, setExpandedBenefit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [benefitImages, setBenefitImages] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uCoin, setUCoin] = useState(0);
  const [submittedBenefits, setSubmittedBenefits] = useState([]);
  const [filterByUCoin, setFilterByUCoin] = useState(false);
  const [filterSelected, setFilterSelected] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [bgrIcon, setBgrIcon] = useState({});
  const { isHRMode } = useHR();

  useEffect(() => {
    const fetchBenefitsAndCategories = async () => {
      const access_token = localStorage.getItem('accessToken');
      try {
        const benefitsResponse = await fetch('http://26.15.99.17:8000/b/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        });
        const benefitsData = await benefitsResponse.json();
        setBenefits(benefitsData);
      } catch (error) {
        console.error('Ошибка при загрузке льгот', error);
      }
      try {
        const categoriesResponse = await fetch('http://26.15.99.17:8000/b/category/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        });
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error(error);
      }
      try {
        const coinsResponse = await fetch('http://26.15.99.17:8000/v1/ucoin/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        });
        const uCoinsData = await coinsResponse.json();
        setUCoin(uCoinsData.ucoin);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBenefitsAndCategories();
  }, []);

  useEffect(() => {
    if (benefits.length > 0) {
      benefits.forEach((benefit) => {
        if (benefit.main_photo && !benefitImages[benefit.main_photo]) {
          fetchBenefitImages(benefit.main_photo);
        }
        fetchBgrIcon(benefit.category.photo);
      });
    }
  }, [benefits]);

  const fetchBgrIcon = async (imageId) => {
    const access_token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/image/${imageId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setBgrIcon((prevImages) => ({ ...prevImages, [imageId]: imageUrl }));
    } catch (error) {
      console.log('Ошибка при загрузке изображения', error);
    }
  };

  const fetchBenefitImages = async (imageId) => {
    if (benefitImages[imageId]) return;
    const access_token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/image/${imageId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setBenefitImages((prevImages) => ({ ...prevImages, [imageId]: imageUrl }));
    } catch (error) {
      console.log('Ошибка при загрузке изображения', error);
    }
  };

  const chooseBenefit = async (benefitId) => {
    const access_token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/${benefitId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify('requestData'),
      });
      if (response.ok) {
        setSubmittedBenefits((prev) => [...prev, benefitId]);
      }
      const newCoins = (await response.json()).user.ucoin;
      setUCoin(newCoins);
      console.log(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const toggleExpand = (benefit) => {
    setExpandedBenefit(benefit.uuid === expandedBenefit ? null : benefit);
    setIsModalOpen(benefit !== expandedBenefit);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setExpandedBenefit(null);
  };

  const filteredBenefits = useMemo(() => {
    return benefits.filter((benefit) => {
      const matchesCategory = selectedCategory === null || benefit.category_id === selectedCategory;
      const matchesUCoin = !filterByUCoin || benefit.ucoin > 0;
      const matchesSelected = !filterSelected || submittedBenefits.includes(benefit.uuid) || benefit.status === 'Approved';
      const matchesAvailable = !filterAvailable || benefit.available;

      return matchesCategory && matchesUCoin && matchesSelected && matchesAvailable;
    });
  }, [benefits, selectedCategory, filterByUCoin, filterSelected, filterAvailable, submittedBenefits]);

  const noBenefitMessage = filteredBenefits.length === 0 ? (selectedCategory !== null ? 'Нет льгот, соответствующих выбранной категории' : 'Нет льгот, соответствующих данным фильтрам') : '';

  const handleFileChange = (event) => {
    event.stopPropagation();
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async (event, benefitId) => {
    event.stopPropagation();
    if (!selectedFile) {
      // alert('Пожалуйста выберите файл');
      return;
    }

    const access_token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      const response = await fetch(`http://26.15.99.17:8000/b/${benefitId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();

        if (result.main_photo) {
          const photoResponse = await fetch(`http://26.15.99.17:8000/b/image/${result.main_photo}/`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });

          const blob = await photoResponse.blob();
          const imageUrl = URL.createObjectURL(blob);
          setBenefitImages((prevImages) => ({ ...prevImages, [result.main_photo]: imageUrl }));
          setBenefits((prevBenefits) => prevBenefits.map((benefit) => (benefit.uuid === benefit.main_photo ? { ...benefit, url: imageUrl } : benefit)));
        }
      } else {
        // alert('Ошибка при загрузке файла');
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла', error);
    }
  };

  return (
    <div className="container">
      <div className="ucoin-info">
        <span className="ucoin-text">UCoin:</span>
        <img
          src={uCoinLogo}
          alt="uCoin"
        />
        <span className="ucoin-amount">{uCoin}</span>
      </div>

      <div className="filters">
        <h3>Фильтры</h3>
        <div className="filter-wrapper">
          <input
            type="checkbox"
            id="filter1"
            className="filter-checkbox"
            checked={filterByUCoin}
            onChange={() => setFilterByUCoin((prev) => !prev)}
          />
          <label
            className="label-for-input"
            for="filter1"
          >
            <span className="filter-icon"></span>
            <span className="filter-text">За UCoin</span>
          </label>
        </div>

        <div className="filter-wrapper">
          <input
            type="checkbox"
            id="filter2"
            className="filter-checkbox"
            checked={filterSelected}
            onChange={() => setFilterSelected((prev) => !prev)}
          />
          <label
            className="label-for-input"
            for="filter2"
          >
            <span className="filter-icon"></span>
            <span className="filter-text">Выбранные льготы</span>
          </label>
        </div>

        <div className="filter-wrapper">
          <input
            type="checkbox"
            id="filter3"
            className="filter-checkbox"
            checked={filterAvailable}
            onChange={() => setFilterAvailable((prev) => !prev)}
          />
          <label
            className="label-for-input"
            for="filter3"
          >
            <span className="filter-icon"></span>
            <span className="filter-text">Доступные льготы</span>
          </label>
        </div>
      </div>

      <div className="main-content">
        <div className="category">
          <h3>Категории</h3>
          <ul className="benefit-list">
            <li>
              <button onClick={() => setSelectedCategory(null)}>Все</button>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <button onClick={() => setSelectedCategory(category.id)}>{category.name}</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-container">
          {filteredBenefits.length > 0 ? (
            filteredBenefits
              .sort((a, b) => b.available - a.available)
              .map((benefit) => (
                <BenefitCard
                  key={benefit.uuid}
                  benefit={benefit}
                  expandedBenefitId={isModalOpen ? null : expandedBenefit?.uuid}
                  toggleExpand={toggleExpand}
                  benefitImages={benefitImages}
                  handleFileChange={handleFileChange}
                  handleFileUpload={handleFileUpload}
                  chooseBenefit={chooseBenefit}
                  isUnavailable={submittedBenefits.includes(benefit.uuid) || benefit.ucoin > uCoin}
                  available={benefit.available}
                  bgrIcon={bgrIcon}
                />
              ))
          ) : (
            <p>{noBenefitMessage}</p>
          )}
        </div>
      </div>

      {isModalOpen && expandedBenefit && (
        <div
          className="overlay"
          onClick={closeModal}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={closeModal}
            >
              ✕
            </button>
            <h2 className="modal-title">{expandedBenefit.name}</h2>
            <p className="modal-descr">{expandedBenefit.description}</p>
            <p className="modal-experience">
              Требуемый стаж: <b>{expandedBenefit.experience_month === 12 ? `${expandedBenefit.experience_month / 12} год` : expandedBenefit.experience_month === 0 ? 'нет' : Math.floor(expandedBenefit.experience_month / 12) + ' года'}</b>
            </p>
            {benefitImages[expandedBenefit.main_photo] && (
              <img
                className="modal-image"
                src={benefitImages[expandedBenefit.main_photo]}
                alt={expandedBenefit.name}
              />
            )}

            {expandedBenefit.ucoin > 0 && (
              <p className="ucoin-price-expanded">
                Цена: <b>{expandedBenefit.ucoin} UCoin</b>
              </p>
            )}

            {expandedBenefit.adap_period && <p className="adap-period">Адаптационный период должен быть пройден</p>}

            <button
              className={`apply-button ${!expandedBenefit.available || expandedBenefit.ucoin > uCoin ? 'button-inactive' : submittedBenefits.includes(expandedBenefit.uuid) ? 'button-applied' : ''}`}
              onClick={() => chooseBenefit(expandedBenefit.uuid)}
              disabled={!expandedBenefit.available || submittedBenefits.includes(expandedBenefit.uuid) || expandedBenefit.ucoin > uCoin}
            >
              {submittedBenefits.includes(expandedBenefit.uuid) ? 'Заявка отправлена' : 'Отправить заявку'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseBenefit;
