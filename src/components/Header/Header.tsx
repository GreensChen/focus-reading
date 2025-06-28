import React from 'react';
import { Button, Dropdown } from 'antd';
import { LeftOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './Header.css';

interface HeaderProps {
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showMoreOptions?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onBack, 
  onEdit, 
  onDelete, 
  showMoreOptions = false 
}) => {
  return (
    <div className="header">
      <Button
        type="text"
        icon={<LeftOutlined />}
        onClick={onBack}
        className="back-button"
      />
      {showMoreOptions && (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined style={{ color: '#fff' }} />,
                label: '編輯資訊',
                onClick: onEdit,
                style: { color: '#fff' }
              },
              {
                key: 'delete',
                icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                label: '刪除',
                danger: true,
                onClick: onDelete,
                style: { color: '#ff4d4f' }
              },
            ],
            style: {
              backgroundColor: '#1f1f1f',
              color: '#fff'
            }
          }}
          trigger={['click']}
          placement="bottomRight"
          popupRender={(menu) => (
            <div style={{ 
              backgroundColor: '#1f1f1f', 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              borderRadius: '4px'
            }}>
              {menu}
            </div>
          )}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="more-options-button"
          />
        </Dropdown>
      )}
    </div>
  );
};

export default Header;
