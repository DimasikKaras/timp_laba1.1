import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api, { ENTITY_CONFIG, ENTITY_TYPES, normalizePayload } from '../api';

const Form = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const [error, setError] = useState('');

  const type = useMemo(() => {
    const value = searchParams.get('type');
    return ENTITY_TYPES.includes(value) ? value : 'objects';
  }, [searchParams]);

  const [formData, setFormData] = useState(ENTITY_CONFIG[type].defaultValues);

  useEffect(() => {
    setFormData(ENTITY_CONFIG[type].defaultValues);
  }, [type]);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const loadItem = async () => {
      setError('');
      try {
        const response = await api.get(`/${type}/${id}`);
        const nextData = { ...ENTITY_CONFIG[type].defaultValues, ...response.data };
        if (type === 'personnel' && nextData.assignedTo === null) {
          nextData.assignedTo = '';
        }
        setFormData(nextData);
      } catch (err) {
        setError(`Не удалось загрузить запись для редактирования. ${err.message}`);
      }
    };

    loadItem();
  }, [id, isEdit, type]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = normalizePayload(type, formData);
      if (isEdit) {
        await api.put(`/${type}/${id}`, payload);
      } else {
        await api.post(`/${type}`, payload);
      }
      navigate('/');
    } catch (err) {
      setError(`Не удалось сохранить данные. ${err.message}`);
    }
  };

  return (
    <main>
      <h1>{isEdit ? 'Редактирование' : 'Добавление'}: {ENTITY_CONFIG[type].title}</h1>
      {error && <p className="error-text">{error}</p>}

      <form className="card form-grid" onSubmit={handleSubmit}>
        {ENTITY_CONFIG[type].fields.map((field) => (
          <label key={field.name}>
            {field.label}
            <input
              type={field.type || 'text'}
              value={formData[field.name] ?? ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            />
          </label>
        ))}
        <div className="actions-row">
          <button className="btn" type="submit">
            Сохранить
          </button>
          <Link className="btn btn-light" to="/">
            Отмена
          </Link>
        </div>
      </form>
    </main>
  );
};

export default Form;
