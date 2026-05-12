import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = ({ objects, personnel, events }) => {
  const navigate = useNavigate();
  const MAX_DASHBOARD_ITEMS = 3;
  const totalObjects = objects.length;
  const alarmObjects = useMemo(
    () => objects.filter((obj) => obj.status === 'Тревога').length,
    [objects]
  );
  const normalObjects = totalObjects - alarmObjects;
  const freePersonnel = useMemo(
    () => personnel.filter((person) => person.status === 'Свободен').length,
    [personnel]
  );
  const busyPersonnel = personnel.length - freePersonnel;
  const activeEvents = useMemo(
    () => events.filter((eventItem) => eventItem.status === 'alarm').length,
    [events]
  );
  const resolvedEvents = events.length - activeEvents;
  const latestObjects = useMemo(() => objects.slice(0, MAX_DASHBOARD_ITEMS), [objects]);
  const latestPersonnel = useMemo(() => personnel.slice(0, MAX_DASHBOARD_ITEMS), [personnel]);
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => (b.id || 0) - (a.id || 0)),
    [events]
  );
  const latestEvents = useMemo(
    () => sortedEvents.slice(0, MAX_DASHBOARD_ITEMS),
    [sortedEvents]
  );

  return (
    <section id="home-tab" className="tab-content">
      <header className="content-header">
        <h1>Главная</h1>
        <p className="text-muted">Краткий обзор объектов, персонала и событий.</p>
      </header>
      <div className="home-grid">
        <div className="card home-card">
          <div className="section-header">
            <h3><i className="fa-solid fa-building"></i> Объекты</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/objects')}>
              Открыть раздел
            </button>
          </div>
          <div className="home-metrics">
            <div className="home-metric">
              <span className="metric-label">Всего</span>
              <span className="metric-value">{totalObjects}</span>
            </div>
            <div className="home-metric">
              <span className="metric-label">В норме</span>
              <span className="metric-value">{normalObjects}</span>
            </div>
            <div className="home-metric">
              <span className={`metric-value ${alarmObjects ? 'metric-alert' : ''}`}>{alarmObjects}</span>
              <span className="metric-label">Тревога</span>
            </div>
          </div>
          <div className="home-list">
            {latestObjects.length ? (
              latestObjects.map((obj) => (
                <div key={obj.id} className="home-list-item">
                  <div>
                    <strong>{obj.name}</strong>
                    <small className="text-muted">{obj.address}</small>
                  </div>
                  <span className={`badge ${obj.status === 'Тревога' ? 'badge-alarm' : 'badge-ok'}`}>
                    {obj.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted">Объекты пока не добавлены.</p>
            )}
          </div>
        </div>

        <div className="card home-card">
          <div className="section-header">
            <h3><i className="fa-solid fa-users"></i> Персонал</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/personnel')}>
              Открыть раздел
            </button>
          </div>
          <div className="home-metrics">
            <div className="home-metric">
              <span className="metric-label">Всего</span>
              <span className="metric-value">{personnel.length}</span>
            </div>
            <div className="home-metric">
              <span className="metric-label">Свободны</span>
              <span className="metric-value">{freePersonnel}</span>
            </div>
            <div className="home-metric">
              <span className="metric-label">На выезде</span>
              <span className="metric-value">{busyPersonnel}</span>
            </div>
          </div>
          <div className="home-list">
            {latestPersonnel.length ? (
              latestPersonnel.map((person) => (
                <div key={person.id} className="home-list-item">
                  <div>
                    <strong>{person.name}</strong>
                    <small className="text-muted">{person.position}</small>
                  </div>
                  <span className={`badge ${person.status === 'Свободен' ? 'badge-free' : 'badge-busy'}`}>
                    {person.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted">Персонал пока не добавлен.</p>
            )}
          </div>
        </div>

        <div className="card home-card">
          <div className="section-header">
            <h3><i className="fa-solid fa-triangle-exclamation"></i> События</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/events')}>
              Открыть раздел
            </button>
          </div>
          <div className="home-metrics">
            <div className="home-metric">
              <span className="metric-label">Всего</span>
              <span className="metric-value">{events.length}</span>
            </div>
            <div className="home-metric">
              <span className={`metric-value ${activeEvents ? 'metric-alert' : ''}`}>{activeEvents}</span>
              <span className="metric-label">Активные</span>
            </div>
            <div className="home-metric">
              <span className="metric-label">Закрыты</span>
              <span className="metric-value">{resolvedEvents}</span>
            </div>
          </div>
          <div className="home-list">
            {latestEvents.length ? (
              latestEvents.map((eventItem) => (
                <div key={eventItem.id} className="home-list-item">
                  <div>
                    <strong>{eventItem.reason}</strong>
                    <small className="text-muted">{eventItem.objectName}</small>
                  </div>
                  <span className={`badge ${eventItem.status === 'alarm' ? 'badge-alarm' : 'badge-ok'}`}>
                    {eventItem.status === 'alarm' ? 'Тревога' : 'Закрыто'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted">Событий пока нет.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
