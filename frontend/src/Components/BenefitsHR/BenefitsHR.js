import { useEffect, useState } from 'react';
import './BenefitHR.css'

const BenefitsHR = () => {
  const [data, setData] = useState({ benefits: [], len: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const usersPerPage = 5;
  const access_token = localStorage.getItem('accessToken');

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

  useEffect(() => {
    fetchBenefits(currentPage);
  }, [currentPage]);

  const totalPages = Math.ceil(data.len / usersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchBenefits(page);
    }
  };

  const toggleDropdown = (benefitId) => {
    setOpenDropdownId((prevId) => (prevId === benefitId ? null : benefitId));
  };

  return (
    <div className="benefit-hr-container">
      <div className="all-benefit-hr-container">
        {data.benefits.map((benefit) => (
          <div
            key={benefit.id}
            className="benefit-hr-card"
          >
            <div className="benefit-row">
              <p className="benefit-hr-label">Название льготы</p>
              <p className="benefit-hr-value">{benefit.name}</p>
            </div>
            <div className="benefit-row">
              <p className="benefit-hr-label">Категория</p>
              <p className="benefit-hr-value">{benefit.category.name}</p>
            </div>
            <div className="benefit-row">
              <p className="benefit-hr-label">Требуемый стаж:</p>
              <p className="benefit-hr-value">{benefit.experience_month === 12 ? `${benefit.experience_month / 12} год` : benefit.experience_month === 0 ? 'нет' : Math.floor(benefit.experience_month / 12) + ' года'}</p>
            </div>
            <div className="benefit-row">
              <p className="benefit-hr-label">Статус заявки:</p>
              <p className="benefit-hr-value">Активна</p>
            </div>
            <div>
              <div
                className="benefit-hr-dots"
                onClick={() => toggleDropdown(benefit.uuid)}
              >
                ...
              </div>
              {openDropdownId === benefit.uuid && (
                <div className="dropdown-menu active">
                  <button className="dropdown-item">Редактировать</button>
                  <button
                    className="dropdown-item"
                    onClick={() => fetchDeleteBenefit(benefit.uuid)}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <button className="benefit-hr-add">Добавить льготу</button>
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
              onClick={() => setCurrentPage(i + 1)}
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
  );
};

export default BenefitsHR;
