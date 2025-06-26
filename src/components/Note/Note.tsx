import React, { useState } from 'react';
import { Button, Modal, Input } from 'antd';
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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editContent, setEditContent] = useState(content);

  return (
    <>
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
                  setEditContent(content);
                  setIsEditModalVisible(true);
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
      <Modal
        open={isEditModalVisible}
        width="calc(100vw - 40px)"
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditContent(content);
        }}
        onOk={() => {
          onEdit?.(editContent);
          setIsEditModalVisible(false);
        }}
        footer={[
          <Button 
            key="cancel" 
            type="text"
            onClick={() => {
              setIsEditModalVisible(false);
              setEditContent(content);
            }}
            className="modal-cancel-button"
          >
            取消
          </Button>,
          <Button 
            key="save" 
            type="text"
            onClick={() => {
              onEdit?.(editContent);
              setIsEditModalVisible(false);
            }}
            className="modal-save-button"
          >
            儲存
          </Button>
        ]}
        closable={false}
        centered
      >
        <Input.TextArea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          autoSize={{ minRows: 4 }}
          onClick={(e) => e.stopPropagation()}
        />
      </Modal>
    </>
  );
};

export default Note;
