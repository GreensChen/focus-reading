import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Database } from '../lib/database.types';
import { useAuth } from './useAuth';

type Book = Database['public']['Tables']['books']['Row'];

export const useBooks = () => {
  const { user } = useAuth();
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
        .select(`
          *,
          notes_count:notes(count)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) throw error;
      if (data) {
        // 處理返回的數據，將 notes_count 從 { count: number } 轉換為 number
        const processedData = data.map(book => ({
          ...book,
          notes_count: book.notes_count?.[0]?.count || 0
        }));
        setBooks(processedData);
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



  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  // 新增書籍
  const addBook = async (bookData: Omit<Book, 'id' | 'created_at' | 'total_read_time' | 'notes_count'>) => {
    try {
      console.log('Adding book:', bookData);
      const { data, error } = await supabase
        .from('books')
        .insert([{ ...bookData, total_read_time: 0, notes_count: 0 }])
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
