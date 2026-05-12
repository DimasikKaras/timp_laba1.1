import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { ENTITY_CONFIG, ENTITY_TYPES } from '../api';

const Home = () => {
  const [data, setData] = useState({ objects: [], personnel: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const responses = await Promise.all(ENTITY_TYPES.map((type) => api.get(`/${type}`)));
      const nextData = ENTITY_TYPES.reduce((acc, type, index) => {
        acc[type] = responses[index].data;
        return acc;
      }, {});
      setData(nextData);
    } catch (err) {
      setError('Не удалось загрузить данные. Проверьте json-server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (type, id) => {
    try {
      await api.delete(`/${type}/${id}`);
      setData((prev) => ({
        ...prev,
        [type]: prev[type].filter((item) => item.id !== id),
      }));
    } catch (err) {
      setError('Не удалось удалить запись.');
    }
  };

  return (
    <main>
      <h1>Система диспетчерской ПБ</h1>
      {loading && <p>Загрузка...</p>}
      {error && <p className="error-text">{error}</p>}

      {ENTITY_TYPES.map((type) => (
        <section key={type} className="card">
          <div className="section-header">
            <h2>{ENTITY_CONFIG[type].title}</h2>
            <Link className="btn" to={`/add?type=${type}`}>
              Добавить
            </Link>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {ENTITY_CONFIG[type].fields.map((field) => (
                    <th key={field.name}>{field.label}</th>
                  ))}
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {data[type]?.map((item) => (
                  <tr key={item.id}>
                    {ENTITY_CONFIG[type].fields.map((field) => (
                      <td key={field.name}>{item[field.name] ?? '-'}</td>
                    ))}
                    <td>
                      <div className="actions">
                        <Link to={`/detail/${item.id}?type=${type}`}>Открыть</Link>
                        <Link to={`/edit/${item.id}?type=${type}`}>Изменить</Link>
                        <button type="button" onClick={() => handleDelete(type, item.id)}>
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && data[type]?.length === 0 && (
                  <tr>
                    <td colSpan={ENTITY_CONFIG[type].fields.length + 1}>Нет записей</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </main>
  );
};

export default Home;
