import { Route, Routes } from 'react-router-dom';
import { StorefrontPage } from './pages/StorefrontPage';
import { AdminPage } from './pages/AdminPage';
import { PaymentCallbackPage } from './pages/PaymentCallbackPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { WishlistPage } from './pages/WishlistPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/transactions" element={<TransactionHistoryPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/payment/callback" element={<PaymentCallbackPage />} />
    </Routes>
  );
}

export default App;
