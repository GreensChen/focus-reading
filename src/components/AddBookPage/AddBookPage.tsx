import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Input, message } from 'antd';
import { PlusOutlined, LeftOutlined } from '@ant-design/icons';
import { supabase } from '../../supabaseClient';
import './AddBookPage.css';

import { BookFormData } from '../../types/book';

interface AddBookPageProps {
  bookData?: BookFormData;
  onSuccess?: () => void;
}

const AddBookPage: React.FC<AddBookPageProps> = ({ bookData, onSuccess }) => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    // 如果有 bookData，則使用它初始化表單
    if (bookData) {
      form.setFieldsValue({
        title: bookData.title,
        author: bookData.author,
        publisher: bookData.publisher
      });
      if (bookData.cover_url) {
        setPreviewUrl(bookData.cover_url);
      }
      return;
    }

    // 如果有 bookId，則從服務器加載數據
    if (!bookId) {
      return;
    }

    const loadBookData = async () => {
      try {
        const { data: book, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', bookId)
          .single();

        if (error) {
          console.error('Error loading book:', error);
          message.error('載入書籍資料失敗');
          navigate('/');
          return;
        }

        if (book) {
          form.setFieldsValue({
            title: book.title,
            author: book.author,
            publisher: book.publisher
          });
          setPreviewUrl(book.cover_url || '');
        }
      } catch (error) {
        console.error('Error loading book:', error);
        message.error('載入書籍資料失敗');
        navigate('/');
      }
    };

    loadBookData();
  }, [bookId, bookData, form, navigate]);

  const handleSubmit = async (values: BookFormData) => {
    try {
      setLoading(true);
      let cover_url = null;
      
      // 上傳封面到 Storage
      if (values.cover_file) {
        try {
          const file = values.cover_file;
          // 確保副檔名為 jpg
          const fileExt = file.name.split('.').pop()?.toLowerCase();
          if (fileExt !== 'jpg' && fileExt !== 'jpeg') {
            message.error('只能上傳 JPG 格式的圖片');
            setLoading(false);
            return;
          }
          const fileName = `${Math.random()}.jpg`;
          const filePath = `ljx2ne_0/${fileName}`;
          
          // 先將圖片轉換為 Blob
          const blob = await new Promise<Blob>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const blob = new Blob([reader.result as ArrayBuffer], { type: 'image/jpeg' });
              resolve(blob);
            };
            reader.readAsArrayBuffer(file);
          });

          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('books')
            .upload(filePath, blob, {
              contentType: 'image/jpeg',
              upsert: true
            });
            
          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            if (uploadError.message.includes('storage/bucket-not-found')) {
              message.error('儲存空間未設定，請聯繫管理員');
            } else if (uploadError.message.includes('Unauthorized')) {
              message.error('儲存空間權限不足，請聯繫管理員');
            } else {
              message.error(`上傳封面失敗: ${uploadError.message}`);
            }
            setLoading(false);
            return;
          }
          
          if (!uploadData) {
            message.error('上傳封面失敗，請稍後再試');
            setLoading(false);
            return;
          }

          // 獲取檔案的公開 URL
          const { data: { publicUrl } } = supabase.storage
            .from('books')
            .getPublicUrl(filePath);
            
          cover_url = publicUrl;
        } catch (error: any) {
          console.error('File upload error:', error);
          message.error('上傳封面時發生錯誤');
          setLoading(false);
          return;
        }
      }
      
      try {
        // 新增或更新書籍
        const query = bookData?.id
          ? supabase
              .from('books')
              .update({
                title: values.title,
                author: values.author,
                publisher: values.publisher,
                cover_url: cover_url || bookData.cover_url,
                updated_at: new Date().toISOString()
              })
              .eq('id', bookData.id)
          : supabase
              .from('books')
              .insert([{
                title: values.title,
                author: values.author,
                publisher: values.publisher,
                cover_url,
                total_read_time: 0,
                created_at: new Date().toISOString()
              }
              ])
              .select();
          
        const { error, data } = await query;
        
        if (error) {
          console.error('Supabase error:', error);
          if (error.message.includes('security policy')) {
            message.error('正在設定資料庫權限，請稍後再試');
          } else {
            message.error(`新增書籍失敗: ${error.message}`);
          }
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          message.error('新增書籍失敗，請稍後再試');
          setLoading(false);
          return;
        }
      } catch (dbError: any) {
        console.error('Database error:', dbError);
        message.error('資料庫操作失敗，請稍後再試');
        setLoading(false);
        return;
      }
      
      message.success(bookData?.id ? '更新成功' : '新增成功');
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error adding book:', error);
      message.error('系統錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-book-page">
      <div className="header">
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => bookId ? navigate(`/book/${bookId}`) : navigate('/')}
            className="back-button"
          />
      </div>
      <div className="content">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="book-form"
        >
          <Form.Item
            name="title"
            label="書名"
            required={false}
            rules={[{ required: true, message: '請輸入書名' }]}
          >
            <Input placeholder="請輸入書名" />
          </Form.Item>
          
          <Form.Item
            name="author"
            label="作者"
            required={false}
            rules={[{ required: true, message: '請輸入作者' }]}
          >
            <Input placeholder="請輸入作者名稱" />
          </Form.Item>
          
          <Form.Item
            name="publisher"
            label="出版社"
            required={false}
            rules={[{ required: true, message: '請輸入出版社' }]}
          >
            <Input placeholder="請輸入出版社名稱" />
          </Form.Item>
          
          <Form.Item
            name="cover_file"
            label="書籍封面"
            valuePropName="file"
            getValueFromEvent={(e) => e?.file?.originFileObj}
          >
            <div className="cover-upload">
              <input
                type="file"
                accept="image/jpeg"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    form.setFieldValue('cover_file', file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                id="cover-upload-input"
              />
              {previewUrl ? (
                <div className="cover-preview">
                  <img src={previewUrl} alt="Cover preview" />
                  <div 
                    className="delete-button"
                    onClick={() => {
                      form.setFieldValue('cover_file', undefined);
                      setPreviewUrl('');
                      const input = document.getElementById('cover-upload-input') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                  >
                    <span style={{ fontSize: 12, color: '#fff' }}>✕</span>
                  </div>
                </div>
              ) : (
                <label htmlFor="cover-upload-input" className="upload-button">
                  <PlusOutlined style={{ fontSize: 24 }} />
                </label>
              )}
            </div>
          </Form.Item>

          <Form.Item shouldUpdate className="submit-button-container">
            {() => {
              const title = form.getFieldValue('title');
              const author = form.getFieldValue('author');
              const publisher = form.getFieldValue('publisher');
              const isValid = title && author && publisher;

              return (
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  loading={loading}
                  disabled={!isValid}
                  className="submit-button"
                  block
                >
                  {bookId ? '更新' : '新增'}
                </Button>
              );
            }}
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddBookPage;
