import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [objects, setObjects] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [evResp, objResp, persResp] = await Promise.all([
        axios.get(`${API_URL}/events`),
        axios.get(`${API_URL}/objects`),
        axios.get(`${API_URL}/personnel`),
      ]);
      setEvents(evResp.data.slice().reverse());
      setObjects(objResp.data);
      setPersonnel(persResp.data);
    } catch {
      setError('Ошибка загрузки событий.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resolveEvent = async (ev) => {
    try {
      await axios.patch(`${API_URL}/events/${ev.id}`, { status: 'resolved' });

      const obj = objects.find(o => o.id === ev.objectId || o.id === Number(ev.objectId));
      if (obj) {
        await axios.patch(`${API_URL}/objects/${obj.id}`, { status: 'В норме' });
        setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, status: 'В норме' } : o));
      }

      const assignedPersonnel = personnel.filter(
        p => p.assignedTo === ev.objectId || p.assignedTo === Number(ev.objectId)
      );
      await Promise.all(
        assignedPersonnel.map(p =>
          axios.patch(`${API_URL}/personnel/${p.id}`, { assignedTo: null, status: 'Свободен' })
        )
      );
      if (assignedPersonnel.length > 0) {
        setPersonnel(prev =>
          prev.map(p =>
            assignedPersonnel.some(ap => ap.id === p.id)
              ? { ...p, assignedTo: null, status: 'Свободен' }
              : p
          )
        );
      }

      setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, status: 'resolved' } : e));
    } catch {
      alert('Ошибка при урегулировании события.');
    }
  };

  return (
    <div>
      <header className="content-header">
        <h1>Журнал событий</h1>
      </header>

      {loading && (
        <div className="spinner">
          <i className="fa-solid fa-circle-notch"></i>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && (
        <div className="events-grid">
          {events.length === 0 && (
            <p className="text-muted">Происшествий нет.</p>
          )}
          {events.map(ev => (
            <div
              key={ev.id}
              className={`event-card ${ev.status === 'alarm' ? 'event-alarm' : 'event-resolved'}`}
            >
              <div className="event-details">
                <p><strong><i className="fa-regular fa-clock"></i> Время:</strong> {ev.date}</p>
                <p>
                  <strong><i className="fa-solid fa-location-crosshairs"></i> Объект:</strong>{' '}
                  {ev.objectName} <small>({ev.address})</small>
                </p>
                <p><strong><i className="fa-solid fa-circle-exclamation"></i> Причина:</strong> {ev.reason}</p>
              </div>
              <div className="event-actions">
                {ev.status === 'alarm' ? (
                  <button className="btn btn-success" onClick={() => resolveEvent(ev)}>
                    <i className="fa-solid fa-check"></i> Урегулировано
                  </button>
                ) : (
                  <span className="badge badge-ok">
                    <i className="fa-solid fa-shield-check"></i> Безопасно
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
