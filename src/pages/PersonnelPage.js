import React, { useMemo, useState } from 'react';
import api from '../api';
import { validateFIO, validatePhone } from '../utils/validation';

const PersonnelPage = ({ personnel, setPersonnel, objects }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    phone: '',
  });
  const [assignPersonId, setAssignPersonId] = useState(null);
  const [assignTargetId, setAssignTargetId] = useState('none');
  const [editPerson, setEditPerson] = useState(null);

  const assignPerson = useMemo(
    () => personnel.find((person) => person.id === assignPersonId),
    [assignPersonId, personnel]
  );

  const handleAddPersonnel = async (event) => {
    event.preventDefault();
    if (!validateFIO(formData.name)) {
      alert('ФИО должно содержать минимум Фамилию и Имя.');
      return;
    }
    if (!validatePhone(formData.phone)) {
      alert('Некорректный номер телефона.');
      return;
    }
    const newPerson = {
      id: Date.now(),
      name: formData.name,
      position: formData.position,
      phone: formData.phone,
      status: 'Свободен',
      assignedTo: null,
    };
    try {
      const response = await api.post('/personnel', newPerson);
      setPersonnel((prev) => [...prev, response.data]);
      setFormData({ name: '', position: '', phone: '' });
    } catch (error) {
      console.error('Ошибка добавления сотрудника', error);
      alert('Ошибка сети: сотрудник не создан.');
    }
  };

  const deletePerson = async (personId) => {
    if (!window.confirm('Удалить сотрудника?')) return;
    try {
      await api.delete(`/personnel/${personId}`);
      setPersonnel((prev) => prev.filter((person) => person.id !== personId));
    } catch (error) {
      console.error('Ошибка удаления сотрудника', error);
      alert('Ошибка сети: сотрудник не удален.');
    }
  };

  const openAssignModal = (personId) => {
    const person = personnel.find((item) => item.id === personId);
    setAssignPersonId(personId);
    setAssignTargetId(person?.assignedTo ? String(person.assignedTo) : 'none');
  };

  const confirmAssign = async () => {
    if (!assignPerson) return;
    const updatedPerson = {
      ...assignPerson,
      assignedTo: assignTargetId === 'none' ? null : Number(assignTargetId),
      status: assignTargetId === 'none' ? 'Свободен' : 'На выезде',
    };
    try {
      const response = await api.put(`/personnel/${assignPerson.id}`, updatedPerson);
      setPersonnel((prev) =>
        prev.map((person) => (person.id === assignPerson.id ? response.data : person))
      );
      setAssignPersonId(null);
      setAssignTargetId('none');
    } catch (error) {
      console.error('Ошибка назначения сотрудника', error);
      alert('Ошибка сети: назначение не сохранено.');
    }
  };

  const handleEditPerson = async (event) => {
    event.preventDefault();
    if (!editPerson) return;
    if (!validateFIO(editPerson.name)) {
      alert('ФИО должно содержать минимум Фамилию и Имя.');
      return;
    }
    if (!validatePhone(editPerson.phone)) {
      alert('Некорректный номер телефона.');
      return;
    }
    try {
      const response = await api.put(`/personnel/${editPerson.id}`, editPerson);
      setPersonnel((prev) =>
        prev.map((person) => (person.id === editPerson.id ? response.data : person))
      );
      setEditPerson(null);
    } catch (error) {
      console.error('Ошибка редактирования сотрудника', error);
      alert('Ошибка сети: изменения не сохранены.');
    }
  };

  const getStatusText = (person) => {
    if (person.assignedTo) {
      const obj = objects.find((item) => String(item.id) === String(person.assignedTo));
      return `На объекте: ${obj ? obj.name : 'Удален'}`;
    }
    return person.status;
  };

  return (
    <section id="personnel-tab" className="tab-content">
      <header className="content-header">
        <h1>Управление персоналом</h1>
      </header>
      <div className="card add-form">
        <h3><i className="fa-solid fa-user-plus"></i> Добавить сотрудника</h3>
        <form id="add-personnel-form" className="grid-form" onSubmit={handleAddPersonnel}>
          <input
            type="text"
            id="pers-name"
            placeholder="ФИО (Иванов Иван)"
            required
            pattern="^[А-Яа-яЁё]+\\s+[А-Яа-яЁё]+(\\s+[А-Яа-яЁё]+)?$"
            value={formData.name}
            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
          />
          <select
            id="pers-position"
            required
            value={formData.position}
            onChange={(event) => setFormData((prev) => ({ ...prev, position: event.target.value }))}
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
            onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <button type="submit" className="btn btn-primary">Добавить</button>
        </form>
      </div>

      <div className="card table-container">
        <table id="personnel-table">
          <thead>
            <tr>
              <th>ФИО</th><th>Должность</th><th>Статус</th><th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {personnel.map((person) => {
              const statusBadge = person.status === 'Свободен' ? 'badge-free' : 'badge-busy';
              return (
                <tr key={person.id}>
                  <td>
                    <strong>{person.name}</strong>
                    <br />
                    <small><i className="fa-solid fa-phone"></i> {person.phone}</small>
                  </td>
                  <td>{person.position}</td>
                  <td>
                    <span className={`badge ${statusBadge}`}>{getStatusText(person)}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-secondary" onClick={() => openAssignModal(person.id)}>
                        <i className="fa-solid fa-location-dot"></i> Назначить
                      </button>
                      <button className="btn btn-sm btn-outline" onClick={() => setEditPerson({ ...person })}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="btn btn-sm btn-outline" onClick={() => deletePerson(person.id)}>
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

      {assignPersonId && (
        <div id="assign-modal" className="modal">
          <div className="modal-content card">
            <h3>Назначить сотрудника</h3>
            <select
              id="assign-object-select"
              className="w-100 mt-15"
              value={assignTargetId}
              onChange={(event) => setAssignTargetId(event.target.value)}
            >
              <option value="none">-- Снять с объекта --</option>
              {objects.map((obj) => (
                <option key={obj.id} value={obj.id}>{obj.name} ({obj.status})</option>
              ))}
            </select>
            <div className="modal-actions mt-15">
              <button id="confirm-assign-btn" className="btn btn-primary w-100" onClick={confirmAssign}>
                Подтвердить
              </button>
              <button onClick={() => setAssignPersonId(null)} className="btn btn-outline w-100">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {editPerson && (
        <div id="edit-personnel-modal" className="modal">
          <div className="modal-content card">
            <h3>Редактировать сотрудника</h3>
            <form id="edit-personnel-form" className="mt-15" onSubmit={handleEditPerson}>
              <input
                type="text"
                id="edit-pers-name"
                className="w-100 mb-10"
                placeholder="ФИО"
                required
                pattern="^[А-Яа-яЁё]+\\s+[А-Яа-яЁё]+(\\s+[А-Яа-яЁё]+)?$"
                value={editPerson.name}
                onChange={(event) => setEditPerson((prev) => ({ ...prev, name: event.target.value }))}
              />
              <select
                id="edit-pers-position"
                className="w-100 mb-10"
                required
                value={editPerson.position}
                onChange={(event) => setEditPerson((prev) => ({ ...prev, position: event.target.value }))}
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
                value={editPerson.phone}
                onChange={(event) => setEditPerson((prev) => ({ ...prev, phone: event.target.value }))}
              />
              <div className="modal-actions mt-15">
                <button type="submit" className="btn btn-primary w-100">Сохранить</button>
                <button type="button" onClick={() => setEditPerson(null)} className="btn btn-outline w-100">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default PersonnelPage;
