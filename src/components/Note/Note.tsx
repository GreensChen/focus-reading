import React, { useState } from 'react';
import { Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface NoteProps {
  content: string;
  createdAt: string;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
}

const Note: React.FC<NoteProps> = ({ content, createdAt, onEdit, onDelete }) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div 
      className={`note-container ${isSelected ? 'note-selected' : ''}`}
      onClick={() => setIsSelected(!isSelected)}
    >
      <div className="note-wrapper">{content}</div>
      <div className="note-actions">
        {isSelected && (
          <div className="note-action-buttons">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(content);
              }}
            />
            <Button 
              type="text" 
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
            />
          </div>
        )}
        <div className="note-time">
          {dayjs(createdAt).format('YYYY.MM.DD HH:mm')}
        </div>
      </div>
    </div>
  );
};

export default Note;
