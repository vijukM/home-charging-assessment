// components/Admin/AllUsers.js
import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import './AllUsers.css';

// Utility funkcije
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook za modal funkcionalnost
const useModalHandlers = (onClose) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  return { handleOverlayClick };
};

// Bazna Modal komponenta
const BaseModal = ({ children, className = '', onClose }) => {
  const { handleOverlayClick } = useModalHandlers(onClose);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content ${className}`}>
        {children}
      </div>
    </div>
  );
};

// Helper komponenta za status badge
const StatusBadge = ({ user }) => {
  if (!user.isActive) return <span className="status-badge inactive">Inactive</span>;
  if (!user.emailVerified) return <span className="status-badge unverified">Unverified</span>;
  return <span className="status-badge active">Active</span>;
};

// Helper komponenta za roles badge
const RolesBadge = ({ roles }) => {
  if (!roles || roles.length === 0) {
    return <span className="role-badge user">User</span>;
  }
  
  return (
    <div className="roles-container">
      {roles.map((role, index) => (
        <span key={index} className={`role-badge ${role.toLowerCase()}`}>
          {role}
        </span>
      ))}
    </div>
  );
};

// View User Modal
const ViewUserModal = ({ user, onClose }) => {
  return (
    <BaseModal className="view-modal" onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title-section">
          <h2>User Details</h2>
          <p>Complete information for {user.username || user.email}</p>
        </div>
        <button className="btn-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="modal-body">
        <div className="user-details">
          {/* Basic Info */}
          <div className="detail-section">
            <h3><i className="fas fa-user"></i>Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>User ID:</label>
                <span className="user-id">{user.id}</span>
              </div>
              <div className="detail-item">
                <label>Username:</label>
                <span>{user.username || '—'}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span className="email-value">{user.email}</span>
              </div>
              <div className="detail-item">
                <label>Email Verified:</label>
                <span className={`status-indicator ${user.emailVerified ? 'positive' : 'negative'}`}>
                  {user.emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="detail-item">
                <label>Account Status:</label>
                <span className={`status-indicator ${user.isActive ? 'positive' : 'negative'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Roles & Permissions */}
          <div className="detail-section">
            <h3><i className="fas fa-shield-alt"></i>Roles & Permissions</h3>
            <div className="detail-grid">
              <div className="detail-item roles-section">
                <label>Assigned Roles:</label>
                <div className="roles-display">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role, index) => (
                      <span key={index} className={`role-badge ${role.toLowerCase()}`}>
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="role-badge user">User</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Activity */}
          <div className="detail-section">
            <h3><i className="fas fa-clock"></i>Account Activity</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Created At:</label>
                <span className="date-value">{formatDate(user.createdAt)}</span>
              </div>
              <div className="detail-item">
                <label>Last Login:</label>
                <span className="date-value">{formatDate(user.lastLogin)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="modal-footer">
        <button className="btn-secondary" onClick={onClose}>
          <i className="fas fa-times"></i> Close
        </button>
      </div>
    </BaseModal>
  );
};

