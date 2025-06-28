import React, { useState, useEffect } from 'react';
import { Layout, Spin, Button, Modal, message } from 'antd';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import { supabase } from '../../supabaseClient';
import type { Database } from '../../lib/database.types';
import Note from '../Note/Note';

import './ReadingPage.css';
import '../../styles/note.css';

interface Note {
  id: string;
  book_id: string;
  content: string;
  duration_min: number;
  created_at: string;
}

const { Content } = Layout;

const ReadingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookId: rawBookId } = useParams<{ bookId: string }>();
  const bookId = rawBookId?.trim();
  const [notes, setNotes] = useState<Note[]>([]);

  const handleEdit = () => {
    // TODO: 實現編輯書籍功能
    console.log('Edit book:', bookId);
  };

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!bookId) return;

    try {
      // 先刪除所有相關的筆記
      const { error: notesError } = await supabase
        .from('notes')
        .delete()
        .eq('book_id', bookId);

      if (notesError) throw notesError;

      // 然後刪除書籍
      const { error: bookError } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (bookError) throw bookError;

      message.success('書籍已刪除');
      // 導航回書架頁面
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting book:', error);
      message.error(error?.message || '刪除失敗，請稍後再試');
    } finally {
      setDeleteModalVisible(false);
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
      if (!bookId) return;

      try {
        setLoading(true);

        // 載入書籍資訊
        const bookResult = await fetchBook();
        if (!mounted) return;
        if (!bookResult) return;

        setBook(bookResult);
        await loadNotes();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [bookId]);

  return (
    <Layout className="reading-page">
      <Modal
        title={null}
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button 
            key="cancel" 
            type="text"
            onClick={() => setDeleteModalVisible(false)}
            className="modal-button"
          >
            取消
          </Button>,
          <Button 
            key="delete" 
            type="text"
            onClick={confirmDelete}
            className="modal-button delete"
          >
            刪除
          </Button>
        ]}
        className="delete-confirm-modal"
        centered
        closable={false}
      >
        <h3 className="modal-title">刪除書籍</h3>
        <p>確定要刪除這本書籍跟所有筆記嗎？</p>
      </Modal>
      <Content className="reading-page-content">
        <Header
          onBack={() => {
            const fromTimer = location.state && (location.state as { from: string }).from === 'timer';
            if (fromTimer) {
              navigate('/');
            } else {
              navigate(-1);
            }
          }}
          showMoreOptions
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <div className="reading-page-content">
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
              {book.cover_url && (
                <div className="book-cover">
                  <img src={book.cover_url} alt={book.title} />
                </div>
              )}
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
                      目前沒有筆記
                    </div>
                  ) : (
                    <div className="notes-list">
                      {notes.map((note) => (
                        <Note
                          key={note.id}
                          content={note.content}
                          createdAt={note.created_at}
                          onEdit={async (content) => {
                            try {
                              const { error } = await supabase
                                .from('notes')
                                .update({ content })
                                .eq('id', note.id);
                              
                              if (error) throw error;
                              await loadNotes();
                            } catch (error) {
                              console.error('Error updating note:', error);
                            }
                          }}
                          onDelete={async () => {
                            try {
                              const { error } = await supabase
                                .from('notes')
                                .delete()
                                .eq('id', note.id);
                              
                              if (error) throw error;
                              await loadNotes();
                            } catch (error) {
                              console.error('Error deleting note:', error);
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>


            </>
          ) : (
            <div>Book not found</div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ReadingPage;
