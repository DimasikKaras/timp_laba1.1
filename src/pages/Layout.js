import React from 'react';
import { NavLink } from 'react-router-dom';

const Layout = ({ currentUser, onLogout, children }) => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-title">
            <i className="fa-solid fa-truck-medical"></i>
            <h2>ПБ Центр</h2>
          </div>
          <button onClick={onLogout} className="btn btn-outline mobile-logout">
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => 'nav-btn' + (isActive ? ' active' : '')}>
            <i className="fa-solid fa-building"></i> <span>Объекты</span>
          </NavLink>
          <NavLink to="/personnel" className={({ isActive }) => 'nav-btn' + (isActive ? ' active' : '')}>
            <i className="fa-solid fa-users"></i> <span>Персонал</span>
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => 'nav-btn' + (isActive ? ' active' : '')}>
            <i className="fa-solid fa-triangle-exclamation"></i> <span>События</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <i className="fa-solid fa-user-tie"></i>
            <span>{currentUser.name}</span>
          </div>
          <button onClick={onLogout} className="btn btn-outline w-100">Выйти</button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