// Edit User Roles Modal
const EditUserRolesModal = ({ user, loading, onSave, onClose }) => {
  const [selectedRoles, setSelectedRoles] = useState(user?.roles || []);
  const availableRoles = ['Admin', 'User', 'Moderator', 'Manager'];

  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedRoles);
  };

  return (
    <BaseModal className="edit-modal" onClose={onClose}>
      <div className="modal-header">
        <h2>Edit User Roles</h2>
        <button className="btn-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="modal-body">
        <div className="roles-edit-form">
          <div className="user-info-section">
            <h3>User Information</h3>
            <div className="user-card">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="user-details">
                <strong>{user.username || user.email}</strong>
                <span>{user.email}</span>
                <span className="user-status">
                  <StatusBadge user={user} />
                </span>
              </div>
            </div>
          </div>

          <div className="roles-selection-section">
            <h3>Available Roles</h3>
            <div className="roles-grid">
              {availableRoles.map(role => (
                <label key={role} className="role-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                  />
                  <span className="checkmark"></span>
                  <span className={`role-label ${role.toLowerCase()}`}>
                    {role}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="current-roles-preview">
            <h4>Selected Roles:</h4>
            <div className="roles-preview">
              {selectedRoles.length > 0 ? (
                selectedRoles.map((role, index) => (
                  <span key={index} className={`role-badge ${role.toLowerCase()}`}>
                    {role}
                  </span>
                ))
              ) : (
                <span className="role-badge user">User (Default)</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="modal-footer">
        <button 
          className="btn-secondary" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          className="btn-primary" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i> Save Changes
            </>
          )}
        </button>
      </div>
    </BaseModal>
  );
};

// Glavni AllUsers komponenta
function AllUsers() {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Ostali filteri
  const [filters, setFilters] = useState({
    status: '',
    emailVerified: '',
    role: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Selected items for bulk operations
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modal states
  const [viewModal, setViewModal] = useState({ open: false, user: null });
  const [editModal, setEditModal] = useState({ open: false, user: null, loading: false });

  // Initial load effect
  useEffect(() => {
    loadUsers(false);
  }, [currentPage, pageSize, filters]);

  // Separate effect for search
  useEffect(() => {
    if (users.length > 0) {
      loadUsers(true);
    }
  }, [debouncedSearchTerm]);

  const loadUsers = async (isSearch = false) => {
    if (isSearch) {
      setSearchLoading(true);
    } else {
      setLoading(true);
      setError(null);
    }
    
    try {
      const userResponse = await adminService.getAllUsers();
      
      if (userResponse) {
        // Apply filters on frontend since backend doesn't have filtering yet
        let filteredUsers = userResponse;
        
        // Search filter
        if (debouncedSearchTerm) {
          filteredUsers = filteredUsers.filter(user => 
            user.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          );
        }
        
        // Status filter
        if (filters.status) {
          filteredUsers = filteredUsers.filter(user => {
            if (filters.status === 'active') return user.isActive;
            if (filters.status === 'inactive') return !user.isActive;
            return true;
          });
        }
        
        // Email verified filter
        if (filters.emailVerified) {
          filteredUsers = filteredUsers.filter(user => {
            if (filters.emailVerified === 'verified') return user.emailVerified;
            if (filters.emailVerified === 'unverified') return !user.emailVerified;
            return true;
          });
        }
        
        // Role filter
        if (filters.role) {
          filteredUsers = filteredUsers.filter(user => 
            user.roles?.some(role => role.toLowerCase().includes(filters.role.toLowerCase()))
          );
        }
        
        // Date filters
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          filteredUsers = filteredUsers.filter(user => 
            new Date(user.createdAt) >= fromDate
          );
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          filteredUsers = filteredUsers.filter(user => 
            new Date(user.createdAt) <= toDate
          );
        }
        
        // Sorting
        filteredUsers.sort((a, b) => {
          let aValue = a[filters.sortBy];
          let bValue = b[filters.sortBy];
          
          if (filters.sortBy === 'createdAt' || filters.sortBy === 'lastLogin') {
            aValue = new Date(aValue || 0);
            bValue = new Date(bValue || 0);
          }
          
          if (filters.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
        
        // Pagination
        const total = filteredUsers.length;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        setUsers(paginatedUsers);
        setTotalPages(Math.ceil(total / pageSize));
        setTotalItems(total);
      }

    } catch (error) {
      console.error('Error loading users:', error);
      if (!isSearch) {
        setError(adminService.handleError(error, 'loading users data'));
      }
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '', 
      emailVerified: '', 
      role: '', 
      dateFrom: '', 
      dateTo: '',
      sortBy: 'createdAt', 
      sortOrder: 'desc'
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(users.map(u => u.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
      setSelectAll(false);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleViewDetails = (user) => {
    setViewModal({ open: true, user });
  };

  const handleEditUserRoles = (user) => {
    setEditModal({ open: true, user, loading: false });
  };

  const handleSaveRoles = async (roles) => {
    setEditModal(prev => ({ ...prev, loading: true }));
    
    try {
      await adminService.updateUserRoles(editModal.user.id, roles);
      
      setEditModal({ open: false, user: null, loading: false });
      loadUsers(false); // Refresh data
      alert('User roles updated successfully');
    } catch (error) {
      console.error('Error updating user roles:', error);
      alert(adminService.handleError(error, 'updating user roles'));
      setEditModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleViewUserAssessments = async (user) => {
    try {
      const assessments = await adminService.getUserAssessments(user.id);
      // You might want to open a modal or navigate to assessments page
      console.log('User assessments:', assessments);
      alert(`Found ${assessments.length} assessments for this user`);
    } catch (error) {
      console.error('Error loading user assessments:', error);
      alert(adminService.handleError(error, 'loading user assessments'));
    }
  };

  // Main loading state
  if (loading && users.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Error Loading Users</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={() => loadUsers(false)}>
          <i className="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="all-users-container">
      {/* Header */}
      <div className="page-header">
        <h1>All Users</h1>
        <div className="header-actions">
          <button 
            className="btn-refresh" 
            onClick={() => loadUsers(false)}
            disabled={loading || searchLoading}
          >
            <i className={`fas fa-sync-alt ${(loading || searchLoading) ? 'fa-spin' : ''}`}></i> 
            Refresh
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-section">
        {/* Filters */}
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>Search:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by username, email..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{
                    paddingRight: searchLoading ? '40px' : '12px'
                  }}
                />
                {searchLoading && (
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                )}
              </div>
              {searchTerm && !searchLoading && (
                <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px' }}>
                  {totalItems} results for "{searchTerm}"
                </small>
              )}
            </div>
            
            <div className="filter-group">
              <label>Status:</label>
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Email Verified:</label>
              <select 
                value={filters.emailVerified}
                onChange={(e) => handleFilterChange('emailVerified', e.target.value)}
              >
                <option value="">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Role:</label>
              <input
                type="text"
                placeholder="Filter by role"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              />
            </div>
          </div>
          
          <div className="filters-row">
            <div className="filter-group">
              <label>Date From:</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Date To:</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Page Size:</label>
              <select 
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <button 
              className="btn-clear-filters" 
              onClick={clearAllFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Search overlay */}
        <div style={{ position: 'relative' }}>
          {searchLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              zIndex: 10,
              pointerEvents: 'none'
            }}></div>
          )}

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="bulk-actions">
              <span className="selected-count">{selectedItems.length} users selected</span>
              <div className="bulk-buttons">
                <button 
                  className="btn-bulk btn-bulk-export"
                  onClick={() => console.log('Export selected users:', selectedItems)}
                >
                  <i className="fas fa-download"></i> Export Selected
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Roles</th>
                  <th>Email Verified</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(user.id)}
                        onChange={() => handleSelectItem(user.id)}
                      />
                    </td>
                    <td>
                      <strong>{user.username || '—'}</strong>
                    </td>
                    <td className="email-cell">{user.email}</td>
                    <td><StatusBadge user={user} /></td>
                    <td><RolesBadge roles={user.roles} /></td>
                    <td>
                      <span className={`verification-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                        {user.emailVerified ? (
                          <><i className="fas fa-check"></i> Verified</>
                        ) : (
                          <><i className="fas fa-times"></i> Unverified</>
                        )}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastLogin)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view" 
                          title="View Details"
                          onClick={() => handleViewDetails(user)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn-edit" 
                          title="Edit Roles"
                          onClick={() => handleEditUserRoles(user)}
                        >
                          <i className="fas fa-user-shield"></i>
                        </button>
                        <button 
                          className="btn-assessments" 
                          title="View Assessments"
                          onClick={() => handleViewUserAssessments(user)}
                        >
                          <i className="fas fa-clipboard-list"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            {searchTerm && (
              <span style={{ color: '#6b7280' }}> (filtered by "{searchTerm}")</span>
            )}
          </div>
          
          <div className="pagination">
            <button 
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
            
            <button 
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewModal.open && (
        <ViewUserModal 
          user={viewModal.user}
          onClose={() => setViewModal({ open: false, user: null })}
        />
      )}

      {editModal.open && (
        <EditUserRolesModal 
          user={editModal.user}
          loading={editModal.loading}
          onSave={handleSaveRoles}
          onClose={() => setEditModal({ open: false, user: null, loading: false })}
        />
      )}
    </div>
  );
}

export default AllUsers;