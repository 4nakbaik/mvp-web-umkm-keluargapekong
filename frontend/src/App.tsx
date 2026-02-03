import { Routes, Route } from 'react-router-dom';
import Login from './page/Login';
import Register from './page/Register';
import Homepage from './page/Homepage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
