import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const fioRegex = /^[А-Яа-яЁё]+\s+[А-Яа-яЁё]+(\s+[А-Яа-яЁё]+)?$/;

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', username: '', password: '', confirm: '' });
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users?login=${loginForm.username}`);
      const user = response.data.find(u => u.login === loginForm.username && u.pass === loginForm.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Неверный логин или пароль!');
      }
    } catch {
      setError('Ошибка подключения к серверу. Убедитесь, что запущен json-server (npm run api).');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!fioRegex.test(regForm.name.trim())) {
      setError('Введите корректное ФИО на русском (Например: Иванов Иван)');
      return;
    }
    if (regForm.password !== regForm.confirm) {
      setError('Пароли не совпадают!');
      return;
    }
    if (regForm.password.length < 4) {
      setError('Пароль должен быть не менее 4 символов.');
      return;
    }
    setLoading(true);
    try {
      const check = await axios.get(`${API_URL}/users?login=${regForm.username}`);
      if (check.data.length > 0) {
        setError('Пользователь с таким логином уже существует!');
        setLoading(false);
        return;
      }
      await axios.post(`${API_URL}/users`, {
        name: regForm.name,
        login: regForm.username,
        pass: regForm.password,
      });
      alert('Регистрация успешна! Теперь войдите.');
      setRegForm({ name: '', username: '', password: '', confirm: '' });
      setMode('login');
    } catch {
      setError('Ошибка регистрации. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      {mode === 'login' ? (
        <div className="form-box">
          <div className="auth-header">
            <i className="fa-solid fa-fire-extinguisher"></i>
            <h2>Вход в систему</h2>
          </div>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Логин"
                required
                value={loginForm.username}
                onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>
            <div className="input-group password-group">
              <input
                type={showLoginPass ? 'text' : 'password'}
                placeholder="Пароль"
                required
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowLoginPass(v => !v)}
              >
                <i className={`fa-solid ${showLoginPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          <p>Нет аккаунта? <button className="link-btn" onClick={() => { setMode('register'); setError(''); }}>Зарегистрироваться</button></p>
        </div>
      ) : (
        <div className="form-box">
          <div className="auth-header">
            <i className="fa-solid fa-shield-halved"></i>
            <h2>Регистрация</h2>
          </div>
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <input
                type="text"
                placeholder="ФИО (Например: Иванов Иван)"
                required
                value={regForm.name}
                onChange={e => setRegForm({ ...regForm, name: e.target.value })}
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Логин"
                required
                value={regForm.username}
                onChange={e => setRegForm({ ...regForm, username: e.target.value })}
              />
            </div>
            <div className="input-group password-group">
              <input
                type={showRegPass ? 'text' : 'password'}
                placeholder="Пароль"
                required
                minLength="4"
                value={regForm.password}
                onChange={e => setRegForm({ ...regForm, password: e.target.value })}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowRegPass(v => !v)}
              >
                <i className={`fa-solid ${showRegPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            <div className="input-group password-group">
              <input
                type={showRegConfirm ? 'text' : 'password'}
                placeholder="Подтвердите пароль"
                required
                minLength="4"
                value={regForm.confirm}
                onChange={e => setRegForm({ ...regForm, confirm: e.target.value })}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowRegConfirm(v => !v)}
              >
                <i className={`fa-solid ${showRegConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          <p>Уже есть аккаунт? <button className="link-btn" onClick={() => { setMode('login'); setError(''); }}>Войти</button></p>
        </div>
      )}
    </div>
  );
};

export default Login;
