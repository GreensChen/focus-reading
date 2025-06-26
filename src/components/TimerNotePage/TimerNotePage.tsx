import React, { useState, useEffect } from 'react';
import { Layout, Button, Input } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircleOutlined, PauseCircleOutlined, RedoOutlined, LeftOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import { supabase } from '../../supabaseClient';
import './TimerNotePage.css';
import '../../styles/note.css';

const { Content } = Layout;
const { TextArea } = Input;

const TimerNotePage: React.FC = () => {
  const _navigate = useNavigate();
  const { bookId, minutes: initialMinutes } = useParams<{ bookId: string; minutes: string }>();
  const [timeLeft, setTimeLeft] = useState(parseInt(initialMinutes || '0') * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [noteContent, setNoteContent] = useState('');
const [notes, setNotes] = useState<{ id: string; book_id: string; content: string; duration_min: number; created_at: string }[]>([]);

useEffect(() => {
  // 重置滾動位置到頂部
  window.scrollTo(0, 0);

  if (bookId) {
    loadNotes();
  }
}, [bookId]);

  const loadNotes = async () => {
    if (!bookId) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('id, book_id, content, duration_min, created_at')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notes:', error);
        return;
      }

      setNotes(data || []);
    } catch (error) {
      console.error('Error in loadNotes:', error);
    }
  };

  const [bookTitle, setBookTitle] = useState('');
  const [startTime] = useState(Date.now());
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchBookInfo = async () => {
      if (bookId) {
        const { data } = await supabase
          .from('books')
          .select('title')
          .eq('id', bookId)
          .single();

        if (data) {
          setBookTitle(data.title);
        }
      }
    };

    fetchBookInfo();
  }, [bookId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      // 如果是從暫停狀態開始運行，記錄暫停的總時間
      if (pauseStartTime) {
        setTotalPausedTime(prev => prev + (Date.now() - pauseStartTime));
        setPauseStartTime(null);
      }

      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRunning, timeLeft, pauseStartTime]);

  const handlePlayPause = () => {
    if (isRunning) {
      // 暫停時記錄開始暫停的時間
      setPauseStartTime(Date.now());
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(parseInt(initialMinutes || '0') * 60);
  };

  const handleSaveNote = async () => {
    if (!bookId || !noteContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          book_id: bookId,
          content: noteContent.trim(),
          duration_min: 0
        })
        .select('id, book_id, content, duration_min, created_at')
        .single();

      if (error) {
        console.error('Error saving note:', error);
      } else if (data) {
        setNotes(prevNotes => [data, ...prevNotes]);
        setNoteContent('');
      }
    } catch (error) {
      console.error('Error in handleSaveNote:', error);
    }
  };

  const handleComplete = async () => {
    if (!bookId) return;

    setIsRunning(false);

    try {
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      let finalPausedTime = totalPausedTime;
      if (pauseStartTime) {
        finalPausedTime += (endTime - pauseStartTime);
      }

      const actualReadingTimeSeconds = Math.floor((totalTime - finalPausedTime) / 1000);

      const { data: currentBook, error: fetchError } = await supabase
        .from('books')
        .select('total_read_time')
        .eq('id', bookId)
        .single();

      if (fetchError) {
        console.error('Error fetching current reading time:', fetchError);
        return;
      }

      const newTotalTime = (currentBook?.total_read_time || 0) + actualReadingTimeSeconds;

      const { error: updateError } = await supabase
        .from('books')
        .update({ total_read_time: newTotalTime })
        .eq('id', bookId);

      if (updateError) {
        console.error('Error updating reading time:', updateError);
      }

      _navigate(`/book/${bookId}`);
    } catch (error) {
      console.error('Error in handleComplete:', error);
    }
  };

  return (
    <Layout className="timer-note-page">
      <Button
        className="back-button"
        type="text"
        icon={<LeftOutlined />}
        onClick={() => _navigate(-1)}      />
      <Content className="timer-note-content">
        <div className="timer-display">
          <div className="timer-title">{bookTitle}</div>
          <div className="time-text">{formatTime(timeLeft)}</div>
        </div>
        <div className="timer-controls">
          <Button
            className="timer-control-button"
            onClick={handleReset}
          >
            <RedoOutlined />
            <span className="timer-button-text">重置</span>
          </Button>
          <div className="timer-divider" />
          <Button
            className="timer-control-button"
            onClick={handlePlayPause}
          >
            {isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            <span className="timer-button-text">
              {isRunning ? '暫停' : '播放'}
            </span>
          </Button>
          <div className="timer-divider" />
          <Button
            className="timer-control-button"
            onClick={handleComplete}
          >
            <CheckCircleOutlined />
            <span className="timer-button-text">完成</span>
          </Button>
        </div>
        <div className="note-section">
          <TextArea
            placeholder="寫下你的閱讀筆記..."
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            autoSize={{ minRows: 6, maxRows: 10 }}
            className="note-textarea"
          />
          <div className="note-button-container">
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              className="send-note-button"
              onClick={handleSaveNote}
              disabled={!noteContent.trim()}
            />
            <div className="note-divider" />
            <div className="notes-section">
              {notes.length === 0 ? (
                <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: '16px' }}>
                  0 條筆記
                </div>
              ) : (
                <div className="notes-list">
                {notes.map(note => (
                  <div key={note.id} className="note-wrapper">
                    <div className="note-item">
                      <div className="note-content">{note.content}</div>
                    </div>
                    <div className="note-time">
                      {new Date(note.created_at).toLocaleString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }).replace(/\//g, '.').replace(' ', ' ')}
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default TimerNotePage;
