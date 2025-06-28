import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Input, message, Spin } from 'antd';
import { PlusOutlined, LeftOutlined } from '@ant-design/icons';
import { supabase } from '../../supabaseClient';
import './EditBookPage.css';

interface BookFormData {
  title: string;
  author: string;
  publisher: string;
  cover_file?: File;
}

const EditBookPage: React.FC = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');
  const [initialValues, setInitialValues] = useState<BookFormData | null>(null);

  useEffect(() => {
    if (!bookId) {
      navigate('/');
      return;
    }

    const loadBookData = async () => {
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
        const values = {
          title: book.title,
          author: book.author,
          publisher: book.publisher
        };
        form.setFieldsValue(values);
        setInitialValues(values);
        setPreviewUrl(book.cover_url || '');
      }
      setInitializing(false);
    };

    loadBookData();
  }, [bookId, form, navigate]);

  const handleSubmit = async (values: BookFormData) => {
    if (!bookId) return;
    
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
        // 更新書籍
        const { error } = await supabase
          .from('books')
          .update({
            title: values.title,
            author: values.author,
            publisher: values.publisher,
            cover_url: cover_url || previewUrl
          })
          .eq('id', bookId);
          
        if (error) {
          console.error('Supabase error:', error);
          if (error.message.includes('security policy')) {
            message.error('權限不足，請重新登入');
          } else {
            message.error(`更新失敗: ${error.message}`);
          }
          setLoading(false);
          return;
        }
      } catch (error: any) {
        console.error('Error updating book:', error);
        message.error('系統錯誤，請稍後再試');
        setLoading(false);
        return;
      }
      
      message.success('更新成功');
      navigate(`/book/${bookId}`, { replace: true });
    } catch (error: any) {
      console.error('Error updating book:', error);
      message.error('系統錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="edit-book-page">
      <div className="header">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate(`/book/${bookId}`, { replace: true })}
          className="back-button"
        />
      </div>
      <div className="content">
        {initializing ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            className="book-form"
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="title"
              label="書名"
              rules={[{ required: true, message: '請輸入書名' }]}
            >
              <Input placeholder="請輸入書名" />
            </Form.Item>

            <Form.Item
              name="author"
              label="作者"
              rules={[{ required: true, message: '請輸入作者' }]}
            >
              <Input placeholder="請輸入作者名稱" />
            </Form.Item>

          <Form.Item
            name="publisher"
            label="出版社"
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
              const currentValues = form.getFieldsValue();
              const hasChanged = initialValues && (
                currentValues.title !== initialValues.title ||
                currentValues.author !== initialValues.author ||
                currentValues.publisher !== initialValues.publisher ||
                form.getFieldValue('cover_file')
              );
              const isValid = currentValues.title && currentValues.author && currentValues.publisher;

              return (
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  loading={loading}
                  disabled={!isValid || !hasChanged}
                  className="submit-button"
                  block
                >
                  更新
                </Button>
              );
            }}
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default EditBookPage;
