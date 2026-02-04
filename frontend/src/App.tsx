import { Routes, Route } from 'react-router-dom';
import Login from './page/Login';
import Register from './page/Register';
import Homepage from './page/Homepage';

function App() {
  return (
    <div className="p-2 h-screen">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
