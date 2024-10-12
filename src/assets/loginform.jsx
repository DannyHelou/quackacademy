import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ setAuthStatus }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send login request to Flask back-end
      const response = await axios.post('http://127.0.0.1:5000/login', { email, password });
      
      // If successful, set the user as authenticated
      if (response.data.success) {
        setAuthStatus(true); // Update auth state in the app
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage("Login failed. Please try again.");
      console.error("Error logging in:", error);
    }
  };

  return (
    <div>
      <h1>Quackademy</h1>
      <form onSubmit={handleSubmit}>
        <div className='text-input-login'>
          <input className='pixel-input'
            type="email"
            placeholder="Email: user@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='text-input-login'>
          <input className='pixel-input'
            type="password"
            placeholder="Password: password123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <img src="src\assets\background_login_sprite.png" alt="floaty thing" className='float-image-login'/>
    </div>
  );
};

export default LoginForm;
