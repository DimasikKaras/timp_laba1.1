import React, { useState } from 'react';
import api from '../api';
import { validateFIO } from '../utils/validation';

const AuthPage = ({ onAuthenticated }) => {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    login: '',
    password: '',
    confirm: '',
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.get('/users', {
        params: { login: loginForm.login },
      });
      const user = response.data.find((item) => item.pass === loginForm.password);
      if (!user) {
        alert('Неверный логин или пароль!');
        return;
      }
      localStorage.setItem('pb_currentUser', JSON.stringify(user));
      onAuthenticated(user);
    } catch (error) {
      console.error('Ошибка авторизации', error);
      alert('Ошибка сети: не удалось войти.');
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    if (!validateFIO(registerForm.name)) {
      alert('Введите корректное ФИО на русском (Например: Иванов Иван)');
      return;
    }
    if (registerForm.password !== registerForm.confirm) {
      alert('Пароли не совпадают!');
      return;
    }
    try {
      const existing = await api.get('/users', {
        params: { login: registerForm.login },
      });
      if (existing.data.length) {
        alert('Пользователь с таким логином уже существует!');
        return;
      }
      await api.post('/users', {
        name: registerForm.name,
        login: registerForm.login,
        pass: registerForm.password,
      });
      alert('Регистрация успешна! Теперь войдите.');
      setRegisterForm({ name: '', login: '', password: '', confirm: '' });
      setMode('login');
    } catch (error) {
      console.error('Ошибка регистрации', error);
      alert('Ошибка сети: не удалось зарегистрироваться.');
    }
  };

  return (
    <div id="auth-section" className="auth-bg">
      <div className={`form-box ${mode === 'login' ? '' : 'hidden'}`} id="login-box">
        <div className="auth-header">
          <i className="fa-solid fa-fire-extinguisher"></i>
          <h2>Вход в систему</h2>
        </div>
        <form id="login-form" onSubmit={handleLoginSubmit}>
          <div className="input-group">
            <input
              type="text"
              id="login-username"
              placeholder="Логин"
              required
              value={loginForm.login}
              onChange={(event) =>
                setLoginForm((prev) => ({ ...prev, login: event.target.value }))
              }
            />
          </div>
          <div className="input-group password-group">
            <input
              type={showLoginPassword ? 'text' : 'password'}
              id="login-password"
              placeholder="Пароль"
              required
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((prev) => ({ ...prev, password: event.target.value }))
              }
            />
            <i
              className={`fa-solid ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
              onClick={() => setShowLoginPassword((prev) => !prev)}
            ></i>
          </div>
          <button type="submit" className="btn btn-primary w-100">Войти</button>
        </form>
        <p>
          Нет аккаунта?{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => setMode('register')}
          >
            Зарегистрироваться
          </button>
        </p>
      </div>

      <div className={`form-box ${mode === 'register' ? '' : 'hidden'}`} id="register-box">
        <div className="auth-header">
          <i className="fa-solid fa-shield-halved"></i>
          <h2>Регистрация</h2>
        </div>
        <form id="register-form" onSubmit={handleRegisterSubmit}>
          <div className="input-group">
            <input
              type="text"
              id="reg-name"
              placeholder="ФИО (Например: Иванов Иван)"
              required
              title="Введите Фамилию и Имя на русском языке"
              pattern="^[А-Яа-яЁё]+\\s+[А-Яа-яЁё]+(\\s+[А-Яа-яЁё]+)?$"
              value={registerForm.name}
              onChange={(event) =>
                setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              id="reg-username"
              placeholder="Логин"
              required
              value={registerForm.login}
              onChange={(event) =>
                setRegisterForm((prev) => ({ ...prev, login: event.target.value }))
              }
            />
          </div>
          <div className="input-group password-group">
            <input
              type={showRegisterPassword ? 'text' : 'password'}
              id="reg-password"
              placeholder="Пароль"
              required
              minLength="4"
              value={registerForm.password}
              onChange={(event) =>
                setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
              }
            />
            <i
              className={`fa-solid ${showRegisterPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
              onClick={() => setShowRegisterPassword((prev) => !prev)}
            ></i>
          </div>
          <div className="input-group password-group">
            <input
              type={showRegisterConfirm ? 'text' : 'password'}
              id="reg-password-confirm"
              placeholder="Подтвердите пароль"
              required
              minLength="4"
              value={registerForm.confirm}
              onChange={(event) =>
                setRegisterForm((prev) => ({ ...prev, confirm: event.target.value }))
              }
            />
            <i
              className={`fa-solid ${showRegisterConfirm ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
              onClick={() => setShowRegisterConfirm((prev) => !prev)}
            ></i>
          </div>
          <button type="submit" className="btn btn-primary w-100">Зарегистрироваться</button>
        </form>
        <p>
          Уже есть аккаунт?{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => setMode('login')}
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
