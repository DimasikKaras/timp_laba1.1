import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import api from './api';
import AuthPage from './pages/AuthPage';
import ObjectsPage from './pages/ObjectsPage';
import PersonnelPage from './pages/PersonnelPage';
import EventsPage from './pages/EventsPage';

const DashboardLayout = ({
  currentUser,
  onLogout,
  objects,
  setObjects,
  personnel,
  setPersonnel,
  events,
  setEvents,
  loading,
  loadError,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isObjectsRoute = useMemo(() => {
    return location.pathname === '/' || location.pathname.startsWith('/objects');
  }, [location.pathname]);

  return (
    <div id="app-section" className="dashboard">
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
          <button className={`nav-btn ${isObjectsRoute ? 'active' : ''}`} onClick={() => navigate('/objects')}>
            <i className="fa-solid fa-building"></i> <span>Объекты</span>
          </button>
          <button className={`nav-btn ${location.pathname.startsWith('/personnel') ? 'active' : ''}`} onClick={() => navigate('/personnel')}>
            <i className="fa-solid fa-users"></i> <span>Персонал</span>
          </button>
          <button className={`nav-btn ${location.pathname.startsWith('/events') ? 'active' : ''}`} onClick={() => navigate('/events')}>
            <i className="fa-solid fa-triangle-exclamation"></i> <span>События</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <i className="fa-solid fa-user-tie"></i>
            <span id="current-user-name">{currentUser?.name || 'Диспетчер'}</span>
          </div>
          <button onClick={onLogout} className="btn btn-outline w-100">Выйти</button>
        </div>
      </aside>

      <main className="main-content">
        {loading && (
          <div className="card">
            <p className="text-muted">Загрузка данных...</p>
          </div>
        )}
        {loadError && (
          <div className="card">
            <p className="text-muted">{loadError}</p>
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/objects" replace />}
          />
          <Route
            path="/objects"
            element={<ObjectsPage objects={objects} setObjects={setObjects} setEvents={setEvents} />}
          />
          <Route
            path="/objects/create"
            element={<ObjectsPage objects={objects} setObjects={setObjects} setEvents={setEvents} />}
          />
          <Route
            path="/objects/detail/:id"
            element={<ObjectsPage objects={objects} setObjects={setObjects} setEvents={setEvents} />}
          />
          <Route
            path="/objects/rename/:id"
            element={<ObjectsPage objects={objects} setObjects={setObjects} setEvents={setEvents} />}
          />
          <Route
            path="/personnel"
            element={<PersonnelPage personnel={personnel} setPersonnel={setPersonnel} objects={objects} />}
          />
          <Route
            path="/personnel/create"
            element={<PersonnelPage personnel={personnel} setPersonnel={setPersonnel} objects={objects} />}
          />
          <Route
            path="/personnel/rename/:id"
            element={<PersonnelPage personnel={personnel} setPersonnel={setPersonnel} objects={objects} />}
          />
          <Route
            path="/events"
            element={
              <EventsPage
                events={events}
                setEvents={setEvents}
                objects={objects}
                setObjects={setObjects}
                personnel={personnel}
                setPersonnel={setPersonnel}
              />
            }
          />
          <Route path="/Authentication" element={<Navigate to="/objects" replace />} />
          <Route path="/register" element={<Navigate to="/objects" replace />} />
          <Route path="*" element={<Navigate to="/objects" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('pb_currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [objects, setObjects] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('pb_currentUser');
    setCurrentUser(null);
    setObjects([]);
    setPersonnel([]);
    setEvents([]);
  }, []);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setLoadError('');
    try {
      const usersResponse = await api.get('/users', {
        params: { login: currentUser.login },
      });
      const validUser = usersResponse.data.find((user) => user.login === currentUser.login);
      if (!validUser) {
        handleLogout();
        return;
      }
      const [objectsResponse, personnelResponse, eventsResponse] = await Promise.all([
        api.get('/objects'),
        api.get('/personnel'),
        api.get('/events'),
      ]);
      setObjects(objectsResponse.data);
      setPersonnel(personnelResponse.data);
      setEvents(eventsResponse.data);
    } catch (error) {
      console.error('Ошибка загрузки данных', error);
      setLoadError('Ошибка загрузки данных. Проверьте работу API.');
    } finally {
      setLoading(false);
    }
  }, [currentUser, handleLogout]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  return (
    <BrowserRouter>
      {currentUser ? (
        <DashboardLayout
          currentUser={currentUser}
          onLogout={handleLogout}
          objects={objects}
          setObjects={setObjects}
          personnel={personnel}
          setPersonnel={setPersonnel}
          events={events}
          setEvents={setEvents}
          loading={loading}
          loadError={loadError}
        />
      ) : (
        <Routes>
          <Route
            path="/Authentication"
            element={<AuthPage onAuthenticated={setCurrentUser} initialMode="login" />}
          />
          <Route
            path="/register"
            element={<AuthPage onAuthenticated={setCurrentUser} initialMode="register" />}
          />
          <Route path="*" element={<Navigate to="/Authentication" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default App;
