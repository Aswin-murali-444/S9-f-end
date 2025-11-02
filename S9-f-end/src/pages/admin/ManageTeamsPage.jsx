import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Eye, Edit, Trash2, UserPlus, Settings, Calendar } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { apiService } from '../../services/api';
import './AdminPages.css';

const ManageTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load teams
        const teamsData = await apiService.getTeams({ include_inactive: true });
        setTeams(teamsData.teams || []);

        // Load categories for filtering
        const categoriesData = await apiService.getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredTeams = teams.filter(team => {
    const matchesQuery = !query || 
      team.name.toLowerCase().includes(query.toLowerCase()) ||
      team.description?.toLowerCase().includes(query.toLowerCase()) ||
      team.team_leaders?.user_profiles?.first_name?.toLowerCase().includes(query.toLowerCase()) ||
      team.team_leaders?.user_profiles?.last_name?.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = !status || team.status === status;
    const matchesCategory = !categoryFilter || team.service_category_id === categoryFilter;

    return matchesQuery && matchesStatus && matchesCategory;
  });

  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setShowTeamModal(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteTeam(teamId);
      setTeams(prev => prev.filter(team => team.id !== teamId));
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'suspended': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '🟢';
      case 'inactive': return '⚪';
      case 'suspended': return '🟡';
      default: return '⚪';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading teams...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        className="admin-page-content"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Page Header */}
        <motion.div className="page-header" variants={itemVariants}>
          <div className="page-title">
            <h1>Manage Teams</h1>
            <p>View and manage service provider teams</p>
          </div>
          <div className="page-actions">
            <button
              className="btn-primary"
              onClick={() => window.location.href = '/dashboard/admin/add-provider'}
            >
              <Users size={20} />
              Create Team
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div className="filters-section" variants={itemVariants}>
          <div className="filters-grid">
            <div className="filter-group">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search teams, leaders, or descriptions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <Filter size={20} />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="filter-group">
              <Filter size={20} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Teams Grid */}
        <motion.div className="teams-grid" variants={itemVariants}>
          {filteredTeams.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No teams found</h3>
              <p>
                {query || status || categoryFilter
                  ? 'Try adjusting your filters to see more teams.'
                  : 'Create your first team to get started.'
                }
              </p>
              <button
                className="btn-primary"
                onClick={() => window.location.href = '/dashboard/admin/add-provider'}
              >
                <Users size={20} />
                Create Team
              </button>
            </div>
          ) : (
            filteredTeams.map(team => (
              <motion.div
                key={team.id}
                className="team-card"
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(79, 156, 249, 0.2)' }}
              >
                <div className="team-header">
                  <div className="team-info">
                    <h3>{team.name}</h3>
                    <div className="team-status">
                      <span className="status-indicator" style={{ color: getStatusColor(team.status) }}>
                        {getStatusIcon(team.status)} {team.status}
                      </span>
                    </div>
                  </div>
                  <div className="team-actions">
                    <button
                      className="action-btn view"
                      onClick={() => handleViewTeam(team)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => {/* Navigate to edit page */}}
                      title="Edit Team"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteTeam(team.id)}
                      title="Delete Team"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="team-content">
                  {team.description && (
                    <p className="team-description">{team.description}</p>
                  )}

                  <div className="team-leader">
                    <strong>Team Leader:</strong>{' '}
                    {team.team_leaders?.user_profiles?.first_name} {team.team_leaders?.user_profiles?.last_name}
                  </div>

                  <div className="team-stats">
                    <div className="stat">
                      <Users size={16} />
                      <span>{team.team_members?.length || 0} members</span>
                    </div>
                    <div className="stat">
                      <Settings size={16} />
                      <span>Max: {team.max_members}</span>
                    </div>
                    {team.service_categories && (
                      <div className="stat">
                        <Calendar size={16} />
                        <span>{team.service_categories.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Team Details Modal */}
        {showTeamModal && selectedTeam && (
          <div className="modal-backdrop" onClick={() => setShowTeamModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedTeam.name}</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowTeamModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="team-details">
                  <div className="detail-section">
                    <h3>Team Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Status:</strong>
                        <span style={{ color: getStatusColor(selectedTeam.status) }}>
                          {getStatusIcon(selectedTeam.status)} {selectedTeam.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <strong>Max Members:</strong>
                        <span>{selectedTeam.max_members}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Current Members:</strong>
                        <span>{selectedTeam.team_members?.length || 0}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Created:</strong>
                        <span>{new Date(selectedTeam.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {selectedTeam.description && (
                      <div className="detail-item full-width">
                        <strong>Description:</strong>
                        <p>{selectedTeam.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h3>Team Leader</h3>
                    <div className="leader-card">
                      <div className="leader-info">
                        <h4>{selectedTeam.team_leaders?.user_profiles?.first_name} {selectedTeam.team_leaders?.user_profiles?.last_name}</h4>
                        <p>{selectedTeam.team_leaders?.email}</p>
                        {selectedTeam.team_leaders?.user_profiles?.phone && (
                          <p>{selectedTeam.team_leaders.user_profiles.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Team Members ({selectedTeam.team_members?.length || 0})</h3>
                    {selectedTeam.team_members && selectedTeam.team_members.length > 0 ? (
                      <div className="members-grid">
                        {selectedTeam.team_members.map(member => (
                          <div key={member.id} className="member-card">
                            <div className="member-info">
                              <h4>{member.users?.user_profiles?.first_name} {member.users?.user_profiles?.last_name}</h4>
                              <p>{member.users?.email}</p>
                              <span className="member-role">{member.role}</span>
                            </div>
                            <div className="member-status">
                              <span className={`status-badge ${member.status}`}>
                                {member.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-members">No additional team members</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowTeamModal(false)}
                >
                  Close
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowTeamModal(false);
                    // Navigate to edit team page
                  }}
                >
                  <Edit size={20} />
                  Edit Team
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default ManageTeamsPage;
