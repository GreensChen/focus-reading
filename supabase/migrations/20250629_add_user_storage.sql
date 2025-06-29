-- Create a storage bucket for user files
INSERT INTO storage.buckets (id, name, public)
VALUES ('users', 'users', false);

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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update books table to ensure user_id is not null and create index
ALTER TABLE books 
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT books_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;
