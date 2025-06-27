import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { App as AntApp } from 'antd';
import Bookshelf from './components/Bookshelf/Bookshelf';
import ReadingPage from './components/ReadingPage/ReadingPage';
import TimerNotePage from './components/TimerNotePage/TimerNotePage';
import AddBookPage from './components/AddBookPage/AddBookPage';

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
          // Add your message configuration here
        }}
      >
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Bookshelf />} />
            <Route path="/book/:bookId" element={<ReadingPage />} />
            <Route path="/timer/:bookId/:minutes" element={<TimerNotePage />} />
            <Route path="/add-book" element={<AddBookPage />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
