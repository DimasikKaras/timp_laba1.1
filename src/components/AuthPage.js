import { useState } from 'react';
import { validateFIO } from '../utils/validators';

const initialLoginForm = {
  login: '',
  password: '',
};

const initialRegisterForm = {
  name: '',
  login: '',
  password: '',
  confirmPassword: '',
};

function AuthPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePassword = (field) => {
    setVisiblePasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    try {
      await onLogin(loginForm);
      setLoginForm(initialLoginForm);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    if (!validateFIO(registerForm.name)) {
      window.alert('Введите корректное ФИО на русском (Например: Иванов Иван)');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      window.alert('Пароли не совпадают!');
      return;
    }

    try {
      await onRegister({
        name: registerForm.name.trim(),
        login: registerForm.login.trim(),
        pass: registerForm.password,
      });
      window.alert('Регистрация успешна! Теперь войдите.');
      setRegisterForm(initialRegisterForm);
      setMode('login');
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <div id="auth-section" className="auth-bg">
      <div className={`form-box ${mode === 'login' ? '' : 'hidden'}`} id="login-box">
        <div className="auth-header">
          <i className="fa-solid fa-fire-extinguisher" />
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
                setLoginForm((current) => ({ ...current, login: event.target.value }))
              }
            />
          </div>
          <div className="input-group password-group">
            <input
              type={visiblePasswords.loginPassword ? 'text' : 'password'}
              id="login-password"
              placeholder="Пароль"
              required
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <i
              className={`fa-solid ${visiblePasswords.loginPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
              onClick={() => togglePassword('loginPassword')}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Войти
          </button>
        </form>
        <p>
          Нет аккаунта?{' '}
          <a
            href="#switch-to-register"
            onClick={(event) => {
              event.preventDefault();
              setMode('register');
            }}
          >
            Зарегистрироваться
          </a>
        </p>
      </div>

      <div className={`form-box ${mode === 'register' ? '' : 'hidden'}`} id="register-box">
        <div className="auth-header">
          <i className="fa-solid fa-shield-halved" />
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
              pattern="^[А-Яа-яЁё]+\s+[А-Яа-яЁё]+(\s+[А-Яа-яЁё]+)?$"
              value={registerForm.name}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, name: event.target.value }))
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
                setRegisterForm((current) => ({ ...current, login: event.target.value }))
              }
            />
          </div>
          <div className="input-group password-group">
            <input
              type={visiblePasswords.registerPassword ? 'text' : 'password'}
              id="reg-password"
              placeholder="Пароль"
              required
              minLength="4"
              value={registerForm.password}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <i
              className={`fa-solid ${visiblePasswords.registerPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
              onClick={() => togglePassword('registerPassword')}
            />
          </div>
          <div className="input-group password-group">
            <input
              type={visiblePasswords.confirmPassword ? 'text' : 'password'}
              id="reg-password-confirm"
              placeholder="Подтвердите пароль"
              required
              minLength="4"
              value={registerForm.confirmPassword}
              onChange={(event) =>
                setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
            />
            <i
              className={`fa-solid ${visiblePasswords.confirmPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
              onClick={() => togglePassword('confirmPassword')}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Зарегистрироваться
          </button>
        </form>
        <p>
          Уже есть аккаунт?{' '}
          <a
            href="#switch-to-login"
            onClick={(event) => {
              event.preventDefault();
              setMode('login');
            }}
          >
            Войти
          </a>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
