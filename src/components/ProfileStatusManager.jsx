import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Pause,
  RefreshCw,
  Eye,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/api';
import './ProfileStatusManager.css';

const ProfileStatusManager = ({ providerId, onStatusUpdate }) => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);

  const statusConfig = {
    incomplete: {
      label: 'Incomplete',
      icon: Clock,
      color: '#6b7280',
      description: 'Profile is not yet completed'
    },
    pending: {
      label: 'Pending Review',
      icon: RefreshCw,
      color: '#f59e0b',
      description: 'Profile completed, awaiting verification'
    },
    verified: {
      label: 'Verified',
      icon: CheckCircle,
      color: '#10b981',
      description: 'Profile verified and approved'
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      color: '#ef4444',
      description: 'Profile rejected (needs revision)'
    },
    suspended: {
      label: 'Suspended',
      icon: Pause,
      color: '#8b5cf6',
      description: 'Profile temporarily suspended'
    }
  };

  useEffect(() => {
    if (providerId) {
      loadStatusData();
    }
  }, [providerId]);

  const loadStatusData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProviderProfileStatus(providerId);
      setStatusData(data.data);
    } catch (error) {
      console.error('Error loading status data:', error);
      toast.error('Failed to load profile status');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    
    // Show reason modal for status changes that require explanation
    if (['rejected', 'suspended'].includes(newStatus)) {
      setShowReasonModal(true);
    } else {
      updateStatus(newStatus, '');
    }
  };

  const updateStatus = async (status, reasonText) => {
    try {
      setUpdating(true);
      await apiService.updateProviderProfileStatus(providerId, status, reasonText);
      
      toast.success(`Profile status updated to ${statusConfig[status].label}`);
      
      // Reload status data
      await loadStatusData();
      
      // Notify parent component
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
      
      setShowReasonModal(false);
      setReason('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update profile status');
    } finally {
      setUpdating(false);
    }
  };

  const handleReasonSubmit = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for this status change');
      return;
    }
    updateStatus(selectedStatus, reason.trim());
  };

  if (loading) {
    return (
      <div className="profile-status-manager loading">
        <div className="loading-spinner">
          <RefreshCw size={24} className="animate-spin" />
          <span>Loading profile status...</span>
        </div>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="profile-status-manager error">
        <AlertTriangle size={24} />
        <span>Failed to load profile status</span>
      </div>
    );
  }

  const currentStatus = statusData.status;
  const StatusIcon = statusConfig[currentStatus].icon;

  return (
    <div className="profile-status-manager">
      <div className="status-header">
        <h3>Profile Status Management</h3>
        <div className="current-status">
          <StatusIcon 
            size={20} 
            style={{ color: statusConfig[currentStatus].color }} 
          />
          <span 
            className="status-label"
            style={{ color: statusConfig[currentStatus].color }}
          >
            {statusConfig[currentStatus].label}
          </span>
        </div>
      </div>

      <div className="status-description">
        <p>{statusConfig[currentStatus].description}</p>
      </div>

      <div className="status-actions">
        <h4>Change Status:</h4>
        <div className="status-buttons">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            const isCurrentStatus = status === currentStatus;
            
            return (
              <button
                key={status}
                className={`status-btn ${isCurrentStatus ? 'current' : ''}`}
                onClick={() => !isCurrentStatus && handleStatusChange(status)}
                disabled={isCurrentStatus || updating}
                style={{ 
                  borderColor: config.color,
                  backgroundColor: isCurrentStatus ? config.color : 'transparent',
                  color: isCurrentStatus ? 'white' : config.color
                }}
              >
                <Icon size={16} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {statusData.status_history && statusData.status_history.length > 0 && (
        <div className="status-history">
          <h4>
            <Eye size={16} />
            Status History
          </h4>
          <div className="history-list">
            {statusData.status_history.map((entry, index) => (
              <div key={index} className="history-item">
                <div className="history-status">
                  <span className="old-status">{entry.old_status}</span>
                  <span className="arrow">→</span>
                  <span 
                    className="new-status"
                    style={{ color: statusConfig[entry.new_status].color }}
                  >
                    {entry.new_status}
                  </span>
                </div>
                {entry.reason && (
                  <div className="history-reason">
                    <MessageSquare size={12} />
                    <span>{entry.reason}</span>
                  </div>
                )}
                <div className="history-date">
                  {new Date(entry.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <motion.div
          className="reason-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowReasonModal(false)}
        >
          <motion.div
            className="reason-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Provide Reason for Status Change</h3>
            <p>
              Changing status to <strong>{statusConfig[selectedStatus].label}</strong>
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for this status change..."
              rows="4"
              className="reason-textarea"
            />
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowReasonModal(false)}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleReasonSubmit}
                disabled={updating || !reason.trim()}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileStatusManager;
