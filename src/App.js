import { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/DashboardLayout';
import EventsPage from './pages/EventsPage';
import ObjectDetailPage from './pages/ObjectDetailPage';
import ObjectsPage from './pages/ObjectsPage';
import PersonnelPage from './pages/PersonnelPage';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

function ProtectedLayout({ currentUser, onLogout, isLoading, error }) {
  const navigate = useNavigate();

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout
      currentUser={currentUser}
      error={error}
      isLoading={isLoading}
      onLogout={() => {
        onLogout();
        navigate('/auth', { replace: true });
      }}
    />
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('pb_currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [objects, setObjects] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [objectsResponse, personnelResponse, eventsResponse] = await Promise.all([
        api.get('/objects'),
        api.get('/personnel'),
        api.get('/events?_sort=id&_order=desc'),
      ]);

      setObjects(objectsResponse.data);
      setPersonnel(personnelResponse.data);
      setEvents(eventsResponse.data);
    } catch (requestError) {
      setError('Не удалось загрузить данные с сервера. Убедитесь, что json-server запущен на порту 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const handleLogin = async ({ login, password }) => {
    try {
      const response = await api.get('/users', { params: { login: login.trim() } });
      const user = response.data.find((item) => item.pass === password);

      if (!user) {
        throw new Error('Неверный логин или пароль!');
      }

      setCurrentUser(user);
      localStorage.setItem('pb_currentUser', JSON.stringify(user));
    } catch (requestError) {
      throw new Error(requestError.message || 'Не удалось выполнить вход.');
    }
  };

  const handleRegister = async (payload) => {
    try {
      const response = await api.get('/users', { params: { login: payload.login } });

      if (response.data.length > 0) {
        throw new Error('Пользователь с таким логином уже существует!');
      }

      await api.post('/users', payload);
    } catch (requestError) {
      throw new Error(requestError.message || 'Не удалось выполнить регистрацию.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pb_currentUser');
    setError('');
  };

  const handleCreateObject = async (payload) => {
    try {
      await api.post('/objects', {
        id: Date.now(),
        name: payload.name.trim(),
        address: payload.address.trim(),
        contactName: payload.contactName.trim(),
        contactPhone: payload.contactPhone.trim(),
        status: 'В норме',
      });
      await loadDashboardData();
    } catch (requestError) {
      throw new Error('Не удалось добавить объект.');
    }
  };

  const handleUpdateObject = async (id, payload) => {
    const currentObject = objects.find((object) => object.id === id);

    if (!currentObject) {
      throw new Error('Объект не найден.');
    }

    try {
      await api.put(`/objects/${id}`, {
        ...currentObject,
        name: payload.name.trim(),
        address: payload.address.trim(),
        contactName: payload.contactName.trim(),
        contactPhone: payload.contactPhone.trim(),
      });
      await loadDashboardData();
    } catch (requestError) {
      throw new Error('Не удалось обновить объект.');
    }
  };

  const handleDeleteObject = async (id) => {
    try {
      await api.delete(`/objects/${id}`);
      await loadDashboardData();
    } catch (requestError) {
      throw new Error('Не удалось удалить объект.');
    }
  };

  const handleTriggerAlarm = async (id, reason) => {
    const currentObject = objects.find((object) => object.id === id);

    if (!currentObject) {
      throw new Error('Объект не найден.');
    }

    try {
      await api.patch(`/objects/${id}`, { status: 'Тревога' });
      await api.post('/events', {
        id: Date.now(),
        objectId: currentObject.id,
        objectName: currentObject.name,
        address: currentObject.address,
        reason,
        status: 'alarm',
        date: new Date().toLocaleString('ru-RU'),
      });
      await loadDashboardData();
    } catch (requestError) {
      throw new Error('Не удалось зарегистрировать тревогу.');
    }
  };

  const handleCreatePersonnel = async (payload) => {
    try {
      await api.post('/personnel', {
        id: Date.now(),
        name: payload.name.trim(),
        position: payload.position,
        phone: payload.phone.trim(),
        status: 'Свободен',
        assignedTo: null,
      });
      await loadDashboardData();
    } catch (requestError) {
      throw new Error('Не удалось добавить сотрудника.');
    }
  };

  const handleUpdatePersonnel = async (id, payload) => {
    const currentPerson = personnel.find((person) => person.id === id);

    if (!currentPerson) {
      throw new Error('Сотрудник не найден.');
    }

    try {
      await api.put(`/personnel/${id}`, {
        ...currentPerson,
        name: payload.name.trim(),
        position: payload.position,
        phone: payload.phone.trim(),
      });
      await loadDashboardData();
    } catch (requestError) {
      throw new Error('Не удалось обновить сотрудника.');
    }
  };

  const handleDeletePersonnel = async (id) => {
    try {
      await api.delete(`/personnel/${id}`);
      await loadDashboardData();
    } catch (requestError) {
      throw new Error('Не удалось удалить сотрудника.');
    }
  };

  const handleAssignPersonnel = async (personId, objectId) => {
    const currentPerson = personnel.find((person) => person.id === personId);

    if (!currentPerson) {
      throw new Error('Сотрудник не найден.');
    }

    try {
      await api.patch(`/personnel/${personId}`, {
        assignedTo: objectId,
        status: objectId ? 'На выезде' : 'Свободен',
      });
      await loadDashboardData();
    } catch (requestError) {
      throw new Error('Не удалось назначить сотрудника.');
    }
  };

  const handleResolveEvent = async (eventId, objectId) => {
    try {
      const assignedPersonnel = personnel.filter(
        (person) => String(person.assignedTo) === String(objectId)
      );

      await Promise.all([
        api.patch(`/events/${eventId}`, { status: 'resolved' }),
        api.patch(`/objects/${objectId}`, { status: 'В норме' }),
        ...assignedPersonnel.map((person) =>
          api.patch(`/personnel/${person.id}`, {
            assignedTo: null,
            status: 'Свободен',
          })
        ),
      ]);
      await loadDashboardData();
    } catch (requestError) {
      throw new Error('Не удалось урегулировать событие.');
    }
  };

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <AuthPage onLogin={handleLogin} onRegister={handleRegister} />
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedLayout
            currentUser={currentUser}
            error={error}
            isLoading={isLoading}
            onLogout={handleLogout}
          />
        }
      >
        <Route
          index
          element={
            <ObjectsPage
              objects={objects}
              onCreateObject={handleCreateObject}
              onDeleteObject={handleDeleteObject}
              onTriggerAlarm={handleTriggerAlarm}
              onUpdateObject={handleUpdateObject}
            />
          }
        />
        <Route
          path="detail/:id"
          element={<ObjectDetailPage objects={objects} onTriggerAlarm={handleTriggerAlarm} />}
        />
        <Route
          path="personnel"
          element={
            <PersonnelPage
              objects={objects}
              personnel={personnel}
              onAssignPersonnel={handleAssignPersonnel}
              onCreatePersonnel={handleCreatePersonnel}
              onDeletePersonnel={handleDeletePersonnel}
              onUpdatePersonnel={handleUpdatePersonnel}
            />
          }
        />
        <Route
          path="events"
          element={<EventsPage events={events} onResolveEvent={handleResolveEvent} />}
        />
      </Route>
      <Route path="*" element={<Navigate to={currentUser ? '/' : '/auth'} replace />} />
    </Routes>
  );
}

export default App;
