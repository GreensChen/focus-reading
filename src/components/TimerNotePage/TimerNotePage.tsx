import React, { useState, useEffect } from 'react';
import { Layout, Button, Input } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircleOutlined, PauseCircleOutlined, RedoOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';
import Header from '../Header/Header';
import { supabase } from '../../supabaseClient';
import Note from '../Note/Note';
import './TimerNotePage.css';
import '../../styles/note.css';

const { Content } = Layout;
const { TextArea } = Input;

interface Note {
  id: string;
  book_id: string;
  content: string;
  duration_min: number;
  created_at: string;
}

const TimerNotePage: React.FC = () => {
  const [bookTitle, setBookTitle] = useState('');
  const _navigate = useNavigate();
  const { bookId, minutes: initialMinutes } = useParams<{ bookId: string; minutes: string }>();
  const [timeLeft, setTimeLeft] = useState(parseInt(initialMinutes || '0') * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [startTime] = useState(Date.now());
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [_timer, _setTimer] = useState<NodeJS.Timeout | null>(null);

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
    let intervalTimer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      // 如果是從暫停狀態開始運行，記錄暫停的總時間
      if (pauseStartTime) {
        setTotalPausedTime(prev => prev + (Date.now() - pauseStartTime));
        setPauseStartTime(null);
      }

      intervalTimer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      _setTimer(intervalTimer);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (intervalTimer) {
        clearInterval(intervalTimer);
        _setTimer(null);
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
          duration_min: 0 // 發送筆記時不計入閱讀時間
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

    // 停止計時器
    setIsRunning(false);

    try {
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      // 計算最終暫停時間
      let finalPausedTime = totalPausedTime;
      if (pauseStartTime) {
        finalPausedTime += (endTime - pauseStartTime);
      }
      
      const actualReadingTimeSeconds = Math.floor((totalTime - finalPausedTime) / 1000);

      // 先獲取當前的閱讀時間
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
      console.log('Updating total time:', {
        currentTime: currentBook?.total_read_time || 0,
        actualReadingTimeSeconds,
        newTotalTime
      });

      // 更新書籍的閱讀時間
      const { error: updateError } = await supabase
        .from('books')
        .update({ total_read_time: newTotalTime })
        .eq('id', bookId);

      if (updateError) {
        console.error('Error updating reading time:', updateError);
      }
    } catch (error) {
      console.error('Error in handleComplete:', error);
    } finally {
      // 無論是否有錯誤，都導航回閱讀頁面
      _navigate(`/book/${bookId}`, { state: { from: 'timer' } });
    }
  };

  return (
    <Layout className="timer-note-page">
      <Header onBack={() => _navigate(`/book/${bookId}`, { state: { from: 'timer' } })} />
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
                <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: '16px', textAlign: 'center' }}>
                  沒有筆記
                </div>
              ) : (
                <div className="notes-list">
                  {notes.map(note => (
                    <Note
                      key={note.id}
                      content={note.content}
                      createdAt={note.created_at}
                      onEdit={async (content) => {
                        try {
                          const { error } = await supabase
                            .from('notes')
                            .update({ content })
                            .eq('id', note.id);
                          
                          if (error) throw error;
                          await loadNotes();
                        } catch (error) {
                          console.error('Error updating note:', error);
                        }
                      }}
                      onDelete={async () => {
                        try {
                          const { error } = await supabase
                            .from('notes')
                            .delete()
                            .eq('id', note.id);
                          
                          if (error) throw error;
                          await loadNotes();
                        } catch (error) {
                          console.error('Error deleting note:', error);
                        }
                      }}
                    />
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
