import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const fioRegex = /^[А-Яа-яЁё]+\s+[А-Яа-яЁё]+(\s+[А-Яа-яЁё]+)?$/;
const phoneRegex = /^(\+7|8)[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;

const Form = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingItem, setExistingItem] = useState(null);

  const nameRef = useRef(null);
  const addressRef = useRef(null);
  const contactNameRef = useRef(null);
  const contactPhoneRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    const loadItem = async () => {
      try {
        const response = await axios.get(`${API_URL}/objects/${id}`);
        setExistingItem(response.data);
      } catch {
        setError('Объект не найден.');
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id, isEdit]);

  useEffect(() => {
    if (existingItem) {
      if (nameRef.current) nameRef.current.value = existingItem.name || '';
      if (addressRef.current) addressRef.current.value = existingItem.address || '';
      if (contactNameRef.current) contactNameRef.current.value = existingItem.contactName || '';
      if (contactPhoneRef.current) contactPhoneRef.current.value = existingItem.contactPhone || '';
    }
  }, [existingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = nameRef.current.value;
    const address = addressRef.current.value;
    const contactName = contactNameRef.current.value;
    const contactPhone = contactPhoneRef.current.value;

    if (!fioRegex.test(contactName.trim())) {
      alert('ФИО ответственного должно содержать минимум Фамилию и Имя.');
      return;
    }
    if (!phoneRegex.test(contactPhone.trim())) {
      alert('Введите корректный номер телефона.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/objects/${id}`, JSON.stringify({
          ...existingItem,
          name,
          address,
          contactName,
          contactPhone,
        }), { headers: { 'Content-Type': 'application/json' } });
      } else {
        const newItem = { id: Date.now(), name, address, contactName, contactPhone, status: 'В норме' };
        await axios.post(`${API_URL}/objects`, JSON.stringify(newItem), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      navigate('/');
    } catch {
      alert('Ошибка при сохранении. Проверьте подключение к серверу.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner">
        <i className="fa-solid fa-circle-notch"></i>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <button className="back-link" onClick={() => navigate('/')}>
          <i className="fa-solid fa-arrow-left"></i> Назад
        </button>
        <p className="error-msg">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/')}>
        <i className="fa-solid fa-arrow-left"></i> Назад
      </button>
      <header className="content-header">
        <h1>{isEdit ? 'Редактировать объект' : 'Добавить объект'}</h1>
      </header>
      <div className="card">
        <form onSubmit={handleSubmit} className="grid-form">
          <div>
            <label>Название</label>
            <input type="text" ref={nameRef} required placeholder="Название (напр. ТЦ Галерея)" />
          </div>
          <div>
            <label>Адрес</label>
            <input type="text" ref={addressRef} required placeholder="Адрес" />
          </div>
          <div>
            <label>ФИО ответственного</label>
            <input type="text" ref={contactNameRef} required placeholder="ФИО (Иванов И.И.)" />
          </div>
          <div>
            <label>Телефон</label>
            <input type="tel" ref={contactPhoneRef} required placeholder="Телефон (+7 999 000-00-00)" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Добавить')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;
