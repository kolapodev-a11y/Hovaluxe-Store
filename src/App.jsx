import { Route, Routes } from 'react-router-dom';
import { StorefrontPage } from './pages/StorefrontPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
