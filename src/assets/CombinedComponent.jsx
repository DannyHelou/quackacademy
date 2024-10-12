import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const CombinedComponent = () => {
  const [record, setRecord] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [chatResponse, setChatResponse] = useState(null);

  const onStartRecording = () => {
    setRecord(true);
  };

  const onStopRecording = (recordedBlob) => {
    setRecord(false);
    setAudioBlob(recordedBlob.blob);
    uploadAudio(recordedBlob.blob);
  };

  const uploadAudio = (blob) => {
    const formData = new FormData();
    formData.append('audio', blob, 'audio.wav');

    axios.post('http://127.0.0.1:5000/transcribe', formData)
      .then(response => {
        setTranscribedText(response.data.text);
        handleSubmit(response.data.text); // Process the transcribed text automatically
      })
      .catch(error => {
        console.error('Error transcribing audio:', error);
      });
  };

  const handleSubmit = async (userMessage) => {
    try {
      // Send the transcribed text to both the sentiment analysis and ChatGPT simultaneously
      const sentimentPromise = axios.post('http://127.0.0.1:5000/journal', { journal: userMessage });
      const chatPromise = axios.post('http://127.0.0.1:5000/chat', { message: userMessage });

      // Wait for both responses
      const [sentimentRes, chatRes] = await Promise.all([sentimentPromise, chatPromise]);

      // Update state with both responses
      setChatResponse(chatRes.data);

    } catch (error) {
      console.error("Error in fetching data", error);
    }
  };

  return (
    <div className='big-boss'>
      <h1>Quackademy</h1>
      <div className='pixel-mic-container'>
        <ReactMic
            record={record}
            className="sound-wave"
            onStop={onStopRecording}
            strokeColor="#000000"
            backgroundColor="grey"
            visualSetting='frequencyBars'
        />
        <div>
            <button onClick={onStartRecording}>On</button>
            <button onClick={() => setRecord(false)}>Off</button>
        </div>
      </div>
      {/* <img src="./background_main.png" alt="" className='whiteboard'/> */}
      <img src="sprite_duck.png" alt="sprite" className='sprite-main'/>
      <img src="diologue_box.png" alt="diologue_box" className='dialogue-box' />

      {transcribedText && (
        <div className='textbox-main-2'>
          <p>{transcribedText}</p>
        </div>
      )}
      {chatResponse && (
        <div className='textbox-main-1'>
             <p>{chatResponse}</p>
        </div>
      )}
    </div>
  );
};

export default CombinedComponent;