export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          title: string;
          author: string | null;
          publisher: string | null;
          cover_url: string | null;
          total_read_time: number;
          notes_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author?: string | null;
          publisher?: string | null;
          cover_url?: string | null;
          total_read_time?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string | null;
          publisher?: string | null;
          cover_url?: string | null;
          total_read_time?: number;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          book_id: string;
          content: string;
          duration_min: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          content: string;
          duration_min: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          content?: string;
          duration_min?: number;
          created_at?: string;
        };
      };
    };
  };
}
