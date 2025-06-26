import React from 'react';
import { Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import './Header.css';

interface HeaderProps {
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
  return (
    <div className="header">
      <Button
        type="text"
        icon={<LeftOutlined />}
        onClick={onBack}
        className="back-button"
      />
    </div>
  );
};

export default Header;
