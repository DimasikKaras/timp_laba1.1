import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ENTITY_CONFIG = {
  objects: {
    title: 'Объекты',
    defaultValues: {
      name: '',
      address: '',
      contactName: '',
      contactPhone: '',
      status: 'В норме',
    },
    fields: [
      { name: 'name', label: 'Название', required: true },
      { name: 'address', label: 'Адрес', required: true },
      { name: 'contactName', label: 'Ответственный', required: true },
      { name: 'contactPhone', label: 'Телефон', required: true },
      { name: 'status', label: 'Статус', required: true },
    ],
  },
  personnel: {
    title: 'Персонал',
    defaultValues: {
      name: '',
      position: '',
      phone: '',
      status: 'Свободен',
      assignedTo: '',
    },
    fields: [
      { name: 'name', label: 'ФИО', required: true },
      { name: 'position', label: 'Должность', required: true },
      { name: 'phone', label: 'Телефон', required: true },
      { name: 'status', label: 'Статус', required: true },
      { name: 'assignedTo', label: 'Назначен на объект (id)' },
    ],
  },
  events: {
    title: 'События',
    defaultValues: {
      objectId: '',
      objectName: '',
      address: '',
      reason: '',
      status: 'alarm',
      date: '',
    },
    fields: [
      { name: 'objectId', label: 'ID объекта', required: true, type: 'number' },
      { name: 'objectName', label: 'Название объекта', required: true },
      { name: 'address', label: 'Адрес', required: true },
      { name: 'reason', label: 'Причина', required: true },
      { name: 'status', label: 'Статус', required: true },
      { name: 'date', label: 'Дата', required: true },
    ],
  },
};

export const ENTITY_TYPES = Object.keys(ENTITY_CONFIG);

export const normalizePayload = (type, values) => {
  const payload = { ...values };

  if (type === 'personnel') {
    payload.assignedTo = payload.assignedTo === '' ? null : Number(payload.assignedTo);
  }

  if (type === 'events') {
    payload.objectId = Number(payload.objectId);
  }

  return payload;
};

export default api;
