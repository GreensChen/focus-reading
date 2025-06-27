import React from 'react';
import { Layout, Card, Avatar, Empty, FloatButton, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Bookshelf.css';
import { useBooks } from '../../hooks/useBooks';

const { Header, Content } = Layout;

const Bookshelf: React.FC = () => {
  const navigate = useNavigate();
  const { books, loading } = useBooks();



  return (
    <Layout className="bookshelf-layout">
      <Header className="header">
        <div className="header-left">
          <h2>Focus on Reading</h2>
        </div>
        <div className="header-right">
          <Avatar className="profile-avatar" size={32}>C</Avatar>
        </div>
      </Header>
      <Content className="content">
        <div className="books-grid">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : books?.length === 0 ? (
            <Empty description="目前沒有書籍" />
          ) : (
            books?.map((book) => (
              <Card 
                key={book.id} 
                className="book-card" 
                variant="outlined"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                <div className="book-preview">
                  <div className="book-cover-container">
                    {book.cover_url && (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="book-cover"
                      />
                    )}
                  </div>
                  <div className="book-details">
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">{book.author}</div>
                    <div className="book-stats">
                      <div className="book-reading-time">
                        <span className="highlight">{Math.floor((book.total_read_time || 0) / 60)}</span> min | <span className="highlight">{book.notes_count || 0}</span> notes
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Content>
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        className="add-book-button"
        onClick={() => navigate('/add-book')}
      />
    </Layout>
  );
};

export default Bookshelf;
