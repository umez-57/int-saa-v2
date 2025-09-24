-- Create storage bucket for audio recordings
insert into storage.buckets (id, name, public)
values ('interview-audio', 'interview-audio', false);

-- Create policy for authenticated users to upload their own audio
create policy "Users can upload their own audio files"
on storage.objects for insert
with check (
  bucket_id = 'interview-audio' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to view their own audio files
create policy "Users can view their own audio files"
on storage.objects for select
using (
  bucket_id = 'interview-audio' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to delete their own audio files
create policy "Users can delete their own audio files"
on storage.objects for delete
using (
  bucket_id = 'interview-audio' 
  and auth.uid()::text = (storage.foldername(name))[1]
);
