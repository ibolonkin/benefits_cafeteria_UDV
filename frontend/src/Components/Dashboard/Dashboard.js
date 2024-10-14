import React from 'react';
import { Link } from 'react-router-dom';

// import { fetchWithAuth } from '../Auth/FetchWithAuth';

const Dashboard = () => {
  return (
    <div>
        <nav>
          <ul>
            <li>
              <Link to="/dashboard/choose-benefit">Выбор льгот</Link>
            </li>
            <li>
              <Link to="/dashboard/profile">Личная информация</Link>
            </li>
            <li>
              <Link to="/dashboard/statistics">Статистика</Link>
            </li>
            <li>
              <Link to="/dashboard/users">Пользователи</Link>
            </li>
          </ul>
        </nav>
      </div>
  )
}

export default Dashboard;
