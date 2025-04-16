// src/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

function LoginPage() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignInClick = () => {
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('فشل تسجيل الدخول. تحقق من الإيميل وكلمة المرور.');
    }
  };

  return (
    <div className="login-page">
      <div className="content">
        <h1>نظام إدارة الأسئلة</h1>
        <p>اختبارات الرياضيات بطريقة سهلة ومنظمة</p>
        {!showForm ? (
          <button onClick={handleSignInClick} className="sign-in-btn">
            تسجيل الدخول
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="الإيميل"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              required
            />
            <button type="submit">Sign in</button>
            {error && <p className="error">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;