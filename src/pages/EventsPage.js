import React from 'react';
import api from '../api';

const EventsPage = ({ events, setEvents, objects, setObjects, personnel, setPersonnel }) => {
  const deleteEvent = async (eventId) => {
    if (!window.confirm('Удалить событие?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((item) => item.id !== eventId));
    } catch (error) {
      console.error(`Ошибка удаления события с ID ${eventId}:`, error);
      alert('Не удалось удалить событие. Попробуйте позже.');
    }
  };

  const resolveEvent = async (eventId, objectId) => {
    const eventItem = events.find((item) => item.id === eventId);
    if (!eventItem) return;
    const objectItem = objects.find((item) => item.id === objectId);
    const updatedEvent = { ...eventItem, status: 'resolved' };
    const updatedObject = objectItem ? { ...objectItem, status: 'В норме' } : null;
    const affectedPersonnel = personnel.filter((person) => String(person.assignedTo) === String(objectId));
    const updatedPersonnel = affectedPersonnel.map((person) => ({
      ...person,
      assignedTo: null,
      status: 'Свободен',
    }));

    try {
      await api.put(`/events/${eventItem.id}`, updatedEvent);
      if (updatedObject) {
        await api.put(`/objects/${updatedObject.id}`, updatedObject);
      }
      if (updatedPersonnel.length) {
        await Promise.all(
          updatedPersonnel.map((person) => api.put(`/personnel/${person.id}`, person))
        );
      }
      setEvents((prev) =>
        prev.map((item) => (item.id === updatedEvent.id ? updatedEvent : item))
      );
      if (updatedObject) {
        setObjects((prev) =>
          prev.map((item) => (item.id === updatedObject.id ? updatedObject : item))
        );
      }
      if (updatedPersonnel.length) {
        setPersonnel((prev) =>
          prev.map((person) => {
            const updated = updatedPersonnel.find((item) => item.id === person.id);
            return updated || person;
          })
        );
      }
    } catch (error) {
      console.error('Ошибка закрытия события', error);
      alert('Ошибка сети: не удалось закрыть событие.');
    }
  };

  return (
    <section id="events-tab" className="tab-content">
      <header className="content-header">
        <h1>Журнал событий</h1>
      </header>
      <div id="events-list" className="events-grid">
        {events.length === 0 ? (
          <p className="text-muted">Происшествий нет.</p>
        ) : (
          events.map((eventItem) => (
            <div
              key={eventItem.id}
              className={`event-card ${eventItem.status === 'alarm' ? 'event-alarm' : 'event-resolved'}`}
            >
              <div className="event-details">
                <p><strong><i className="fa-regular fa-clock"></i> Время:</strong> {eventItem.date}</p>
                <p>
                  <strong><i className="fa-solid fa-location-crosshairs"></i> Объект:</strong>{' '}
                  {eventItem.objectName} <small>({eventItem.address})</small>
                </p>
                <p><strong><i className="fa-solid fa-circle-exclamation"></i> Причина:</strong> {eventItem.reason}</p>
              </div>
              <div className="event-actions">
                {eventItem.status === 'alarm' ? (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => resolveEvent(eventItem.id, eventItem.objectId)}
                    >
                      <i className="fa-solid fa-check"></i> Урегулировано
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => deleteEvent(eventItem.id)}
                    >
                      <i className="fa-solid fa-trash"></i> Удалить
                    </button>
                  </>
                ) : (
                  <>
                    <span className="badge badge-ok"><i className="fa-solid fa-shield-check"></i> Безопасно</span>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => deleteEvent(eventItem.id)}
                    >
                      <i className="fa-solid fa-trash"></i> Удалить
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default EventsPage;
