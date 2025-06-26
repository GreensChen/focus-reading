import React, { useState, useEffect } from 'react';
import { Layout, Button, Spin, Modal, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import { supabase } from '../../supabaseClient';
import type { Database } from '../../lib/database.types';

import './ReadingPage.css';
import '../../styles/note.css';

interface Note {
  id: string;
  book_id: string;
  content: string;
  duration_min: number;
  created_at: string;
}

interface ActionModalProps {
  visible: boolean;
  _note: Note | null;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ visible, _note, onEdit, onDelete, onCancel }) => (
  <Modal
    open={visible}
    footer={null}
    onCancel={onCancel}
    centered
    closable={false}
    width={200}
    modalRender={(_modal) => (
      <div style={{
        backgroundColor: '#141414',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button 
            type="text"
            icon={<EditOutlined />} 
            onClick={onEdit}
            style={{ height: '40px', color: '#fff', textAlign: 'left', padding: '8px' }}
          >
            編輯
          </Button>
          <Button 
            type="text"
            icon={<DeleteOutlined />} 
            onClick={onDelete}
            danger
            style={{ height: '40px', textAlign: 'left', padding: '8px' }}
          >
            刪除
          </Button>
          <Button 
            type="text"
            icon={<CloseOutlined />} 
            onClick={onCancel}
            style={{ height: '40px', color: '#fff', textAlign: 'left', padding: '8px' }}
          >
            取消
          </Button>
        </div>
      </div>
    )}
    styles={{
      mask: {
        backgroundColor: 'rgba(0, 0, 0, 0.45)'
      },
      content: {
        boxShadow: 'none',
        backgroundColor: 'transparent'
      }
    }}
  />
);

const { Content } = Layout;
const { TextArea } = Input;

const ReadingPage: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const navigate = useNavigate();
  const { bookId: rawBookId } = useParams<{ bookId: string }>();
  const bookId = rawBookId?.trim();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (bookId) {
      loadNotes();
    }
  }, [bookId]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsActionModalVisible(true);
  };

  const handleEdit = () => {
    setIsActionModalVisible(false);
    setEditedContent(selectedNote?.content || '');
    setIsEditModalVisible(true);
  };

  const handleDelete = () => {
    setIsActionModalVisible(false);
    setIsDeleteModalVisible(true);
  };

  const handleEditConfirm = async () => {
    if (!selectedNote || !editedContent.trim()) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({ content: editedContent.trim() })
        .eq('id', selectedNote.id);

      if (error) {
        console.error('Error updating note:', error);
        return;
      }

      loadNotes();
      setIsEditModalVisible(false);
      setSelectedNote(null);
    } catch (error) {
      console.error('Error in handleEditConfirm:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNote) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', selectedNote.id);

      if (error) {
        console.error('Error deleting note:', error);
        message.error('刪除筆記失敗，請稍後再試');
        return;
      }

      setNotes(prevNotes => prevNotes.filter(note => note.id !== selectedNote.id));
      setIsDeleteModalVisible(false);
      setSelectedNote(null);
      message.success('筆記已刪除');
    } catch (error) {
      console.error('Error in handleDeleteConfirm:', error);
      message.error('刪除筆記失敗，請稍後再試');
    }
  };

  const loadNotes = async () => {
    if (!bookId) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('id, book_id, content, duration_min, created_at')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notes:', error);
        return;
      }

      setNotes(data || []);
    } catch (error) {
      console.error('Error in loadNotes:', error);
    }
  };

  const [book, setBook] = useState<Database['public']['Tables']['books']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);


  const fetchBook = async () => {
    console.log('Fetching book with ID:', bookId);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
    
    console.log('Found book:', data);
    return data;
  };

  useEffect(() => {
    let mounted = true;

    // 重置滾動位置到頂部
    window.scrollTo(0, 0);

    const loadData = async () => {
      console.log('=== loadData start ===');
      if (!bookId) {
        console.log('No bookId provided');
        return;
      }

      try {
        setLoading(true);
        console.log('Loading data for bookId:', bookId);

        // 先單獨獲取書籍信息
        const bookResult = await fetchBook();
        console.log('Book fetch result:', bookResult);

        if (!mounted) {
          console.log('Component unmounted, stopping');
          return;
        }

        if (!bookResult) {
          console.warn('Book not found');
          return;
        }

        // 設置書籍信息
        setBook(bookResult);

        console.log('Data loaded successfully:', {
          book: bookResult,
        });
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (mounted) {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
      console.log('=== loadData end ===');
    };

    loadData();

    return () => {
      mounted = false;
      console.log('Component cleanup');
    };
  }, [bookId]);

  return (
    <Layout className="reading-page">
      <Button 
        type="text" 
        icon={<LeftOutlined />} 
        className="back-button"
        onClick={() => navigate('/')}
      />
      <Content className="timer-note-content">
        {loading ? (
          <Spin size="large" />
        ) : book ? (
          <>
            <div className="timer-display">
              <div className="timer-title">累計閱讀時間</div>
              <div className="time-text">
                {`${Math.floor((book.total_read_time || 0) / 60)}:${((book.total_read_time || 0) % 60).toString().padStart(2, '0')}`}
              </div>
            </div>
            <div className="book-cover">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} />
              ) : (
                <span className="book-cover-placeholder">📚</span>
              )}
            </div>
            <div className="book-info">
              <h2 className="book-title">{book.title}</h2>
              <p className="book-author">{book.author}</p>
              <p className="book-publisher">{book.publisher}</p>
            </div>
            <div className="time-selection">
              <div className="time-buttons">
                {[15, 30, 45, 60].map((minutes, index) => (
                  <React.Fragment key={minutes}>
                    {index > 0 && <div className="time-divider" />}
                    <Button
                      className="time-select-button"
                      onClick={() => navigate(`/timer/${bookId}/${minutes}`)}
                    >
                      <span className="time-number">{minutes}</span>
                      <span className="time-unit">min</span>
                    </Button>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="note-button-container">
              <div className="note-divider" />
              <div className="notes-section">
                {notes.length === 0 ? (
                  <div style={{ 
                  color: 'rgba(255, 255, 255, 0.65)', 
                  marginBottom: '16px',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  {notes.length === 0 ? '目前沒有筆記' : `${notes.length} 條筆記`}
                </div>
                ) : (
                  <div className="notes-list">
                    {notes.map(note => (
                      <div key={note.id} className="note-wrapper">
                        <div className="note-item" onClick={() => handleNoteClick(note)}>
                          <div className="note-content">{note.content}</div>
                        </div>
                        <div className="note-time">
                          {new Date(note.created_at).toLocaleString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          }).replace(/\//g, '.').replace(' ', ' ')}
                        </div>
                      </div>
                    ))}

                    <ActionModal
                      visible={isActionModalVisible}
                      _note={selectedNote}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onCancel={() => {
                        setIsActionModalVisible(false);
                        setSelectedNote(null);
                      }}
                    />

                    <Modal
                      title="編輯筆記"
                      open={isEditModalVisible}
                      onOk={handleEditConfirm}
                      onCancel={() => {
                        setIsEditModalVisible(false);
                        setSelectedNote(null);
                      }}
                      okText="確認"
                      cancelText="取消"
                      centered
                    >
                      <TextArea
                        value={editedContent}
                        onChange={e => setEditedContent(e.target.value)}
                        placeholder="請輸入筆記內容"
                        autoSize={{ minRows: 3, maxRows: 6 }}
                      />
                    </Modal>

                    <Modal
                      title="刪除筆記"
                      open={isDeleteModalVisible}
                      onOk={handleDeleteConfirm}
                      onCancel={() => {
                        setIsDeleteModalVisible(false);
                        setSelectedNote(null);
                      }}
                      okText="刪除"
                      cancelText="取消"
                      centered
                      okButtonProps={{ danger: true }}
                    >
                      <p>確定要刪除這條筆記嗎？此操作無法復原。</p>
                    </Modal>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div>Book not found</div>
        )}
      </Content>
    </Layout>
  );
};

export default ReadingPage;
