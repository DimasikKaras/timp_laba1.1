import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const Home = () => {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailObj, setDetailObj] = useState(null);

  const loadObjects = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/objects`);
      setObjects(response.data);
    } catch {
      setError('Ошибка загрузки данных. Убедитесь, что запущен json-server (npm run api).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObjects();
  }, []);

  const deleteObject = async (id) => {
    if (!window.confirm('Удалить объект?')) return;
    try {
      await axios.delete(`${API_URL}/objects/${id}`);
      setObjects(prev => prev.filter(o => o.id !== id));
    } catch {
      alert('Ошибка при удалении объекта.');
    }
  };

  const triggerAlarm = async (obj) => {
    if (obj.status === 'Тревога') {
      alert('Тревога уже активна!');
      return;
    }
    const reason = window.prompt('Причина тревоги:', 'Сработала пожарная сигнализация');
    if (reason === null) return;
    try {
      await axios.patch(`${API_URL}/objects/${obj.id}`, { status: 'Тревога' });
      const newEvent = {
        id: Date.now(),
        objectId: obj.id,
        objectName: obj.name,
        address: obj.address,
        reason: reason || 'Неизвестная причина',
        status: 'alarm',
        date: new Date().toLocaleString(),
      };
      await axios.post(`${API_URL}/events`, JSON.stringify(newEvent), {
        headers: { 'Content-Type': 'application/json' },
      });
      setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, status: 'Тревога' } : o));
      alert(`ВНИМАНИЕ! Объект "${obj.name}" в режиме ТРЕВОГИ!`);
    } catch {
      alert('Ошибка при активации тревоги.');
    }
  };

  return (
    <div>
      <header className="content-header">
        <h1>Управление объектами</h1>
      </header>

      <div className="card add-form">
        <h3><i className="fa-solid fa-plus"></i> Добавить объект</h3>
        <div style={{ marginTop: 15 }}>
          <Link to="/add" className="btn btn-primary">
            <i className="fa-solid fa-plus"></i> Новый объект
          </Link>
        </div>
      </div>

      {loading && (
        <div className="spinner">
          <i className="fa-solid fa-circle-notch"></i>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && (
        <div className="card table-container">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {objects.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-muted" style={{ textAlign: 'center' }}>
                    Объекты не найдены
                  </td>
                </tr>
              )}
              {objects.map(obj => (
                <tr key={obj.id}>
                  <td>
                    <strong>{obj.name}</strong>
                    <br />
                    <small className="text-muted">{obj.address}</small>
                  </td>
                  <td>
                    <span className={`badge ${obj.status === 'Тревога' ? 'badge-alarm' : 'badge-ok'}`}>
                      {obj.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-danger"
                        title="Активировать тревогу"
                        onClick={() => triggerAlarm(obj)}
                      >
                        <i className="fa-solid fa-bell"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        title="Подробнее"
                        onClick={() => setDetailObj(obj)}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <Link
                        to={`/detail/${obj.id}`}
                        className="btn btn-sm btn-outline"
                        title="Редактировать"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </Link>
                      <button
                        className="btn btn-sm btn-outline"
                        title="Удалить"
                        onClick={() => deleteObject(obj.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailObj && (
        <div className="modal-overlay" onClick={() => setDetailObj(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Информация об объекте</h3>
            <div className="mt-15">
              <p><strong><i className="fa-solid fa-building"></i> Название:</strong> {detailObj.name}</p>
              <p><strong><i className="fa-solid fa-map-location-dot"></i> Адрес:</strong> {detailObj.address}</p>
              <p><strong><i className="fa-solid fa-user-tie"></i> Ответственный:</strong> {detailObj.contactName}</p>
              <p><strong><i className="fa-solid fa-phone"></i> Телефон:</strong> {detailObj.contactPhone}</p>
              <p>
                <strong><i className="fa-solid fa-circle-info"></i> Статус:</strong>{' '}
                <span className={`badge ${detailObj.status === 'Тревога' ? 'badge-alarm' : 'badge-ok'}`}>
                  {detailObj.status}
                </span>
              </p>
            </div>
            <button onClick={() => setDetailObj(null)} className="btn btn-outline w-100 mt-15">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
