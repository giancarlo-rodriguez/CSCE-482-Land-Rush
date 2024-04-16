import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const SignUp = () => {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch universities when component mounts
    axios.get('http://127.0.0.1:8000/choose/uni')
      .then(response => {
        setUniversities(response.data);
      })
      .catch(error => {
        console.error('Error fetching universities:', error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post("http://127.0.0.1:8000/register/student", {
      fullName: fullName,
      email: email,
      password: password,
      university: selectedUniversity
    }).then((res) => {
      Cookies.set('token', res.data.token, { expires: 7 });
      window.location.href = '/student';
    }).catch((err) => {
      console.error('Error signing up:', err);
      setError('Error signing up. Please try again.');
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h3>Student Registration</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label>Full Name:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Email address:</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Select University:</label>
          <select
            className="form-control"
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
          >
            <option value="">Select a university</option>
            {universities.map(university => (
              <option key={university} value={university}>{university}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default SignUp;
