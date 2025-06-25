import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Environment variables:', {
  REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? '[EXISTS]' : '[MISSING]'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing:', {
    url: supabaseUrl,
    key: supabaseAnonKey ? '[HIDDEN]' : undefined
  });
  throw new Error('Supabase configuration is missing');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// 測試 Supabase 連接
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('count')
      .single();

    console.log('Supabase connection test:', {
      success: !error,
      error: error?.message,
      count: data?.count
    });
  } catch (err) {
    console.error('Supabase connection test failed:', err);
  }
};

testConnection();

// 書籍相關的型別定義
export interface Book {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  cover_url: string | null;
  total_read_minutes: number;
  created_at: string;
  notes_count: number;
}

// 筆記相關的型別定義
export interface Note {
  id: string;
  book_id: string;
  content: string;
  duration_min: number;
  created_at: string;
}
