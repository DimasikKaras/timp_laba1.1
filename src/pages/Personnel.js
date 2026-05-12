import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const fioRegex = /^[А-Яа-яЁё]+\s+[А-Яа-яЁё]+(\s+[А-Яа-яЁё]+)?$/;
const phoneRegex = /^(\+7|8)[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;

const POSITIONS = ['Пожарный', 'Инспектор', 'Водитель', 'Медик'];

const Personnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [addForm, setAddForm] = useState({ name: '', position: '', phone: '' });

  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', position: '', phone: '' });

  const [assignModal, setAssignModal] = useState(null);
  const [assignObjectId, setAssignObjectId] = useState('none');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [persResp, objResp] = await Promise.all([
        axios.get(`${API_URL}/personnel`),
        axios.get(`${API_URL}/objects`),
      ]);
      setPersonnel(persResp.data);
      setObjects(objResp.data);
    } catch {
      setError('Ошибка загрузки данных.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!fioRegex.test(addForm.name.trim())) {
      alert('ФИО должно содержать минимум Фамилию и Имя.');
      return;
    }
    if (!phoneRegex.test(addForm.phone.trim())) {
      alert('Некорректный номер телефона.');
      return;
    }
    const newPers = {
      id: Date.now(),
      name: addForm.name,
      position: addForm.position,
      phone: addForm.phone,
      status: 'Свободен',
      assignedTo: null,
    };
    try {
      const response = await axios.post(`${API_URL}/personnel`, JSON.stringify(newPers), {
        headers: { 'Content-Type': 'application/json' },
      });
      setPersonnel(prev => [...prev, response.data]);
      setAddForm({ name: '', position: '', phone: '' });
    } catch {
      alert('Ошибка при добавлении сотрудника.');
    }
  };

  const deletePerson = async (id) => {
    if (!window.confirm('Удалить сотрудника?')) return;
    try {
      await axios.delete(`${API_URL}/personnel/${id}`);
      setPersonnel(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Ошибка при удалении.');
    }
  };

  const openEditModal = (p) => {
    setEditModal(p);
    setEditForm({ name: p.name, position: p.position, phone: p.phone });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!fioRegex.test(editForm.name.trim())) {
      alert('ФИО должно содержать минимум Фамилию и Имя.');
      return;
    }
    if (!phoneRegex.test(editForm.phone.trim())) {
      alert('Некорректный номер телефона.');
      return;
    }
    const updated = { ...editModal, ...editForm };
    try {
      await axios.put(`${API_URL}/personnel/${editModal.id}`, JSON.stringify(updated), {
        headers: { 'Content-Type': 'application/json' },
      });
      setPersonnel(prev => prev.map(p => p.id === editModal.id ? updated : p));
      setEditModal(null);
    } catch {
      alert('Ошибка при обновлении данных.');
    }
  };

  const openAssignModal = (p) => {
    setAssignModal(p);
    setAssignObjectId(p.assignedTo ? String(p.assignedTo) : 'none');
  };

  const handleAssign = async () => {
    const person = assignModal;
    const updated = {
      ...person,
      assignedTo: assignObjectId === 'none' ? null : Number(assignObjectId),
      status: assignObjectId === 'none' ? 'Свободен' : 'На выезде',
    };
    try {
      await axios.put(`${API_URL}/personnel/${person.id}`, JSON.stringify(updated), {
        headers: { 'Content-Type': 'application/json' },
      });
      setPersonnel(prev => prev.map(p => p.id === person.id ? updated : p));
      setAssignModal(null);
    } catch {
      alert('Ошибка при назначении.');
    }
  };

  const getStatusBadge = (p) => {
    if (p.assignedTo) {
      const obj = objects.find(o => o.id === p.assignedTo || o.id === Number(p.assignedTo));
      return { cls: 'badge-busy', text: `На объекте: ${obj ? obj.name : 'Удалён'}` };
    }
    return { cls: 'badge-free', text: p.status };
  };

  return (
    <div>
      <header className="content-header">
        <h1>Управление персоналом</h1>
      </header>

      <div className="card add-form">
        <h3><i className="fa-solid fa-user-plus"></i> Добавить сотрудника</h3>
        <form onSubmit={handleAdd} className="grid-form">
          <input
            type="text"
            placeholder="ФИО (Иванов Иван)"
            required
            value={addForm.name}
            onChange={e => setAddForm({ ...addForm, name: e.target.value })}
          />
          <select
            required
            value={addForm.position}
            onChange={e => setAddForm({ ...addForm, position: e.target.value })}
          >
            <option value="">Должность...</option>
            {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
          </select>
          <input
            type="tel"
            placeholder="Телефон (+7 999 000-00-00)"
            required
            value={addForm.phone}
            onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
          />
          <button type="submit" className="btn btn-primary">Добавить</button>
        </form>
      </div>

      {loading && (
        <div className="spinner">
          <i className="fa-solid fa-circle-notch"></i>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && (
        <div className="card table-container">
          <table>
            <thead>
              <tr>
                <th>ФИО</th>
                <th>Должность</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {personnel.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-muted" style={{ textAlign: 'center' }}>
                    Персонал не найден
                  </td>
                </tr>
              )}
              {personnel.map(p => {
                const badge = getStatusBadge(p);
                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <br />
                      <small><i className="fa-solid fa-phone"></i> {p.phone}</small>
                    </td>
                    <td>{p.position}</td>
                    <td><span className={`badge ${badge.cls}`}>{badge.text}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => openAssignModal(p)}
                        >
                          <i className="fa-solid fa-location-dot"></i> Назначить
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => openEditModal(p)}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => deletePerson(p.id)}
                        >
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
      )}

      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Редактировать сотрудника</h3>
            <form onSubmit={handleEdit} className="mt-15">
              <div className="input-group">
                <input
                  type="text"
                  className="w-100"
                  placeholder="ФИО"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <select
                  className="w-100"
                  required
                  value={editForm.position}
                  onChange={e => setEditForm({ ...editForm, position: e.target.value })}
                >
                  {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
              </div>
              <div className="input-group">
                <input
                  type="tel"
                  className="w-100"
                  placeholder="Телефон"
                  required
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary w-100">Сохранить</button>
                <button type="button" onClick={() => setEditModal(null)} className="btn btn-outline w-100">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Назначить сотрудника</h3>
            <select
              className="w-100 mt-15"
              value={assignObjectId}
              onChange={e => setAssignObjectId(e.target.value)}
            >
              <option value="none">-- Снять с объекта --</option>
              {objects.map(obj => (
                <option key={obj.id} value={obj.id}>{obj.name} ({obj.status})</option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="btn btn-primary w-100" onClick={handleAssign}>Подтвердить</button>
              <button className="btn btn-outline w-100" onClick={() => setAssignModal(null)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personnel;
