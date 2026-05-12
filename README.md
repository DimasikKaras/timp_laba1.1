# Система диспетчерской ПБ (React SPA)

Приложение преобразовано в SPA на React с маршрутизацией и REST API через `json-server`.

## Маршруты

- `/` — главная страница со списками сущностей
- `/detail/:id?type=objects|personnel|events` — детализация записи
- `/add?type=objects|personnel|events` — добавление
- `/edit/:id?type=objects|personnel|events` — редактирование

## Технологии

- React (функциональные компоненты + hooks)
- react-router-dom
- axios
- json-server

## Сущности

- `objects`: id, name, address, contactName, contactPhone, status
- `personnel`: id, name, position, phone, status, assignedTo
- `events`: id, objectId, objectName, address, reason, status, date

## Запуск

```bash
npm install
npm run api
npm start
```

API поднимается на `http://localhost:5000`, приложение — на `http://localhost:3000`.

## Проверка требований

- Реализованы страницы Home / Detail / Form
- Настроен роутинг (`/`, `/detail/:id`, `/add`, `/edit/:id`)
- Реализованы CRUD операции через axios (GET/POST/PUT/DELETE)
- Используется `db.json` в корне проекта
