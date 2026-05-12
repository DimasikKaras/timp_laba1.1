import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { validateFIO, validatePhone } from '../utils/validation';

const ObjectsPage = ({ objects, setObjects, setEvents }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactName: '',
    contactPhone: '',
  });
  const [detailsObjectId, setDetailsObjectId] = useState(null);
  const [editObject, setEditObject] = useState(null);

  useEffect(() => {
    if (id) {
      setDetailsObjectId(id);
    } else {
      setDetailsObjectId(null);
    }
  }, [id]);

  const detailsObject = useMemo(() => {
    if (!detailsObjectId) return null;
    return objects.find((obj) => String(obj.id) === String(detailsObjectId));
  }, [detailsObjectId, objects]);

  const handleAddObject = async (event) => {
    event.preventDefault();
    if (!validateFIO(formData.contactName)) {
      alert('ФИО ответственного должно содержать минимум Фамилию и Имя.');
      return;
    }
    if (!validatePhone(formData.contactPhone)) {
      alert('Введите корректный номер телефона.');
      return;
    }
    const newObj = {
      id: Date.now(),
      name: formData.name,
      address: formData.address,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      status: 'В норме',
    };
    try {
      const response = await api.post('/objects', newObj);
      setObjects((prev) => [...prev, response.data]);
      setFormData({ name: '', address: '', contactName: '', contactPhone: '' });
    } catch (error) {
      console.error('Ошибка создания объекта', error);
      alert('Ошибка сети: объект не создан.');
    }
  };

  const deleteObject = async (objectId) => {
    if (!window.confirm('Удалить объект?')) return;
    try {
      await api.delete(`/objects/${objectId}`);
      setObjects((prev) => prev.filter((obj) => obj.id !== objectId));
    } catch (error) {
      console.error('Ошибка удаления объекта', error);
      alert('Ошибка сети: объект не удален.');
    }
  };

  const triggerAlarm = async (objectId) => {
    const obj = objects.find((item) => item.id === objectId);
    if (!obj) return;
    if (obj.status === 'Тревога') {
      alert('Тревога уже активна!');
      return;
    }
    const reason = prompt('Причина тревоги:', 'Сработала пожарная сигнализация');
    if (reason === null) return;
    const updatedObject = { ...obj, status: 'Тревога' };
    const newEvent = {
      id: Date.now(),
      objectId: obj.id,
      objectName: obj.name,
      address: obj.address,
      reason: reason || 'Неизвестная причина',
      status: 'alarm',
      date: new Date().toLocaleString(),
    };
    try {
      const [objectResponse, eventResponse] = await Promise.all([
        api.put(`/objects/${obj.id}`, updatedObject),
        api.post('/events', newEvent),
      ]);
      setObjects((prev) =>
        prev.map((item) => (item.id === obj.id ? objectResponse.data : item))
      );
      setEvents((prev) => [eventResponse.data, ...prev]);
      alert(`ВНИМАНИЕ! Объект "${obj.name}" в режиме ТРЕВОГИ!`);
    } catch (error) {
      console.error('Ошибка установки тревоги', error);
      alert('Ошибка сети: не удалось поставить тревогу.');
    }
  };

  const openEditObjectModal = (obj) => {
    setEditObject({ ...obj });
  };

  const handleEditObject = async (event) => {
    event.preventDefault();
    if (!editObject) return;
    if (!validateFIO(editObject.contactName)) {
      alert('ФИО ответственного должно содержать минимум Фамилию и Имя.');
      return;
    }
    if (!validatePhone(editObject.contactPhone)) {
      alert('Введите корректный номер телефона.');
      return;
    }
    try {
      const response = await api.put(`/objects/${editObject.id}`, editObject);
      setObjects((prev) =>
        prev.map((item) => (item.id === editObject.id ? response.data : item))
      );
      setEditObject(null);
    } catch (error) {
      console.error('Ошибка редактирования объекта', error);
      alert('Ошибка сети: изменения не сохранены.');
    }
  };

  const closeDetails = () => {
    navigate('/');
  };

  return (
    <section id="objects-tab" className="tab-content">
      <header className="content-header">
        <h1>Управление объектами</h1>
      </header>
      <div className="card add-form">
        <h3><i className="fa-solid fa-plus"></i> Добавить объект</h3>
        <form id="add-object-form" className="grid-form" onSubmit={handleAddObject}>
          <input
            type="text"
            id="obj-name"
            placeholder="Название (напр. ТЦ Галерея)"
            required
            value={formData.name}
            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            type="text"
            id="obj-address"
            placeholder="Адрес"
            required
            value={formData.address}
            onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
          />
          <input
            type="text"
            id="obj-contact-name"
            placeholder="ФИО (Иванов И.И.)"
            required
            pattern="^[А-Яа-яЁё]+\\s+[А-Яа-яЁё]+(\\s+[А-Яа-яЁё]+)?$"
            value={formData.contactName}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, contactName: event.target.value }))
            }
          />
          <input
            type="tel"
            id="obj-contact-phone"
            placeholder="Телефон (+7 999 000-00-00)"
            required
            value={formData.contactPhone}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, contactPhone: event.target.value }))
            }
          />
          <button type="submit" className="btn btn-primary">Добавить</button>
        </form>
      </div>

      <div className="card table-container">
        <table id="objects-table">
          <thead>
            <tr>
              <th>Название</th><th>Статус</th><th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {objects.map((obj) => {
              const isAlarm = obj.status === 'Тревога';
              return (
                <tr key={obj.id}>
                  <td>
                    <strong>{obj.name}</strong>
                    <br />
                    <small className="text-muted">{obj.address}</small>
                  </td>
                  <td>
                    <span className={`badge ${isAlarm ? 'badge-alarm' : 'badge-ok'}`}>{obj.status}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-danger" onClick={() => triggerAlarm(obj.id)}>
                        <i className="fa-solid fa-bell"></i>
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/detail/${obj.id}`)}>
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button className="btn btn-sm btn-outline" onClick={() => openEditObjectModal(obj)}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="btn btn-sm btn-outline" onClick={() => deleteObject(obj.id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detailsObjectId && (
        <div id="details-modal" className="modal">
          <div className="modal-content card">
            <h3>Информация об объекте</h3>
            <div id="details-content" className="mt-15">
              {detailsObject ? (
                <>
                  <p><strong><i className="fa-solid fa-building"></i> Название:</strong> {detailsObject.name}</p>
                  <p><strong><i className="fa-solid fa-map-location-dot"></i> Адрес:</strong> {detailsObject.address}</p>
                  <p><strong><i className="fa-solid fa-user-tie"></i> Ответственный:</strong> {detailsObject.contactName}</p>
                  <p><strong><i className="fa-solid fa-phone"></i> Телефон:</strong> {detailsObject.contactPhone}</p>
                  <p>
                    <strong><i className="fa-solid fa-circle-info"></i> Статус:</strong>{' '}
                    <span className={`badge ${detailsObject.status === 'Тревога' ? 'badge-alarm' : 'badge-ok'}`}>
                      {detailsObject.status}
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-muted">Объект не найден.</p>
              )}
            </div>
            <button onClick={closeDetails} className="btn btn-outline w-100 mt-15">Закрыть</button>
          </div>
        </div>
      )}

      {editObject && (
        <div id="edit-object-modal" className="modal">
          <div className="modal-content card">
            <h3>Редактировать объект</h3>
            <form id="edit-object-form" className="mt-15" onSubmit={handleEditObject}>
              <input
                type="text"
                id="edit-obj-name"
                className="w-100 mb-10"
                placeholder="Название"
                required
                value={editObject.name}
                onChange={(event) => setEditObject((prev) => ({ ...prev, name: event.target.value }))}
              />
              <input
                type="text"
                id="edit-obj-address"
                className="w-100 mb-10"
                placeholder="Адрес"
                required
                value={editObject.address}
                onChange={(event) => setEditObject((prev) => ({ ...prev, address: event.target.value }))}
              />
              <input
                type="text"
                id="edit-obj-contact-name"
                className="w-100 mb-10"
                placeholder="ФИО ответственного"
                required
                pattern="^[А-Яа-яЁё]+\\s+[А-Яа-яЁё]+(\\s+[А-Яа-яЁё]+)?$"
                value={editObject.contactName}
                onChange={(event) =>
                  setEditObject((prev) => ({ ...prev, contactName: event.target.value }))
                }
              />
              <input
                type="tel"
                id="edit-obj-contact-phone"
                className="w-100 mb-10"
                placeholder="Телефон"
                required
                value={editObject.contactPhone}
                onChange={(event) =>
                  setEditObject((prev) => ({ ...prev, contactPhone: event.target.value }))
                }
              />
              <div className="modal-actions mt-15">
                <button type="submit" className="btn btn-primary w-100">Сохранить</button>
                <button type="button" onClick={() => setEditObject(null)} className="btn btn-outline w-100">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ObjectsPage;
