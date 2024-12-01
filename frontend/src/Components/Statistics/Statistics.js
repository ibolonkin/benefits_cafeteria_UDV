import React, { useEffect, useState } from 'react';
import './Statistics.css';

const Statistics = () => {
  const [staticInfo, setStaticInfo] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredStats, setFilteredStats] = useState({});
  const [isDateCheck, setIsDateCheck] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    const access_token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('http://26.15.99.17:8000/statistics/static_info/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStaticInfo(data);
      console.log(staticInfo);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchFilteredStatistics = async () => {
    const access_token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`http://26.15.99.17:8000/statistics/?${startDate ? `start_date=${startDate}&` : ''}${endDate ? `end_date=${endDate}` : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFilteredStats(data);
    } catch (error) {
      console.error('Error fetching filtered statistics:', error);
    }
  };

  const handleApplyClick = () => {
    fetchFilteredStatistics();
    setIsDateCheck(true);
  };

  const handleGetExcel = async () => {
    const access_token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`http://26.15.99.17:8000/statistics/excel/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      if (startDate === '' && endDate === '') {
        link.download = `statistics.xlsx`;
        link.click();
      } else if (startDate !== '' && endDate !== '') {
        link.download = `statistics${startDate}_${endDate}.xlsx`;
        link.click();
      } else if(startDate === '' && endDate !== '') {
        link.download = `statistics_end-date_${endDate}.xlsx`;
        link.click();
      } else if(startDate !== '' && endDate === '') {
        link.download = `statistics_start-date_${startDate}.xlsx`;
        link.click();
      }

      
    } catch (error) {
      console.error('Error fetching excel file:', error);
    }
  };

  return (
    <>
      {Object.keys(staticInfo).length > 0 ? (
        <>
          <h2 className="statistic-header">Статистика</h2>
          <div className="all-statistics">
            <div className="statistic-container">
              <h3>Пользователи:</h3>
              <div className="statistic-info">
                <p>
                  Общее число: <b>{staticInfo.users.total}</b>
                </p>
                <p>
                  Число активных: <b>{staticInfo.users.active}</b>
                </p>
                <p>
                  Число зарегитсрированных, ни разу не выбравших льготу: <b>{staticInfo.users.no_benefits}</b>
                </p>
              </div>
            </div>

            <div className="statistic-container">
              <h3>Льготы:</h3>
              <div className="statistic-info">
                <p>
                  Общее число: <b>{staticInfo.benefit.total}</b>
                </p>
                <p>
                  Число опубликованных: <b>{staticInfo.benefit.is_published}</b>
                </p>
              </div>
            </div>

            <div className="statistic-container">
              <h3>Категории:</h3>
              <div className="statistic-info">
                <p>
                  Общее число: <b>{staticInfo.category.total}</b>
                </p>
                <p>
                  Число опубликованных: <b>{staticInfo.category.is_published}</b>
                </p>
              </div>
            </div>
          </div>
          <div class="benefit-and-category-stat">
            <div class="benefit-section">
              <div class="benefit-header-name benefit-header">Название льготы:</div>
              <div class="benefit-header-count benefit-header">Количество одобренных заявок:</div>

              <div class="benefit-names">
                {staticInfo.benefits.map((benefit) => (
                  <div>{benefit.name}</div>
                ))}
              </div>
              <div class="benefit-counts">
                {staticInfo.benefits.map((benefit) => (
                  <div>{benefit.count}</div>
                ))}
              </div>
            </div>

            <div class="category-section">
              <div class="category-header-name category-header">Название категории:</div>
              <div class="category-header-count category-header">Количество опубликованных льгот:</div>

              <div class="category-names">
                {staticInfo.categories.map((category) => (
                  <div>{category.name}</div>
                ))}
              </div>
              <div class="category-counts">
                {staticInfo.categories.map((category) => (
                  <div>{category.count}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="dates-container">
            <div className="date-filter">
              <p>Начальная дата</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Дата начала"
                className="first-date-input"
              />
              <p>Конечная дата</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Дата конца"
                className="second-date-input"
              />
            </div>
            <div className="btns-statistics">
              <button
                className="confirm-dates-btn"
                onClick={handleApplyClick}
              >
                Применить
              </button>
              <button
                className="get-loaded-excel"
                onClick={handleGetExcel}
              >
                Получить Excel
              </button>
            </div>
          </div>

          {isDateCheck && filteredStats && (
            <div className="filtered-statistics">
              <div className="filtered-statistics-wrapper">
                <h3>Статистика по выбранным датам:</h3>
                <div className="filtered-statistics-general">
                  <p>
                    Заявок на получение льгот: <b>{filteredStats.total_requests}</b>
                  </p>
                  <p>
                    Подтверждено заявок: <b>{filteredStats.approved_requests}</b>
                  </p>
                  <p>
                    Отклонено заявок: <b>{filteredStats.denied_requests}</b>
                  </p>
                  <p>
                    Выделено на льготы: <b>{filteredStats.total_company_expense}р</b>
                  </p>
                  <p>
                    Ucoin потрачено пользователями: <b>{filteredStats.total_user_expense}</b>
                  </p>
                </div>
              </div>

              <div className="benefit-stat-dates">
                <h2>Статистика по льготам за этот период</h2>
                <div className="stats-grid">
                  <div className="stat-header">Название льготы</div>
                  <div className="stat-header">Было отправлено</div>
                  <div className="stat-header">Подтверждено</div>
                  <div className="stat-header">Процент выбора льготы</div>

                  {filteredStats.benefit_stats?.map((benefitStat, index) => (
                    <>
                      <p
                        className="benefit-stat-name-dates"
                        key={index}
                      >
                        {benefitStat.name}
                      </p>
                      <div>{benefitStat.pending}</div>
                      <div>{benefitStat.approved}</div>
                      <div>{benefitStat.per}%</div>
                    </>
                  ))}
                </div>
              </div>
              <div className="current-benefit-stat-dates">
                <h2>Статистика текущих опубликованных льгот</h2>
                <div className="stats-grid-current">
                  <div className="stat-header-current">Название льготы</div>
                  <div className="stat-header-current">Подтверждено</div>

                  {filteredStats.current_benefits?.map((currentBenefit, index) => (
                    <React.Fragment key={index}>
                      <div className="benefit-stat-name-dates-curr">{currentBenefit.name}</div>
                      <div>{currentBenefit.approved}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Статистики нет</p>
      )}
    </>
  );
};

export default Statistics;
