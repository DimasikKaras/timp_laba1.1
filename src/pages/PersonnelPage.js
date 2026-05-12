import { useMemo, useState } from 'react';
import { validateFIO, validatePhone } from '../utils/validators';

const initialPersonnelForm = {
  name: '',
  position: '',
  phone: '',
};

function PersonnelPage({ objects, personnel, onAssignPersonnel, onCreatePersonnel, onDeletePersonnel, onUpdatePersonnel }) {
  const [formData, setFormData] = useState(initialPersonnelForm);
  const [editingPersonId, setEditingPersonId] = useState(null);
  const [editingData, setEditingData] = useState(initialPersonnelForm);
  const [assignPersonId, setAssignPersonId] = useState(null);
  const [selectedObjectId, setSelectedObjectId] = useState('none');

  const sortedPersonnel = useMemo(
    () => [...personnel].sort((left, right) => Number(right.id) - Number(left.id)),
    [personnel]
  );

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (!validateFIO(formData.name)) {
      window.alert('ФИО должно содержать минимум Фамилию и Имя.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      window.alert('Некорректный номер телефона.');
      return;
    }

    try {
      await onCreatePersonnel(formData);
      setFormData(initialPersonnelForm);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!validateFIO(editingData.name)) {
      window.alert('ФИО должно содержать минимум Фамилию и Имя.');
      return;
    }

    if (!validatePhone(editingData.phone)) {
      window.alert('Некорректный номер телефона.');
      return;
    }

    try {
      await onUpdatePersonnel(editingPersonId, editingData);
      setEditingPersonId(null);
      setEditingData(initialPersonnelForm);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить сотрудника?')) {
      return;
    }

    try {
      await onDeletePersonnel(id);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleAssignSubmit = async () => {
    try {
      await onAssignPersonnel(assignPersonId, selectedObjectId === 'none' ? null : Number(selectedObjectId));
      setAssignPersonId(null);
      setSelectedObjectId('none');
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <section id="personnel-tab" className="tab-content">
      <header className="content-header">
        <h1>Управление персоналом</h1>
      </header>
      <div className="card add-form">
        <h3>
          <i className="fa-solid fa-user-plus" /> Добавить сотрудника
        </h3>
        <form id="add-personnel-form" className="grid-form" onSubmit={handleCreateSubmit}>
          <input
            type="text"
            id="pers-name"
            placeholder="ФИО (Иванов Иван)"
            required
            pattern="^[А-Яа-яЁё]+\s+[А-Яа-яЁё]+(\s+[А-Яа-яЁё]+)?$"
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
          />
          <select
            id="pers-position"
            required
            value={formData.position}
            onChange={(event) => setFormData((current) => ({ ...current, position: event.target.value }))}
          >
            <option value="">Должность...</option>
            <option value="Пожарный">Пожарный</option>
            <option value="Инспектор">Инспектор</option>
            <option value="Водитель">Водитель</option>
            <option value="Медик">Медик</option>
          </select>
          <input
            type="tel"
            id="pers-phone"
            placeholder="Телефон (+7 999 000-00-00)"
            required
            value={formData.phone}
            onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
          />
          <button type="submit" className="btn btn-primary">
            Добавить
          </button>
        </form>
      </div>

      <div className="card table-container">
        <table id="personnel-table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Должность</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedPersonnel.map((person) => {
              const assignedObject = objects.find((object) => String(object.id) === String(person.assignedTo));
              const statusBadge = person.status === 'Свободен' ? 'badge-free' : 'badge-busy';
              const statusText = assignedObject ? `На объекте: ${assignedObject.name}` : person.status;

              return (
                <tr key={person.id}>
                  <td>
                    <strong>{person.name}</strong>
                    <br />
                    <small>
                      <i className="fa-solid fa-phone" /> {person.phone}
                    </small>
                  </td>
                  <td>{person.position}</td>
                  <td>
                    <span className={`badge ${statusBadge}`}>{statusText}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setAssignPersonId(person.id);
                          setSelectedObjectId(person.assignedTo ? String(person.assignedTo) : 'none');
                        }}
                        type="button"
                      >
                        <i className="fa-solid fa-location-dot" /> Назначить
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setEditingPersonId(person.id);
                          setEditingData({
                            name: person.name,
                            position: person.position,
                            phone: person.phone,
                          });
                        }}
                        type="button"
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleDelete(person.id)}
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

      <div id="assign-modal" className={`modal ${assignPersonId ? '' : 'hidden'}`}>
        <div className="modal-content card">
          <h3>Назначить сотрудника</h3>
          <select
            id="assign-object-select"
            className="w-100 mt-15"
            value={selectedObjectId}
            onChange={(event) => setSelectedObjectId(event.target.value)}
          >
            <option value="none">-- Снять с объекта --</option>
            {objects.map((object) => (
              <option key={object.id} value={object.id}>
                {object.name} ({object.status})
              </option>
            ))}
          </select>
          <div className="modal-actions mt-15">
            <button id="confirm-assign-btn" className="btn btn-primary w-100" onClick={handleAssignSubmit} type="button">
              Подтвердить
            </button>
            <button
              onClick={() => {
                setAssignPersonId(null);
                setSelectedObjectId('none');
              }}
              className="btn btn-outline w-100"
              type="button"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>

      <div id="edit-personnel-modal" className={`modal ${editingPersonId ? '' : 'hidden'}`}>
        <div className="modal-content card">
          <h3>Редактировать сотрудника</h3>
          <form id="edit-personnel-form" className="mt-15" onSubmit={handleEditSubmit}>
            <input
              type="text"
              id="edit-pers-name"
              className="w-100 mb-10"
              placeholder="ФИО"
              required
              pattern="^[А-Яа-яЁё]+\s+[А-Яа-яЁё]+(\s+[А-Яа-яЁё]+)?$"
              value={editingData.name}
              onChange={(event) => setEditingData((current) => ({ ...current, name: event.target.value }))}
            />
            <select
              id="edit-pers-position"
              className="w-100 mb-10"
              required
              value={editingData.position}
              onChange={(event) =>
                setEditingData((current) => ({ ...current, position: event.target.value }))
              }
            >
              <option value="Пожарный">Пожарный</option>
              <option value="Инспектор">Инспектор</option>
              <option value="Водитель">Водитель</option>
              <option value="Медик">Медик</option>
            </select>
            <input
              type="tel"
              id="edit-pers-phone"
              className="w-100 mb-10"
              placeholder="Телефон"
              required
              value={editingData.phone}
              onChange={(event) => setEditingData((current) => ({ ...current, phone: event.target.value }))}
            />
            <div className="modal-actions mt-15">
              <button type="submit" className="btn btn-primary w-100">
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => setEditingPersonId(null)}
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

export default PersonnelPage;
