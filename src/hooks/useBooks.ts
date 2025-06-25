import { useState, useEffect } from 'react';
import { supabase, Book } from '../lib/supabase';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 獲取所有書籍
  const fetchBooks = async () => {
    try {
      setLoading(true);
      console.log('Fetching books...');
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) throw error;
      if (data) {
        setBooks(data);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err instanceof Error ? err.message : '發生錯誤');
    } finally {
      // 設定固定的 loading 時間
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };

  // 測試用的新增書籍功能
  const addTestBooks = async () => {
    const testBooks = [
      {
        title: '深入淵出設計模式',
        author: 'Eric Freeman',
        publisher: 'O\'Reilly',
        cover_url: null
      },
      {
        title: '重構：改善既有程式的設計',
        author: 'Martin Fowler',
        publisher: 'Addison-Wesley',
        cover_url: null
      },
      {
        title: '無瑕的程式碼',
        author: 'Robert C. Martin',
        publisher: 'Prentice Hall',
        cover_url: null
      }
    ];

    try {
      for (const book of testBooks) {
        await addBook(book);
      }
      console.log('Test books added successfully');
    } catch (err) {
      console.error('Error adding test books:', err);
    }
  };

  // 在組件掛載時獲取資料
  useEffect(() => {
    const initializeBooks = async () => {
      console.log('Initializing books...');
      
      try {
        // 先檢查資料表是否存在
        const { data: tables, error: tablesError } = await supabase
          .from('books')
          .select('id')
          .limit(1);

        console.log('Tables check:', { tables, error: tablesError });

        if (tablesError) {
          console.error('Error checking tables:', tablesError);
          return;
        }

        // 獲取書籍資料
        await fetchBooks();

        // 檢查是否需要新增測試資料
        const { data: existingBooks, error: countError } = await supabase
          .from('books')
          .select('id');

        console.log('Existing books check:', {
          count: existingBooks?.length,
          error: countError
        });

        if (!existingBooks || existingBooks.length === 0) {
          console.log('No books found, adding test data...');
          await addTestBooks();
          await fetchBooks();
        }
      } catch (err) {
        console.error('Error in initializeBooks:', err);
      }
    };

    initializeBooks();
  }, []);

  // 新增書籍
  const addBook = async (bookData: Omit<Book, 'id' | 'created_at' | 'total_read_minutes' | 'notes_count'>) => {
    try {
      console.log('Adding book:', bookData);
      const { data, error } = await supabase
        .from('books')
        .insert([{ ...bookData, total_read_minutes: 0, notes_count: 0 }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error;
      }

      console.log('Book added successfully:', data);
      setBooks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '新增書籍時發生錯誤';
      console.error('Error details:', err);
      setError(errorMessage);
      throw err;
    }
  };

  // 更新書籍
  const updateBook = async (id: string, updates: Partial<Book>) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setBooks(prev => prev.map(book => book.id === id ? { ...book, ...data } : book));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新書籍時發生錯誤');
      throw err;
    }
  };

  // 刪除書籍
  const deleteBook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBooks(prev => prev.filter(book => book.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除書籍時發生錯誤');
      throw err;
    }
  };

  // 初始載入
  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    loading,
    error,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
  };
};
