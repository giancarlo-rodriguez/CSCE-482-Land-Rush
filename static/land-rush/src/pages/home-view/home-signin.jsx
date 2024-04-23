import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

const HomeSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if email and password match the expected values
    axios.post("http://127.0.0.1:8000/login", {
      email: email,
      password: password,
    }).then((res) => {
      Cookies.set('token', res.data.token, { expires: 7 });
      console.log("token : ",res.data.token);

      // Determine where to redirect based on user role
      const userRole = res.data.user_role;
      if (userRole === 'university') {
        navigate('/college'); // Redirect to university dashboard
      } else if (userRole === 'student') {
        navigate('/student'); // Redirect to student dashboard
      } else {
        setError("Invalid user role: "+userRole); // Handle unexpected user role
      }
    }).catch((err) =>{
      console.log(err);
      setError("Invalid email or password"); // Handle authentication error
    });
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h3>Login</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label>Email address:</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={handleEmailChange}
          />
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default HomeSignIn;
