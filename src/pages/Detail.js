import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api, { ENTITY_CONFIG } from '../api';

const Detail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = ENTITY_CONFIG[searchParams.get('type')] ? searchParams.get('type') : 'objects';

  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadItem = async () => {
      setError('');
      try {
        const response = await api.get(`/${type}/${id}`);
        setItem(response.data);
      } catch (err) {
        setError(`Ошибка загрузки записи. ${err.message}`);
      }
    };

    loadItem();
  }, [id, type]);

  return (
    <main>
      <h1>Детализация: {ENTITY_CONFIG[type].title}</h1>
      {error && <p className="error-text">{error}</p>}
      {item && (
        <div className="card detail-grid">
          {ENTITY_CONFIG[type].fields.map((field) => (
            <div key={field.name}>
              <strong>{field.label}:</strong> {item[field.name] ?? '-'}
            </div>
          ))}
        </div>
      )}
      <div className="actions-row">
        <Link className="btn" to={`/edit/${id}?type=${type}`}>
          Редактировать
        </Link>
        <Link className="btn btn-light" to="/">
          Назад
        </Link>
      </div>
    </main>
  );
};

export default Detail;
