"use client";

import { useChat } from 'ai/react';

export function ChatUI() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        height: '400px', 
        overflowY: 'auto', 
        border: '1px solid #ccc', 
        padding: '10px', 
        marginBottom: '10px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '10px',
              padding: '8px',
              backgroundColor: message.role === 'user' ? '#e3f2fd' : '#f3e5f5',
              borderRadius: '8px',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong>
            <div style={{ marginTop: '4px' }}>{message.content}</div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}