import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import './TeamMemberManagementPage.css';

const TeamMemberManagementPage = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchAvailableProviders();
      setSelectedMembers(selectedTeam.team_members || []);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTeams();
      const userTeams = response.filter(team => team.team_leader_id === user?.id);
      setTeams(userTeams);
      
      if (userTeams.length > 0) {
        setSelectedTeam(userTeams[0]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProviders = async () => {
    try {
      const response = await apiService.getAvailableProviders();
      const available = response.filter(provider => 
        !selectedTeam.team_members.some(member => member.user_id === provider.id)
      );
      setAvailableProviders(available);
    } catch (error) {
      console.error('Error fetching available providers:', error);
      setError('Failed to load available providers');
    }
  };

  const handleAddMember = (provider) => {
    if (selectedMembers.length >= selectedTeam.max_members) {
      setError(`Maximum team size is ${selectedTeam.max_members} members`);
      return;
    }

    const newMember = {
      team_id: selectedTeam.id,
      user_id: provider.id,
      role: 'member',
      status: 'active',
      users: provider
    };

    setSelectedMembers([...selectedMembers, newMember]);
    setAvailableProviders(availableProviders.filter(p => p.id !== provider.id));
  };

  const handleRemoveMember = (member) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    
    // Add back to available providers if it's not the team leader
    if (member.user_id !== selectedTeam.team_leader_id) {
      setAvailableProviders([...availableProviders, member.users]);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Get current members from the team
      const currentMembers = selectedTeam.team_members || [];
      
      // Find members to add
      const membersToAdd = selectedMembers.filter(
        member => !currentMembers.some(current => current.user_id === member.user_id)
      );
      
      // Find members to remove
      const membersToRemove = currentMembers.filter(
        current => !selectedMembers.some(member => member.user_id === current.user_id)
      );

      // Add new members
      for (const member of membersToAdd) {
        await apiService.addTeamMember(selectedTeam.id, {
          user_id: member.user_id,
          role: member.role,
          status: member.status
        });
      }

      // Remove members
      for (const member of membersToRemove) {
        await apiService.removeTeamMember(member.id);
      }

      setSuccess('Team members updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh team data
      await fetchTeams();
    } catch (error) {
      console.error('Error updating team members:', error);
      setError('Failed to update team members');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="team-management-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your teams...</p>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="team-management-container">
        <div className="no-teams">
          <div className="no-teams-icon">👥</div>
          <h2>No Teams Found</h2>
          <p>You don't have any teams assigned as a team leader.</p>
          <p>Contact your administrator to be assigned as a team leader.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-management-container">
      <div className="team-header">
        <h1>Team Member Management</h1>
        <p>Manage members for your teams</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="error-message"
        >
          <span>⚠️</span>
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="success-message"
        >
          <span>✅</span>
          {success}
        </motion.div>
      )}

      <div className="team-selection">
        <h3>Select Team</h3>
        <div className="team-cards">
          {teams.map(team => (
            <motion.div
              key={team.id}
              className={`team-card ${selectedTeam?.id === team.id ? 'selected' : ''}`}
              onClick={() => setSelectedTeam(team)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="team-info">
                <h4>{team.name}</h4>
                <p>{team.description}</p>
                <div className="team-stats">
                  <span>👥 {team.team_members?.length || 0}/{team.max_members} members</span>
                  <span className={`status ${team.status}`}>{team.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedTeam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="team-members-section"
        >
          <div className="section-header">
            <h2>Manage Team Members</h2>
            <div className="team-info-card">
              <h3>{selectedTeam.name}</h3>
              <p>{selectedTeam.description}</p>
              <div className="team-details">
                <span>📧 {selectedTeam.service_categories?.name}</span>
                <span>🔧 {selectedTeam.services?.name}</span>
                <span>👥 {selectedMembers.length}/{selectedTeam.max_members} members</span>
              </div>
            </div>
          </div>

          <div className="members-management">
            <div className="available-providers">
              <h4>Available Service Providers</h4>
              <div className="providers-grid">
                <AnimatePresence>
                  {availableProviders.map(provider => (
                    <motion.div
                      key={provider.id}
                      className="provider-card"
                      onClick={() => handleAddMember(provider)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="provider-info">
                        <h5>{provider.user_profiles?.first_name} {provider.user_profiles?.last_name}</h5>
                        <p>{provider.email}</p>
                        <span className="specialization">
                          {provider.service_provider_details?.specialization || 'General Service'}
                        </span>
                      </div>
                      <button className="add-member-btn">
                        <span>+</span>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="selected-members">
              <h4>Team Members ({selectedMembers.length}/{selectedTeam.max_members})</h4>
              <div className="members-list">
                <AnimatePresence>
                  {selectedMembers.map(member => (
                    <motion.div
                      key={member.id || member.user_id}
                      className="member-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="member-info">
                        <h5>
                          {member.users?.user_profiles?.first_name} {member.users?.user_profiles?.last_name}
                          {member.user_id === selectedTeam.team_leader_id && <span className="leader-badge">👑</span>}
                        </h5>
                        <p>{member.users?.email}</p>
                        <span className="member-role">{member.role}</span>
                      </div>
                      <div className="member-actions">
                        <span className="member-status">{member.status}</span>
                        {member.user_id !== selectedTeam.team_leader_id && (
                          <button
                            className="remove-member-btn"
                            onClick={() => handleRemoveMember(member)}
                          >
                            <span>×</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="save-changes-btn"
              onClick={handleSaveChanges}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TeamMemberManagementPage;
