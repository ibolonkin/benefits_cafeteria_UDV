import React, { useEffect, useState, useMemo } from 'react';
import BenefitCard from './BenefitCard';
import './ChooseBenefit.css';
import uCoinLogo from '../../imgs/uCoinLogo.png';
import noBenefitPhoto from '../../imgs/noPhotoBenefit.png'
import { useHR } from '../HRContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ChooseBenefit = () => {
  const [benefits, setBenefits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedBenefit, setExpandedBenefit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const benefitIdFromUrl = searchParams.get('benefitId');

  useEffect(() => {
    if (benefitIdFromUrl) {
      const selectedBenefit = benefits.find((b) => b.uuid === benefitIdFromUrl);
      if (selectedBenefit) {
        setExpandedBenefit(selectedBenefit);
        toggleExpand(selectedBenefit)
        setIsModalOpen(true);
      }
    }
  }, [benefitIdFromUrl, benefits]);

  const handleCardClick = (benefitId) => {
    navigate(`?benefitId=${benefitId}`);
  };

  useEffect(() => {
    const fetchBenefitsAndCategories = async () => {
      const access_token = localStorage.getItem('accessToken');
      try {
        const benefitsResponse = await fetch('http://26.15.99.17:8000/b/benefits/', {
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
        const categoriesResponse = await fetch('http://26.15.99.17:8000/b/categories/', {
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
        const coinsResponse = await fetch('http://26.15.99.17:8000/profile/ucoin/', {
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
        fetchBgrIcon(benefit.category?.photo);
      });
    }
  }, [benefits]);

  const fetchBgrIcon = async (imageId) => {
    if (!imageId) {
      return;
    }
    const access_token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`http://26.15.99.17:8000/b/images/${imageId}/`, {
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
      const response = await fetch(`http://26.15.99.17:8000/b/images/${imageId}/`, {
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
      const response = await fetch(`http://26.15.99.17:8000/b/benefits/${benefitId}/choose`, {
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

  const toggleExpand = async (benefit) => {
    if (benefit.uuid === expandedBenefit?.uuid) {
      closeModal();
    } else {
      setLoading(true);
      setIsModalOpen(true);
      navigate(`?benefitId=${benefit.uuid}`);
      const access_token = localStorage.getItem('accessToken');
      try {
        const benefitExpandedResponse = await fetch(`http://26.15.99.17:8000/b/benefits/${benefit.uuid}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        });
        const benefitExpandedData = await benefitExpandedResponse.json();
        setExpandedBenefit(benefitExpandedData);
      } catch (error) {
        console.error('Ошибка при загрузке информации льготы', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setExpandedBenefit(null);
    searchParams.delete('benefitId');
    navigate(`?${searchParams.toString()}`);
  };

  const filteredBenefits = useMemo(() => {
    return benefits.filter((benefit) => {
      const matchesCategory = selectedCategory === null || benefit?.category?.id === selectedCategory;
      const matchesUCoin = !filterByUCoin || benefit.ucoin > 0;
      const matchesSelected = !filterSelected || submittedBenefits.includes(benefit.uuid) || benefit.status === 'Approved' || benefit.status === 'Pending';
      const matchesAvailable = !filterAvailable || benefit.available;

      return matchesCategory && matchesUCoin && matchesSelected && matchesAvailable;
    });
  }, [benefits, selectedCategory, filterByUCoin, filterSelected, filterAvailable, submittedBenefits]);

  const noBenefitMessage = filteredBenefits.length === 0 ? (selectedCategory !== null ? 'Нет льгот, соответствующих выбранной категории' : 'Нет льгот, соответствующих данным фильтрам') : '';

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
              <button
                className={`category-item ${selectedCategory === null ? 'underlined' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                Все
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  className={`category-item ${selectedCategory === category.id ? 'underlined' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
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
                  onCardClick={handleCardClick}
                  benefitImages={benefitImages}
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
            {loading ? (
              <p className="loading-text">Загрузка данных...</p>
            ) : (
              <>
                <h2 className="modal-title">{expandedBenefit.name}</h2>
                <p className="modal-descr">{expandedBenefit.description}</p>
                <p className="modal-experience">
                  Требуемый стаж: <b>{expandedBenefit.experience_month === 12 ? `${expandedBenefit.experience_month / 12} год` : expandedBenefit.experience_month === 0 ? 'нет' : Math.floor(expandedBenefit.experience_month / 12) + ' года'}</b>
                </p>
                {benefitImages[expandedBenefit.main_photo] ? (
                  <img
                    className="modal-image"
                    src={benefitImages[expandedBenefit.main_photo]}
                    alt={expandedBenefit.name}
                  />
                ) : (
                  <img
                    className="modal-image"
                    src={noBenefitPhoto}
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
                  className={`apply-button ${
                    submittedBenefits.includes(expandedBenefit?.uuid)
                      ? 'button-applied'
                      : loading || !expandedBenefit?.available || expandedBenefit?.ucoin > uCoin
                      ? 'button-inactive'
                      : ''
                  }`}
                  onClick={() => chooseBenefit(expandedBenefit?.uuid)}
                  disabled={
                    loading ||
                    !expandedBenefit?.available ||
                    expandedBenefit?.ucoin > uCoin ||
                    submittedBenefits.includes(expandedBenefit?.uuid)
                  }
                >
                  {loading ? 'Загрузка...' : submittedBenefits.includes(expandedBenefit?.uuid) ? 'Заявка отправлена' : 'Отправить заявку'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseBenefit;
