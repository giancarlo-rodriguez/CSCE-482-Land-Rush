import React, { useState } from "react";
import "./Login.css"; // Import CSS file for styling
import SignUpStudent from "./SignUpStudent"; // Import SignUp component
import SignUpUniversity from "./SignUpUniversity";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false); // State for sign-in pop-up

  return (
    <div className="login-container">
      <div className="background-image" />
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          // Navigate to home page ("/home")
          window.location.href = '/student';
        }}>
          <div>
            <label htmlFor="username">Username: </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
        <div className="signup-buttons">
          <button className="btn btn-primary" onClick={() => setShowStudentModal(true)}>Sign Up as a University</button>
          <button className="btn btn-primary" onClick={() => setShowSignUpModal(true)}>Sign Up as a Student</button>
        </div>
      </div>
      {showStudentModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowStudentModal(false)}>&times;</span>
            <SignUpUniversity />
          </div>
        </div>
      )}
      {showSignUpModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowSignUpModal(false)}>&times;</span>
            <SignUpStudent />
          </div>
        </div>
      )}
      {/* Render the sign-in pop-up if showSignInPopup is true */}
      {showSignInPopup && (
        <div className="popup">
          <div className="popup-inner">
            <span className="close" onClick={() => setShowSignInPopup(false)}>&times;</span>
            <h3>Forgot Password</h3>
            {/* Add your forgot password form or content here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
