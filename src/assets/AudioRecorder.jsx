import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const AudioRecorder = () => {
  const [record, setRecord] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');

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
      })
      .catch(error => {
        console.error('Error transcribing audio:', error);
      });
  };

  return (
    <div>
      <h1>Record Your Explanation</h1>
      <ReactMic
        record={record}
        className="sound-wave"
        onStop={onStopRecording}
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />
      <button onClick={onStartRecording}>Start Recording</button>
      <button onClick={() => setRecord(false)}>Stop Recording</button>
      {transcribedText && (
        <div>
          <h2>Transcribed Text</h2>
          <p>{transcribedText}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
