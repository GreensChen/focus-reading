import React from 'react';
import { Layout, Card, Spin, Empty, Button } from 'antd';
import './Bookshelf.css';
import { useBooks } from '../../hooks/useBooks';

const { Header, Content } = Layout;

const Bookshelf: React.FC = () => {
  const { books, loading, error } = useBooks();

  if (error) {
    return (
      <div className="error-container">
        <Empty
          description={
            <span>
              載入失敗
            </span>
          }
        />
      </div>
    );
  }

  return (
    <Layout className="bookshelf-layout">
      <Header className="header">
        <div className="header-left">
          <h2>Focus Reading</h2>
        </div>
        <div className="header-right">
          <Button type="primary" ghost>新增書籍</Button>
        </div>
      </Header>
      <Content className="content">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <>
            {!loading && books?.length === 0 && (
              <Empty description="目前沒有書籍" />
            )}
            <div className="books-grid">
              {books?.map((book) => (
                <Card key={book.id} className="book-card" variant="outlined">
                  <div className="book-preview">
                    <div className="book-cover-container">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="book-cover"
                        />
                      ) : (
                        <div className="book-cover-placeholder">📚</div>
                      )}
                    </div>
                    <div className="book-details">
                      <div className="book-title">{book.title}</div>
                      <div className="book-author">{book.author}</div>
                      <div className="book-stats">
                        <div className="book-reading-time">
                          <span className="highlight">{book.total_read_minutes}</span> 分鐘 | <span className="highlight">{book.notes_count || 5}</span> 篇筆記
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </Content>
    </Layout>
  );
};

export default Bookshelf;
