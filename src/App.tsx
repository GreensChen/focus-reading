import React from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Bookshelf from './components/Bookshelf/Bookshelf';
import ReadingPage from './components/ReadingPage/ReadingPage';
import TimerNotePage from './components/TimerNotePage/TimerNotePage';

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
