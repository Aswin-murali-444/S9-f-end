import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Home, Globe, Users, Heart, Wrench, ShoppingCart, Truck } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('homeowner');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-icon">
          <div className="icon-circle">
            <LogIn size={32} />
          </div>
        </div>
        <h2>Select Your Role</h2>
        
        <div className="role-cards">
          <div 
            className={`role-card ${userType === 'homeowner' ? 'selected' : ''}`}
            onClick={() => setUserType('homeowner')}
          >
            <Home size={24} />
            <span>Homeowner</span>
          </div>
          <div 
            className={`role-card ${userType === 'migrant' ? 'selected' : ''}`}
            onClick={() => setUserType('migrant')}
          >
            <Globe size={24} />
            <span>Migrant</span>
          </div>
          <div 
            className={`role-card ${userType === 'family' ? 'selected' : ''}`}
            onClick={() => setUserType('family')}
          >
            <Users size={24} />
            <span>Family</span>
          </div>

          <div 
            className={`role-card ${userType === 'service' ? 'selected' : ''}`}
            onClick={() => setUserType('service')}
          >
            <Wrench size={24} />
            <span>Service Provider</span>
          </div>
          <div 
            className={`role-card ${userType === 'caregiver' ? 'selected' : ''}`}
            onClick={() => setUserType('caregiver')}
          >
            <Heart size={24} />
            <span>Caregiver</span>
          </div>
          <div 
            className={`role-card ${userType === 'delivery' ? 'selected' : ''}`}
            onClick={() => setUserType('delivery')}
          >
            <Truck size={24} />
            <span>Delivery</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit">Sign In</button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;