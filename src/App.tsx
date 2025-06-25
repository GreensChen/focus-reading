import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Bookshelf from './components/Bookshelf/Bookshelf';
import { ConfigProvider, theme } from 'antd';

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00D4AA',
        },
      }}
    >
      <Router>
        <Bookshelf />
      </Router>
    </ConfigProvider>
  );
}

export default App;
