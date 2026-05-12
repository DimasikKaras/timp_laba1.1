import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { validateFIO, validatePhone } from '../utils/validators';

const initialObjectForm = {
  name: '',
  address: '',
  contactName: '',
  contactPhone: '',
};

function ObjectsPage({ objects, onCreateObject, onDeleteObject, onTriggerAlarm, onUpdateObject }) {
  const [formData, setFormData] = useState(initialObjectForm);
  const [editingObjectId, setEditingObjectId] = useState(null);
  const [editingData, setEditingData] = useState(initialObjectForm);

  const sortedObjects = useMemo(
    () => [...objects].sort((left, right) => Number(right.id) - Number(left.id)),
    [objects]
  );

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (!validateFIO(formData.contactName)) {
      window.alert('ФИО ответственного должно содержать минимум Фамилию и Имя.');
      return;
    }

    if (!validatePhone(formData.contactPhone)) {
      window.alert('Введите корректный номер телефона.');
      return;
    }

    try {
      await onCreateObject(formData);
      setFormData(initialObjectForm);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!validateFIO(editingData.contactName)) {
      window.alert('ФИО ответственного должно содержать минимум Фамилию и Имя.');
      return;
    }

    if (!validatePhone(editingData.contactPhone)) {
      window.alert('Введите корректный номер телефона.');
      return;
    }

    try {
      await onUpdateObject(editingObjectId, editingData);
      setEditingObjectId(null);
      setEditingData(initialObjectForm);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить объект?')) {
      return;
    }

    try {
      await onDeleteObject(id);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleTriggerAlarm = async (object) => {
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
    <section id="objects-tab" className="tab-content">
      <header className="content-header">
        <h1>Управление объектами</h1>
      </header>
      <div className="card add-form">
        <h3>
          <i className="fa-solid fa-plus" /> Добавить объект
        </h3>
        <form id="add-object-form" className="grid-form" onSubmit={handleCreateSubmit}>
          <input
            type="text"
            id="obj-name"
            placeholder="Название (напр. ТЦ Галерея)"
            required
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            type="text"
            id="obj-address"
            placeholder="Адрес"
            required
            value={formData.address}
            onChange={(event) => setFormData((current) => ({ ...current, address: event.target.value }))}
          />
          <input
            type="text"
            id="obj-contact-name"
            placeholder="ФИО (Иванов И.И.)"
            required
            pattern="^[А-Яа-яЁё]+\s+[А-Яа-яЁё]+(\s+[А-Яа-яЁё]+)?$"
            value={formData.contactName}
            onChange={(event) =>
              setFormData((current) => ({ ...current, contactName: event.target.value }))
            }
          />
          <input
            type="tel"
            id="obj-contact-phone"
            placeholder="Телефон (+7 999 000-00-00)"
            required
            value={formData.contactPhone}
            onChange={(event) =>
              setFormData((current) => ({ ...current, contactPhone: event.target.value }))
            }
          />
          <button type="submit" className="btn btn-primary">
            Добавить
          </button>
        </form>
      </div>

      <div className="card table-container">
        <table id="objects-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedObjects.map((object) => {
              const isAlarm = object.status === 'Тревога';

              return (
                <tr key={object.id}>
                  <td>
                    <strong>{object.name}</strong>
                    <br />
                    <small className="text-muted">{object.address}</small>
                  </td>
                  <td>
                    <span className={`badge ${isAlarm ? 'badge-alarm' : 'badge-ok'}`}>{object.status}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleTriggerAlarm(object)}
                        type="button"
                      >
                        <i className="fa-solid fa-bell" />
                      </button>
                      <Link className="btn btn-sm btn-secondary" to={`/detail/${object.id}`}>
                        <i className="fa-solid fa-eye" />
                      </Link>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setEditingObjectId(object.id);
                          setEditingData({
                            name: object.name,
                            address: object.address,
                            contactName: object.contactName,
                            contactPhone: object.contactPhone,
                          });
                        }}
                        type="button"
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleDelete(object.id)}
                        type="button"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div id="edit-object-modal" className={`modal ${editingObjectId ? '' : 'hidden'}`}>
        <div className="modal-content card">
          <h3>Редактировать объект</h3>
          <form id="edit-object-form" className="mt-15" onSubmit={handleEditSubmit}>
            <input
              type="text"
              id="edit-obj-name"
              className="w-100 mb-10"
              placeholder="Название"
              required
              value={editingData.name}
              onChange={(event) =>
                setEditingData((current) => ({ ...current, name: event.target.value }))
              }
            />
            <input
              type="text"
              id="edit-obj-address"
              className="w-100 mb-10"
              placeholder="Адрес"
              required
              value={editingData.address}
              onChange={(event) =>
                setEditingData((current) => ({ ...current, address: event.target.value }))
              }
            />
            <input
              type="text"
              id="edit-obj-contact-name"
              className="w-100 mb-10"
              placeholder="ФИО ответственного"
              required
              pattern="^[А-Яа-яЁё]+\s+[А-Яа-яЁё]+(\s+[А-Яа-яЁё]+)?$"
              value={editingData.contactName}
              onChange={(event) =>
                setEditingData((current) => ({ ...current, contactName: event.target.value }))
              }
            />
            <input
              type="tel"
              id="edit-obj-contact-phone"
              className="w-100 mb-10"
              placeholder="Телефон"
              required
              value={editingData.contactPhone}
              onChange={(event) =>
                setEditingData((current) => ({ ...current, contactPhone: event.target.value }))
              }
            />
            <div className="modal-actions mt-15">
              <button type="submit" className="btn btn-primary w-100">
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => setEditingObjectId(null)}
                className="btn btn-outline w-100"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ObjectsPage;
