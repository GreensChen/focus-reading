import React, { useState, useEffect } from 'react';
import { Layout, Button, Spin } from 'antd';
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

const { Content } = Layout;

const ReadingPage: React.FC = () => {
  const _navigate = useNavigate();
  const { bookId: rawBookId } = useParams<{ bookId: string }>();
  const bookId = rawBookId?.trim();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (bookId) {
      loadNotes();
    }
  }, [bookId]);

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
        onClick={() => _navigate('/')}
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
                      onClick={() => _navigate(`/timer/${bookId}/${minutes}`)}
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
                    沒有筆記
                  </div>
                ) : (
                  <div className="notes-list">
                    {notes.map(note => (
                      <div key={note.id} className="note-wrapper">
                        <div className="note-item">
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
