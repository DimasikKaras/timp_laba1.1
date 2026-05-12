import { useNavigate, useParams } from 'react-router-dom';

function ObjectDetailPage({ objects, onTriggerAlarm }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const object = objects.find((item) => String(item.id) === id);

  const handleTriggerAlarm = async () => {
    if (!object) {
      return;
    }

    if (object.status === 'Тревога') {
      window.alert('Тревога уже активна!');
      return;
    }

    const reason = window.prompt('Причина тревоги:', 'Сработала пожарная сигнализация');
    if (reason === null) {
      return;
    }

    try {
      await onTriggerAlarm(object.id, reason || 'Неизвестная причина');
      window.alert(`ВНИМАНИЕ! Объект "${object.name}" в режиме ТРЕВОГИ!`);
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <section className="tab-content">
      <header className="content-header content-actions">
        <h1>Информация об объекте</h1>
        <div className="action-buttons">
          <button className="btn btn-outline" onClick={() => navigate('/')} type="button">
            Назад
          </button>
          {object ? (
            <button className="btn btn-danger" onClick={handleTriggerAlarm} type="button">
              <i className="fa-solid fa-bell" /> Тревога
            </button>
          ) : null}
        </div>
      </header>

      <div className="card detail-card">
        {object ? (
          <div id="details-content" className="mt-15">
            <p>
              <strong>
                <i className="fa-solid fa-building" /> Название:
              </strong>{' '}
              {object.name}
            </p>
            <p>
              <strong>
                <i className="fa-solid fa-map-location-dot" /> Адрес:
              </strong>{' '}
              {object.address}
            </p>
            <p>
              <strong>
                <i className="fa-solid fa-user-tie" /> Ответственный:
              </strong>{' '}
              {object.contactName}
            </p>
            <p>
              <strong>
                <i className="fa-solid fa-phone" /> Телефон:
              </strong>{' '}
              {object.contactPhone}
            </p>
            <p>
              <strong>
                <i className="fa-solid fa-circle-info" /> Статус:
              </strong>{' '}
              <span className={`badge ${object.status === 'Тревога' ? 'badge-alarm' : 'badge-ok'}`}>
                {object.status}
              </span>
            </p>
          </div>
        ) : (
          <p>Объект не найден.</p>
        )}
      </div>
    </section>
  );
}

export default ObjectDetailPage;
