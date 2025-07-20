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
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 