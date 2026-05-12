import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const fioRegex = /^[А-Яа-яЁё]+\s+[А-Яа-яЁё]+(\s+[А-Яа-яЁё]+)?$/;
const phoneRegex = /^(\+7|8)[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);
  const addressRef = useRef(null);
  const contactNameRef = useRef(null);
  const contactPhoneRef = useRef(null);

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_URL}/objects/${id}`);
        setItem(response.data);
      } catch {
        setError('Объект не найден или ошибка подключения к серверу.');
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  useEffect(() => {
    if (item) {
      if (nameRef.current) nameRef.current.value = item.name || '';
      if (addressRef.current) addressRef.current.value = item.address || '';
      if (contactNameRef.current) contactNameRef.current.value = item.contactName || '';
      if (contactPhoneRef.current) contactPhoneRef.current.value = item.contactPhone || '';
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const updatedItem = {
      name: nameRef.current.value,
      address: addressRef.current.value,
      contactName: contactName,
      contactPhone: contactPhone,
    };

    setSaving(true);
    try {
      await axios.put(`${API_URL}/objects/${id}`, JSON.stringify({ ...item, ...updatedItem }), {
        headers: { 'Content-Type': 'application/json' },
      });
      alert('Данные обновлены!');
      navigate('/');
    } catch {
      alert('Ошибка при сохранении данных.');
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
        <h1>Редактирование объекта</h1>
      </header>
      <div className="card">
        <form onSubmit={handleSubmit} className="grid-form">
          <div>
            <label>Название</label>
            <input type="text" ref={nameRef} required placeholder="Название" />
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
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Detail;
