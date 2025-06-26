import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Bookshelf from './components/Bookshelf/Bookshelf';
import ReadingPage from './components/ReadingPage/ReadingPage';
import TimerNotePage from './components/TimerNotePage/TimerNotePage';

const ScrollToTop = () => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
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
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Bookshelf />} />
          <Route path="/book/:bookId" element={<ReadingPage />} />
          <Route path="/timer/:bookId/:minutes" element={<TimerNotePage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
