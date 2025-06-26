import React, { useState, useEffect } from 'react';
import { Layout, Button, Input } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircleOutlined, PauseCircleOutlined, RedoOutlined, LeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { supabase } from '../../supabaseClient';
import './TimerNotePage.css';

const { Content } = Layout;
const { TextArea } = Input;

const TimerNotePage: React.FC = () => {
  const navigate = useNavigate();
  const { bookId, minutes: initialMinutes } = useParams<{ bookId: string; minutes: string }>();
  const [timeLeft, setTimeLeft] = useState(parseInt(initialMinutes || '0') * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [noteContent, setNoteContent] = useState('');
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
    if (!bookId) return;

    try {
      // 計算實際閱讀時間（總時間減去暫停時間）
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const finalPausedTime = pauseStartTime ? totalPausedTime + (endTime - pauseStartTime) : totalPausedTime;
      const actualReadingTimeSeconds = Math.floor((totalTime - finalPausedTime) / 1000);

      console.log('Time calculation:', {
        totalTime: Math.floor(totalTime / 1000),
        finalPausedTime: Math.floor(finalPausedTime / 1000),
        actualReadingTimeSeconds
      });

      // 只有當有筆記內容時才儲存筆記
      if (noteContent.trim()) {
        const { error } = await supabase
          .from('notes')
          .insert([{
            book_id: bookId,
            content: noteContent.trim(),
            duration_min: Math.floor(actualReadingTimeSeconds / 60)
          }]);

        if (error) {
          console.error('Error saving note:', error);
        }
      }

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
        return;
      }
    } catch (error) {
      console.error('Error in handleSaveNote:', error);
    } finally {
      // 無論是否有錯誤，都返回閱讀頁
      navigate(`/book/${bookId}`);
    }
  };

  return (
    <Layout className="timer-note-page">
      <Button
        className="back-button"
        type="text"
        icon={<LeftOutlined />}
        onClick={() => navigate(-1)}      />
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
            onClick={handleSaveNote}
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
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
          <Button 
            type="primary" 
            onClick={handleSaveNote}
            disabled={!noteContent.trim()}
            className="save-button"
          >
            儲存筆記
          </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default TimerNotePage;
