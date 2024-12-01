import React, { useState, useEffect } from 'react';
import './MyBenefits.css';

const MyBenefits = () => {
  const [userBenefits, setUserBenefits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBenefit, setSelectedBenefit] = useState('');

  useEffect(() => {
    const access_token = localStorage.getItem('accessToken');

    fetch('http://26.15.99.17:8000/profile/benefits/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserBenefits(data || []);
      })
      .catch((error) => console.error(error));
  }, []);

  const calculateDaysLeft = (end_date) => {
    if (!end_date) {
      return 'Бессрочно';
    }
    const expirationDate = new Date(end_date);
    const today = new Date();
    const daysLeft = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) {
      return 'Сегодня';
    }
    return `${daysLeft} дней`;
  };

  // Фильтрация льгот
  const filteredBenefits = userBenefits.filter((benefit) => {
    const matchesCategory =
      selectedCategory === '' || benefit.category?.name === selectedCategory || (benefit.category === null && selectedCategory === 'Нет категории');
    const matchesBenefit =
      selectedBenefit === '' || benefit.name === selectedBenefit;
    return matchesCategory && matchesBenefit;
  });

  // Список уникальных категорий
  const categories = [...new Set(userBenefits.map((benefit) => benefit.category?.name))];

  // Список уникальных льгот в выбранной категории
  const benefitsInCategory = selectedCategory
    ? userBenefits
        .filter((benefit) => benefit.category?.name === selectedCategory || (benefit.category === null && selectedCategory === 'Нет категории'))
        .map((benefit) => benefit.name)
    : [];

  return (
    <div className="choosen-container">
      {/* Панель фильтрации */}
      <div className="filter-container">
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedBenefit(''); // Сбросить выбранную льготу при смене категории
          }}
          className="filter-select"
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category ? category : 'Нет категории'}
            </option>
          ))}
        </select>
        <select
          value={selectedBenefit}
          onChange={(e) => setSelectedBenefit(e.target.value)}
          className="filter-select"
          disabled={!selectedCategory} // Заблокировать, если категория не выбрана
        >
          <option value="">Все льготы</option>
          {benefitsInCategory.map((benefit) => (
            <option key={benefit} value={benefit}>
              {benefit}
            </option>
          ))}
        </select>
      </div>

      {/* Отображение льгот */}
      <div className="choosen-benefit-container">
        {filteredBenefits.length === 0 ? (
          <p className="no-benefits-message">Льготы не найдены</p>
        ) : (
          filteredBenefits.map((benefit) => (
            <div key={benefit.id} className="choosen-benefit-card">
              <div className="benefit-row">
                <p className="choosen-benefit-label">Название льготы</p>
                <p className="choosen-benefit-value">{benefit.name}</p>
              </div>
              <div className="benefit-row">
                <p className="choosen-benefit-label">Категория</p>
                <p className="choosen-benefit-value">{benefit.category?.name || 'Нет'}</p>
              </div>

              {benefit.status === 'Approved' ? (
                <>
                  <div className="benefit-row">
                    <p className="choosen-benefit-label">Дата получения</p>
                    <p className="choosen-benefit-value">
                      {new Date(benefit.update_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="benefit-row">
                    <p className="choosen-benefit-label">Истекает через</p>
                    <p className="choosen-benefit-value">
                      {calculateDaysLeft(benefit.end_date)}
                    </p>
                  </div>
                </>
              ) : benefit.status === 'Pending' ? (
                <>
                  <div className="benefit-row">
                    <p className="choosen-benefit-label">Заявка отправлена</p>
                    <p className="choosen-benefit-value">
                      {new Date(benefit.create_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="benefit-row">
                    <p className="choosen-benefit-label">Статус</p>
                    <p className="choosen-benefit-value">
                    На рассмотрении
                    </p>
                  </div>
                </>
              ) : benefit.status === 'Denied' ? ( 
                <>
                <div className="benefit-row">
                    <p className="choosen-benefit-label">Заявка отклонена</p>
                    <p className="choosen-benefit-value">
                      {new Date(benefit.create_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="benefit-row">
                    <p className="choosen-benefit-label">Статус</p>
                    <p className="choosen-benefit-value">
                    Отклонено
                    </p>
                  </div>
                </>
              ) : (
              <>
              <div className="benefit-row">
                    <p className="choosen-benefit-label">Льгота истекла</p>
                    <p className="choosen-benefit-value">
                      {new Date(benefit.create_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="benefit-row">
                    <p className="choosen-benefit-label">Статус</p>
                    <p className="choosen-benefit-value">
                    Срок истек
                    </p>
                  </div>
              </>
            )}
              <div className="choosen-benefit-dots">...</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyBenefits;