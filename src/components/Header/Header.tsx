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
                icon: <EditOutlined />,
                label: '編輯書籍資訊',
                onClick: onEdit,
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: '刪除',
                danger: true,
                onClick: onDelete,
              },
            ],
            style: {
              backgroundColor: '#1f1f1f',
            }
          }}
          trigger={['click']}
          placement="bottomRight"
          dropdownRender={(menu) => (
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
