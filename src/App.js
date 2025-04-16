// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import ProductsPage from './ProductsPage';
import ContactPage from './ContactPage';
import AddQuestionPage from './AddQuestionPage';
import EditQuestionsPage from './EditQuestionsPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('تم تسجيل الخروج بنجاح!');
    } catch (error) {
      alert('خطأ أثناء تسجيل الخروج: ' + error.message);
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) setSearchTerm('');
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="logo">
            <h1>إدارة الأسئلة</h1>
            <h2>اختبار رياضيات</h2>
          </div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/contact">Contact</Link>
            <div className="search-container">
              <button onClick={toggleSearch} className="search-icon">🔍</button>
              {showSearch && (
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن سؤال أو محتوى..."
                  className="search-input"
                />
              )}
            </div>
            {user ? (
              <button onClick={handleLogout} className="logout-btn">
                تسجيل الخروج
              </button>
            ) : (
              <Link to="/login" className="login-btn">تسجيل الدخول</Link>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={user ? <HomePage user={user} searchTerm={searchTerm} /> : <Navigate to="/login" />}
          />
          <Route
            path="/products"
            element={user ? <ProductsPage user={user} searchTerm={searchTerm} /> : <Navigate to="/login" />}
          />
          <Route
            path="/contact"
            element={user ? <ContactPage user={user} searchTerm={searchTerm} /> : <Navigate to="/login" />}
          />
          <Route
            path="/add-question"
            element={user ? <AddQuestionPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/edit-questions"
            element={user ? <EditQuestionsPage searchTerm={searchTerm} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;