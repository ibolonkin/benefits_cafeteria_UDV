import React, { useState, useEffect } from 'react';
import './MyBenefits.css';

const MyBenefits = () => {
  const [userBenefits, setUserBenefits] = useState([]);
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
      .then((data) => setUserBenefits(data.benefits || []))
      .catch((error) => console.error(error));
  }, []);

  const calculateDaysLeft = (updateAt, durationInDays) => {
    const updateDate = new Date(updateAt);
    if (durationInDays <= 0) {
      return 'Бессрочно';
    }
    const expirationDate = new Date(updateDate.getTime() + durationInDays * 24 * 60 * 60 * 1000);
    const today = new Date();
    const daysLeft = Math.floor((expirationDate - today) / (1000 * 60 * 60 * 24));
    if (daysLeft === 0) {
      return 'Сегодня';
    }
    return daysLeft > 0 ? `${daysLeft} дней` : 'Срок истек';
  };

  return (
    <div className="choosen-container">
      <div className="choosen-benefit-container">
        {userBenefits.map((benefit) => (
          <div
            key={benefit.id}
            className="choosen-benefit-card"
          >
            <div className="benefit-row">
              <p className="choosen-benefit-label">Название льготы</p>
              <p className="choosen-benefit-value">{benefit.name}</p>
            </div>
            <div className="benefit-row">
              <p className="choosen-benefit-label">Категория</p>
              <p className="choosen-benefit-value">{benefit.category.name}</p>
            </div>

            {benefit.status === 'Approved' ? (
              <>
                <div className="benefit-row">
                  <p className="choosen-benefit-label">Дата получения</p>
                  <p className="choosen-benefit-value">{new Date(benefit.update_at).toLocaleDateString()}</p>
                </div>
                <div className="benefit-row">
                  <p className="choosen-benefit-label">Истекает через</p>
                  <p className="choosen-benefit-value">{calculateDaysLeft(benefit.update_at, benefit.duration_in_days)}</p>
                </div>
              </>
            ) : (
              <>
                <div className="benefit-row">
                  <p className="choosen-benefit-label">Заявка отправлена</p>
                  <p className="choosen-benefit-value">{new Date(benefit.create_at).toLocaleDateString()}</p>
                </div>
                <div className="benefit-row">
                  <p className="choosen-benefit-label">Статус</p>
                  <p className="choosen-benefit-value">{benefit.status === 'Pending' ? 'На рассмотрении' : 'Отклонено'}</p>
                </div>
              </>
            )}
            <div className="choosen-benefit-dots">...</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBenefits;
