import { useState } from 'react'
import './App.css'
import JournalInput from './assets/journalInput.jsx';
import LoginForm from './assets/LoginForm.jsx';
import AudioRecorder from './assets/AudioRecorder';
import CombinedComponent from './assets/CombinedComponent.jsx';


function App() {
  const [isAuthenticated, setAuthStatus] = useState(false); // Track auth status

  return (
    <>
        {!isAuthenticated ? (
            <LoginForm setAuthStatus={setAuthStatus} />
          ) : (
            <>
            {/* {/* <JournalInput /> */}
            {/* <AudioRecorder />  */}
            <CombinedComponent />
            </>
          )}

    </>
  )
}

export default App
