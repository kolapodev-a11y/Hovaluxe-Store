import { Route, Routes } from 'react-router-dom';
import { StorefrontPage } from './pages/StorefrontPage';
import { AdminPage } from './pages/AdminPage';
import { PaymentCallbackPage } from './pages/PaymentCallbackPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/payment/callback" element={<PaymentCallbackPage />} />
    </Routes>
  );
}

export default App;
