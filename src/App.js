import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import Detail from './pages/Detail';
import Form from './pages/Form';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="top-nav">
          <Link to="/">Главная</Link>
          <Link to="/add?type=objects">Добавить объект</Link>
          <Link to="/add?type=personnel">Добавить сотрудника</Link>
          <Link to="/add?type=events">Добавить событие</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/add" element={<Form />} />
          <Route path="/edit/:id" element={<Form />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
