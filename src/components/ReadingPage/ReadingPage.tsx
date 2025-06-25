import React, { useState, useEffect } from 'react';
import { Layout, Button, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import { supabase, Book } from '../../lib/supabase';
import './ReadingPage.css';

const { Content } = Layout;

const ReadingPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data: bookData, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', bookId)
          .single();

        if (error) throw error;
        setBook(bookData);
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
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
            <div className={`timer-circle gradient-${book.gradient || 'green'}`}>
              <span className="timer-text">{book.total_read_minutes || 0}:00</span>
            </div>
            <div className="book-info">
              <h2 className="book-title">{book.title}</h2>
              <p className="book-author">{book.author}</p>
              <p className="book-publisher">{book.publisher}</p>
            </div>
            <div className="time-selection">
              <div className="time-selection-title">繼續閱讀</div>
              <div className="time-buttons">
                {[15, 30, 45, 60].map((minutes, index) => (
                  <React.Fragment key={minutes}>
                    {index > 0 && <div className="time-divider" />}
                    <Button
                      type="default"
                      className="time-select-button"
                      onClick={() => {
                        // TODO: 導航到計時頁面
                        console.log(`Selected ${minutes} minutes`);
                      }}
                    >
                      <span className="time-number">{minutes}</span>
                      <span className="time-unit">min</span>
                    </Button>
                  </React.Fragment>
                ))}
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
