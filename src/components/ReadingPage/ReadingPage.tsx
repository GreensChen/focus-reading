import React, { useState, useEffect } from 'react';
import { Layout, Button, Spin, Card } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import { supabase } from '../../supabaseClient';
import type { Database } from '../../lib/database.types';
import dayjs from 'dayjs';
import './ReadingPage.css';

const { Content } = Layout;

const ReadingPage: React.FC = () => {
  console.log('=== Reading Page Mounted ===');
  const navigate = useNavigate();
  const { bookId: rawBookId } = useParams<{ bookId: string }>();
  // 使用從 URL 獲取的 bookId，如果沒有則使用一個測試 ID
  const bookId = rawBookId?.trim();
  
  console.log('Reading page rendered with:', {
    rawBookId,
    bookId,
    isTestId: !rawBookId && bookId === '06e470b5-6348-4cc2-8cc5-c8f98725596b'
  });
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

  const fetchNotes = async () => {
    console.log('=== fetchNotes start ===');
    console.log('Fetching notes with bookId:', bookId);
    console.log('BookId type:', typeof bookId);
    console.log('BookId length:', bookId?.length);
    
    try {
      // 檢查 bookId 是否為有效的 UUID
      if (!bookId || bookId.length !== 36) {
        console.error('Invalid bookId:', bookId);
        return [];
      }

      console.log('Starting Supabase query...');
      // 先測試直接查詢
      const testQuery = await supabase
        .from('notes')
        .select('count')
        .eq('book_id', bookId);
      
      console.log('Test query result:', testQuery);

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Error fetching notes: ${error.message}`);
      }

      console.log('Raw Supabase response:', { data, error });
      console.log('Notes fetch result:', {
        success: true,
        count: data?.length || 0,
        notes: data
      });
      console.log('=== fetchNotes end ===');

      return data || [];
    } catch (error) {
      console.error('Exception fetching notes:', error);
      throw error;
    }
  };

  const [notes, setNotes] = useState<Database['public']['Tables']['notes']['Row'][]>([]);

  useEffect(() => {
    let mounted = true;

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

        // 然後獲取筆記
        const notesResult = await fetchNotes();
        console.log('Notes fetch completed:', notesResult);

        if (!mounted) {
          console.log('Component unmounted, stopping');
          return;
        }

        console.log('Setting notes:', notesResult);
        setNotes(notesResult);

        console.log('Data loaded successfully:', {
          book: bookResult,
          notesCount: notesResult.length,
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
        onClick={() => navigate(-1)}
      />
      <Content className="reading-content">
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
              <p className="time-selection-title">繼續閱讀</p>
            </div>
            <div className="notes-list">
              {(() => {
                console.log('=== Render Debug ===');
                console.log('Component state:', {
                  loading,
                  bookId,
                  notesLength: notes?.length,
                  notes,
                  book
                });
                return null;
              })()} 
              {loading ? (
                <div style={{ color: 'rgba(255, 255, 255, 0.45)', textAlign: 'center', padding: '20px' }}>
                  載入中...
                </div>
              ) : notes && notes.length > 0 ? (
                <>
                  <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: '16px' }}>
                    共 {notes.length} 條筆記
                  </div>
                  {notes.map((note) => {
                    console.log('Rendering note:', {
                      id: note.id,
                      book_id: note.book_id,
                      content: note.content,
                      created_at: note.created_at
                    });
                    return (
                      <Card key={note.id} className="note-card">
                        <div className="note-content">{note.content}</div>
                        <div className="note-time">
                          {dayjs(note.created_at).format('YYYY/MM/DD HH:mm')}
                        </div>
                      </Card>
                    );
                  })}
                </>
              ) : (
                <div style={{ color: 'rgba(255, 255, 255, 0.45)', textAlign: 'center', padding: '20px' }}>
                  0 條筆記
                  {(() => { console.log('No notes found for bookId:', bookId); return null; })()} 
                </div>
              )}
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
