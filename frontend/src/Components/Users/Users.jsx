import React, { useEffect, useState } from 'react';
import './Users.css';

const Users = () => {
  const [data, setData] = useState({ users: [], len: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

    const access_token = localStorage.getItem('accessToken');

    const fetchUsers = async (currentPage) => {
      const start = (currentPage - 1) * usersPerPage;
      try {
        const response = await fetch(`http://26.15.99.17:8000/u/?start=${start}&offset=${usersPerPage}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        });
        const result = await response.json();
        setData(result);
        console.log("количество", result.len)
      } catch (error) {
        console.error(error);
      }
    };
    useEffect(() => {
      fetchUsers(currentPage)
  }, []);

  const totalPages = Math.ceil(data.len / usersPerPage);
  console.log("текущая страница", currentPage, "всего страниц", totalPages)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchUsers(page);
    }

  };
  const handleNumberPageChange = (page) => {
    setCurrentPage(page);
    fetchUsers(page);
  }

  return (
    <div className="app-container">
        <div className="main-content">
          <div className="users-container">
            <div className="header-row">
              <span>Имя пользователя</span>
              <span>Стаж</span>
              <span>Должность</span>
              <span>Почта</span>
            </div>
            {data.users.map((user, index) => (
              <div
                key={index}
                className="user-card"
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
                  onClick={() => handleNumberPageChange(i+1)}
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
    </div>
  );
};

export default Users;
