function EventsPage({ events, onResolveEvent }) {
  return (
    <section id="events-tab" className="tab-content">
      <header className="content-header">
        <h1>Журнал событий</h1>
      </header>
      <div id="events-list" className="events-grid">
        {events.length === 0 ? (
          <p className="text-muted">Происшествий нет.</p>
        ) : (
          events.map((event) => {
            const isAlarm = event.status === 'alarm';

            return (
              <div
                key={event.id}
                className={`event-card ${isAlarm ? 'event-alarm' : 'event-resolved'}`}
              >
                <div className="event-details">
                  <p>
                    <strong>
                      <i className="fa-regular fa-clock" /> Время:
                    </strong>{' '}
                    {event.date}
                  </p>
                  <p>
                    <strong>
                      <i className="fa-solid fa-location-crosshairs" /> Объект:
                    </strong>{' '}
                    {event.objectName} <small>({event.address})</small>
                  </p>
                  <p>
                    <strong>
                      <i className="fa-solid fa-circle-exclamation" /> Причина:
                    </strong>{' '}
                    {event.reason}
                  </p>
                </div>
                <div className="event-actions">
                  {isAlarm ? (
                    <button
                      className="btn btn-success"
                      onClick={() => onResolveEvent(event.id, event.objectId)}
                      type="button"
                    >
                      <i className="fa-solid fa-check" /> Урегулировано
                    </button>
                  ) : (
                    <span className="badge badge-ok">
                      <i className="fa-solid fa-shield-check" /> Безопасно
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default EventsPage;
