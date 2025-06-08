import React, { useState } from 'react';

interface SimpleMessageInputProps {
  onSendMessage: (content: string) => void;
  placeholder?: string;
}

export const SimpleMessageInput: React.FC<SimpleMessageInputProps> = ({ 
  onSendMessage, 
  placeholder = "Type a message..." 
}) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSendMessage(value.trim());
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field"
      />
      <button type="submit" className="send-button">
        Send
      </button>
    </form>
  );
};

export default SimpleMessageInput;