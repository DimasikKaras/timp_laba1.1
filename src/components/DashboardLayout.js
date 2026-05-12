import { Outlet, useLocation, useNavigate } from 'react-router-dom';

function DashboardLayout({ currentUser, onLogout, isLoading, error }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isObjectsActive = location.pathname === '/' || location.pathname.startsWith('/detail/');

  return (
    <div id="app-section" className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-title">
            <i className="fa-solid fa-truck-medical" />
            <h2>ПБ Центр</h2>
          </div>
          <button onClick={onLogout} className="btn btn-outline mobile-logout" type="button">
            <i className="fa-solid fa-right-from-bracket" />
          </button>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${isObjectsActive ? 'active' : ''}`}
            onClick={() => navigate('/')}
            type="button"
          >
            <i className="fa-solid fa-building" /> <span>Объекты</span>
          </button>
          <button
            className={`nav-btn ${location.pathname === '/personnel' ? 'active' : ''}`}
            onClick={() => navigate('/personnel')}
            type="button"
          >
            <i className="fa-solid fa-users" /> <span>Персонал</span>
          </button>
          <button
            className={`nav-btn ${location.pathname === '/events' ? 'active' : ''}`}
            onClick={() => navigate('/events')}
            type="button"
          >
            <i className="fa-solid fa-triangle-exclamation" /> <span>События</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <i className="fa-solid fa-user-tie" />
            <span id="current-user-name">{currentUser.name}</span>
          </div>
          <button onClick={onLogout} className="btn btn-outline w-100" type="button">
            Выйти
          </button>
        </div>
      </aside>

      <main className="main-content">
        {error ? <div className="card status-error">{error}</div> : null}
        {isLoading ? <div className="card">Загрузка данных...</div> : null}
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
