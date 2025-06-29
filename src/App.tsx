import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { App as AntApp } from 'antd';
import Bookshelf from './components/Bookshelf/Bookshelf';
import ReadingPage from './components/ReadingPage/ReadingPage';
import TimerNotePage from './components/TimerNotePage/TimerNotePage';
import AddBookPage from './components/AddBookPage/AddBookPage';
import EditBookPage from './components/EditBookPage/EditBookPage';
import LoginPage from './components/LoginPage/LoginPage';
import CreateAccountPage from './components/CreateAccountPage/CreateAccountPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const ScrollToTop = () => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00D4AA',
        },
      }}
    >
      <AntApp
        message={{
          maxCount: 3,
          duration: 2,
          top: 24
        }}
      >
        <div className="app-container">
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/create-account" element={<CreateAccountPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Bookshelf />
                </ProtectedRoute>
              } />
              <Route path="/book/:bookId" element={
                <ProtectedRoute>
                  <ReadingPage />
                </ProtectedRoute>
              } />
              <Route path="/book/:bookId/edit" element={
                <ProtectedRoute>
                  <EditBookPage bookData={undefined} />
                </ProtectedRoute>
              } />
              <Route path="/timer/:bookId/:minutes" element={
                <ProtectedRoute>
                  <TimerNotePage />
                </ProtectedRoute>
              } />
              <Route path="/add-book" element={
                <ProtectedRoute>
                  <AddBookPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        </div>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
