-- Add user_id column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for user_id
CREATE INDEX IF NOT EXISTS books_user_id_idx ON books(user_id);

-- Add RLS policies for books table
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own books"
  ON books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON books FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('users', 'users', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for the users bucket
CREATE POLICY "Users can access their own folder"
  ON storage.objects FOR ALL
  USING (bucket_id = 'users' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'users' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create a function to automatically create user folder when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create a folder for the new user in the users bucket
  INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES ('users', NEW.id || '/', NEW.id, '{"isFolder": true}');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
