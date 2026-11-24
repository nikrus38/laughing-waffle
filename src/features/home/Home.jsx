import React from 'react';
import './Home.css';
const Home = () => {
    return (<div className="home">
      <header className="home-header">
        <h1>ФинТвин - Университет 4.0</h1>
        <p>Интерактивный MVP цифрового университета будущего</p>
      </header>
      
      <main className="home-main">
        <div className="welcome-section">
          <h2>Добро пожаловать в ФинТвин!</h2>
          <p>Это интерактивная платформа, демонстрирующая концепцию Университета 4.0</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <h3>Диагностика</h3>
            <p>Анализ барьеров кооперации и потоков данных</p>
          </div>
          
          <div className="feature-card">
            <h3>Траектория</h3>
            <p>Выбор направления развития университета</p>
          </div>
          
          <div className="feature-card">
            <h3>Цифровой двойник</h3>
            <p>Профиль студента с компетенциями</p>
          </div>
          
          <div className="feature-card">
            <h3>ИИ-сват</h3>
            <p>Система подбора задач от партнеров</p>
          </div>
          
          <div className="feature-card">
            <h3>FinCoin</h3>
            <p>Экономическая система с реестром транзакций</p>
          </div>
          
          <div className="feature-card">
            <h3>Этика ИИ</h3>
            <p>Встроенные корпоративные ценности в алгоритмы</p>
          </div>
        </div>
      </main>
    </div>);
};
export default Home;
