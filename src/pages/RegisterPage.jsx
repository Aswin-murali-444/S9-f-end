import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Home, Globe, Users, Heart, Wrench, ShoppingCart, Truck, Calendar, MessageSquare } from 'lucide-react';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'homeowner'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register:', formData);
  };

  return (
    <div className="register-container">
      <div className="meeting-section">
        <div className="meeting-card">
          <div className="meeting-icon">
            <div className="meeting-icon-circle">
              <Calendar size={28} />
            </div>
          </div>
          <h3>Schedule a Meeting</h3>
          <p>Need help getting started? Book a free consultation with our experts to discuss your specific needs.</p>
          <div className="meeting-features">
            <div className="feature">
              <MessageSquare size={16} />
              <span>Personalized guidance</span>
            </div>
            <div className="feature">
              <Calendar size={16} />
              <span>Flexible scheduling</span>
            </div>
          </div>
          <button className="schedule-btn">
            Schedule Now
          </button>
        </div>
      </div>
      <div className="register-box">
        <div className="register-icon">
          <div className="icon-circle">
            <UserPlus size={32} />
          </div>
        </div>
        
                <h2>Select Your Role</h2>
        
        <div className="role-cards">
          <div 
            className={`role-card ${formData.userType === 'homeowner' ? 'selected' : ''}`}
            onClick={() => setFormData({...formData, userType: 'homeowner'})}
          >
            <Home size={24} />
            <span>Homeowner</span>
          </div>
          <div 
            className={`role-card ${formData.userType === 'migrant' ? 'selected' : ''}`}
            onClick={() => setFormData({...formData, userType: 'migrant'})}
          >
            <Globe size={24} />
            <span>Migrant</span>
          </div>
          <div 
            className={`role-card ${formData.userType === 'family' ? 'selected' : ''}`}
            onClick={() => setFormData({...formData, userType: 'family'})}
          >
            <Users size={24} />
            <span>Family</span>
          </div>

          <div 
            className={`role-card ${formData.userType === 'service' ? 'selected' : ''}`}
            onClick={() => setFormData({...formData, userType: 'service'})}
          >
            <Wrench size={24} />
            <span>Service Provider</span>
          </div>
          <div 
            className={`role-card ${formData.userType === 'caregiver' ? 'selected' : ''}`}
            onClick={() => setFormData({...formData, userType: 'caregiver'})}
          >
            <Heart size={24} />
            <span>Caregiver</span>
          </div>
          <div 
            className={`role-card ${formData.userType === 'delivery' ? 'selected' : ''}`}
            onClick={() => setFormData({...formData, userType: 'delivery'})}
          >
            <Truck size={24} />
            <span>Delivery</span>
          </div>
        </div>
        <button type="button" className="google-btn">
            <svg width="22" height="22" viewBox="0 0 48 48" style={{marginRight: 8}}><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.36 1.53 7.82 2.81l5.77-5.62C34.5 3.54 29.74 1.5 24 1.5 14.98 1.5 7.09 7.5 3.67 15.02l6.91 5.37C12.18 14.41 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.21-.42-4.73H24v9.18h12.42c-.54 2.91-2.18 5.38-4.65 7.05l7.18 5.59C43.91 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.58 28.13a14.6 14.6 0 0 1 0-8.26l-6.91-5.37A23.94 23.94 0 0 0 1.9 24c0 3.77.9 7.34 2.49 10.5l6.91-5.37z"/><path fill="#EA4335" d="M24 46.5c6.48 0 11.92-2.15 15.89-5.85l-7.18-5.59c-2 1.36-4.56 2.18-8.71 2.18-6.38 0-11.82-4.91-13.42-11.41l-6.91 5.37C7.09 40.5 14.98 46.5 24 46.5z"/></g></svg>
            Continue with Google
          </button>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
          </div>
         
          <button type="submit">Get Started</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 