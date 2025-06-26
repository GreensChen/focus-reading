import React from 'react';
import '../../styles/note.css';

interface NoteProps {
  content: string;
  timestamp: string;
}

const Note: React.FC<NoteProps> = ({ content, timestamp }) => {
  return (
    <div className="note-container">
      <div className="note-wrapper">{content}</div>
      <div className="note-time">{timestamp}</div>
    </div>
  );
};

export default Note;
