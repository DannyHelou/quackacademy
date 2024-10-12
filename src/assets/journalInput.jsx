import React, { useState } from 'react';
import axios from 'axios';

const CombinedComponent = () => {
  const [userMessage, setUserMessage] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [chatResponse, setChatResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send the text to both the sentiment analysis and ChatGPT simultaneously
      const sentimentPromise = axios.post('http://127.0.0.1:5000/journal', { journal: userMessage });
      const chatPromise = axios.post('http://127.0.0.1:5000/chat', { message: userMessage });

      // Wait for both responses
      const [sentimentRes, chatRes] = await Promise.all([sentimentPromise, chatPromise]);

      // Update state with both responses
      setSentiment(sentimentRes.data[0].label);  // Assuming sentiment returns an array
      setChatResponse(chatRes["data"]);

    } catch (error) {
      console.error("Error in fetching data", error);
    }
  };

  return (
    <div>
      <h2>What is your mission today?</h2>
      <form onSubmit={handleSubmit}>
        <div>
        <textarea 
          value={userMessage} 
          onChange={(e) => setUserMessage(e.target.value)} 
          placeholder="What do you need help with?"
        />
        </div>
        <button type="submit">Submit</button>
      </form>
      {sentiment && <p>{sentiment}</p>}
      {chatResponse && <p>{chatResponse}</p>}
    </div>
  );
};

export default CombinedComponent;
