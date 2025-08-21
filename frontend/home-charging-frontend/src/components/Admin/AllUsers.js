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

const PrimaryRoleBadge = ({ roles }) => {
  if (!roles || roles.length === 0) {
    return <span className="role-badge user">User</span>;
  }
  
  const primaryRole = roles[0]; // Uzmi samo prvu rolu
  return (
    <span className={`role-badge ${primaryRole.toLowerCase()}`}>
      {primaryRole}
    </span>
  );
};

// Helper komponenta za email sa verifikacijom
const EmailWithVerification = ({ email, emailVerified }) => {
  return (
    <div className="email-verification-container">
      <span className="email-cell">{email}</span>
      {emailVerified && (
        <span className="verification-icon verified">
          <i className="fas fa-check-circle"></i>
        </span>
      )}
    </div>
  );
};

// Delete User Modal komponenta
const DeleteUserModal = ({ user, loading, onConfirm, onClose }) => {
  return (
    <BaseModal className="delete-modal delete-overlay" onClose={onClose}>
      <div className="modal-header delete-header">
        <h2>Delete User</h2>
        <button className="btn-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="modal-body delete-body">
        <div className="delete-confirmation">
          <h3>Are you sure you want to delete this user?</h3>
          <div className="user-info">
            <p>This will permanently delete the user account for:</p>
            <div className="user-card">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="user-details">
                <strong>
                  {user.username || 'Unknown User'}
                </strong>
                <span>{user.email || 'No email provided'}</span>
                <div className="user-status">
                  <StatusBadge user={user} />
                  <PrimaryRoleBadge roles={user.roles} />
                </div>
              </div>
            </div>
          </div>
          <div className="warning-text">
            <p><strong>Warning:</strong> This action cannot be undone. All user data, assessments, and associated records will be permanently deleted.</p>
          </div>
        </div>
      </div>
      
      <div className="modal-footer delete-footer">
        <button 
          className="btn-secondary" 
          onClick={onClose}
          disabled={loading}
        >
          <i className="fas fa-times"></i> Cancel
        </button>
        <button 
          className="btn-danger" 
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Deleting...
            </>
          ) : (
            <>
              <i className="fas fa-trash"></i> Delete User
            </>
          )}
        </button>
      </div>
    </BaseModal>
  );
};

const getFieldValue = (obj, path, fallbackPath = null) => {
  const getValue = (object, fieldPath) => {
    return fieldPath.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, object);
  };
  
  let value = getValue(obj, path);
  if (value === undefined && fallbackPath) {
    value = getValue(obj, fallbackPath);
  }
  return value;
};

// ViewAssessmentModal komponenta
const ViewAssessmentModal = ({ assessment, onClose, onSave }) => {
  const [activeSection, setActiveSection] = useState('Personal Info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(assessment || {});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (assessment) {
      setFormData(assessment);
    }
  }, [assessment]);

  const sections = [
    { title: 'Personal Info', image: 'person' },
    { title: 'Home Info', image: 'house' },
    { title: 'Vehicle Info', image: 'electric-car' },
    { title: 'Electrical Panel', image: 'electric-panel' },
    { title: 'Charger Location', image: 'electric-charger' },
    { title: 'EV Charger', image: 'ev-charger' }
  ];

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setSaved(false);
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section]?.[subsection],
          [field]: value
        }
      }
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!onSave) {
      console.error('onSave function not provided');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving assessment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setFormData(assessment);
      setSaved(false);
    }
  };

  const renderField = (label, value, type = 'text', options = null, onChange = null) => {
    if (!isEditing) {
      return (
        <div className="field-group">
          <label>{label}</label>
          <span>{value || ''}</span>
        </div>
      );
    }

    return (
      <div className="field-group editing">
        <label>{label}</label>
        {type === 'select' ? (
          <select value={value || ''} onChange={onChange} className="edit-input">
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value || ''}
            onChange={onChange}
            className="edit-input"
            step={type === 'number' ? '0.1' : undefined}
          />
        )}
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="section-content">
      {renderField(
        'Customer ID',
        getFieldValue(formData, 'customerId', 'CustomerId'),
        'text',
        null,
        isEditing ? (e) => {
          setFormData(prev => ({ ...prev, CustomerId: e.target.value, customerId: e.target.value }));
          setSaved(false);
        } : null
      )}
      {renderField(
        'First Name',
        getFieldValue(formData, 'personalInfo.firstName', 'PersonalInfo.FirstName'),
        'text',
        null,
        isEditing ? (e) => {
          handleInputChange('PersonalInfo', 'FirstName', e.target.value);
          handleInputChange('personalInfo', 'firstName', e.target.value);
        } : null
      )}
      {renderField(
        'Last Name',
        getFieldValue(formData, 'personalInfo.lastName', 'PersonalInfo.LastName'),
        'text',
        null,
        isEditing ? (e) => {
          handleInputChange('PersonalInfo', 'LastName', e.target.value);
          handleInputChange('personalInfo', 'lastName', e.target.value);
        } : null
      )}
      {renderField(
        'Email',
        getFieldValue(formData, 'personalInfo.email', 'PersonalInfo.Email'),
        'email',
        null,
        isEditing ? (e) => {
          handleInputChange('PersonalInfo', 'Email', e.target.value);
          handleInputChange('personalInfo', 'email', e.target.value);
        } : null
      )}
      {renderField(
        'Phone',
        getFieldValue(formData, 'personalInfo.phone', 'PersonalInfo.Phone'),
        'text',
        null,
        isEditing ? (e) => {
          handleInputChange('PersonalInfo', 'Phone', e.target.value);
          handleInputChange('personalInfo', 'phone', e.target.value);
        } : null
      )}
    </div>
  );

  const renderHomeInfo = () => (
    <div className="section-content">
      {renderField(
        'Country',
        getFieldValue(formData, 'homeInfo.address.country', 'HomeInfo.Address.Country'),
        'text',
        null,
        isEditing ? (e) => {
          handleNestedInputChange('HomeInfo', 'Address', 'Country', e.target.value);
          handleNestedInputChange('homeInfo', 'address', 'country', e.target.value);
        } : null
      )}
      {renderField(
        'City',
        getFieldValue(formData, 'homeInfo.address.city', 'HomeInfo.Address.City'),
        'text',
        null,
        isEditing ? (e) => {
          handleNestedInputChange('HomeInfo', 'Address', 'City', e.target.value);
          handleNestedInputChange('homeInfo', 'address', 'city', e.target.value);
        } : null
      )}
      {renderField(
        'Postal Code',
        getFieldValue(formData, 'homeInfo.address.postalCode', 'HomeInfo.Address.PostalCode'),
        'text',
        null,
        isEditing ? (e) => {
          handleNestedInputChange('HomeInfo', 'Address', 'PostalCode', e.target.value);
          handleNestedInputChange('homeInfo', 'address', 'postalCode', e.target.value);
        } : null
      )}
      {renderField(
        'Street',
        getFieldValue(formData, 'homeInfo.address.street', 'HomeInfo.Address.Street'),
        'text',
        null,
        isEditing ? (e) => {
          handleNestedInputChange('HomeInfo', 'Address', 'Street', e.target.value);
          handleNestedInputChange('homeInfo', 'address', 'street', e.target.value);
        } : null
      )}
      {renderField(
        'Street Number',
        getFieldValue(formData, 'homeInfo.address.streetNumber', 'HomeInfo.Address.StreetNumber'),
        'text',
        null,
        isEditing ? (e) => {
          handleNestedInputChange('HomeInfo', 'Address', 'StreetNumber', e.target.value);
          handleNestedInputChange('homeInfo', 'address', 'streetNumber', e.target.value);
        } : null
      )}
      {renderField(
        'High Energy Devices',
        getFieldValue(formData, 'homeInfo.numberOfHighEnergyDevices', 'HomeInfo.NumberOfHighEnergyDevices'),
        'number',
        null,
        isEditing ? (e) => {
          const value = parseInt(e.target.value) || 0;
          handleInputChange('HomeInfo', 'NumberOfHighEnergyDevices', value);
          handleInputChange('homeInfo', 'numberOfHighEnergyDevices', value);
        } : null
      )}
    </div>
  );

  const renderVehicleInfo = () => (
    <div className="section-content">
      {renderField(
        'Brand',
        getFieldValue(formData, 'vehicleInfo.brand', 'VehicleInfo.Brand'),
        'text',
        null,
        isEditing ? (e) => {
          handleInputChange('VehicleInfo', 'Brand', e.target.value);
          handleInputChange('vehicleInfo', 'brand', e.target.value);
        } : null
      )}
      {renderField(
        'Base Model',
        getFieldValue(formData, 'vehicleInfo.baseModel', 'VehicleInfo.BaseModel'),
        'text',
        null,
        isEditing ? (e) => {
          handleInputChange('VehicleInfo', 'BaseModel', e.target.value);
          handleInputChange('vehicleInfo', 'baseModel', e.target.value);
        } : null
      )}
      {renderField(
        'Model',
        getFieldValue(formData, 'vehicleInfo.model', 'VehicleInfo.Model'),
        'text',
        null,
        isEditing ? (e) => {
          handleInputChange('VehicleInfo', 'Model', e.target.value);
          handleInputChange('vehicleInfo', 'model', e.target.value);
        } : null
      )}
      {renderField(
        'Year',
        getFieldValue(formData, 'vehicleInfo.year', 'VehicleInfo.Year'),
        'number',
        null,
        isEditing ? (e) => {
          const value = parseInt(e.target.value) || '';
          handleInputChange('VehicleInfo', 'Year', value);
          handleInputChange('vehicleInfo', 'year', value);
        } : null
      )}
    </div>
  );

  const renderElectricalPanel = () => (
    <div className="section-content">
      {renderField(
        'Location',
        getFieldValue(formData, 'electricalPanelInfo.location', 'ElectricalPanelInfo.Location'),
        'select',
        [
          { value: '', label: 'Select Location' },
          { value: 'Basement', label: 'Basement' },
          { value: 'Garage', label: 'Garage' },
          { value: 'Attic', label: 'Attic' },
          { value: 'Outside', label: 'Outside' },
          { value: 'Utility Room', label: 'Utility Room' }
        ],
        isEditing ? (e) => {
          handleInputChange('ElectricalPanelInfo', 'Location', e.target.value);
          handleInputChange('electricalPanelInfo', 'location', e.target.value);
        } : null
      )}
      {renderField(
        'Main Breaker Capacity',
        getFieldValue(formData, 'electricalPanelInfo.mainBreakerCapacity', 'ElectricalPanelInfo.MainBreakerCapacity'),
        'number',
        null,
        isEditing ? (e) => {
          const value = parseInt(e.target.value) || 0;
          handleInputChange('ElectricalPanelInfo', 'MainBreakerCapacity', value);
          handleInputChange('electricalPanelInfo', 'mainBreakerCapacity', value);
        } : null
      )}
      {renderField(
        'Open Slots',
        getFieldValue(formData, 'electricalPanelInfo.numberOfOpenSlots', 'ElectricalPanelInfo.NumberOfOpenSlots'),
        'number',
        null,
        isEditing ? (e) => {
          const value = parseInt(e.target.value) || 0;
          handleInputChange('ElectricalPanelInfo', 'NumberOfOpenSlots', value);
          handleInputChange('electricalPanelInfo', 'numberOfOpenSlots', value);
        } : null
      )}
    </div>
  );

  const renderChargerLocation = () => (
    <div className="section-content">
      {renderField(
        'Preferred Location',
        getFieldValue(formData, 'chargerInfo.location', 'ChargerInfo.Location'),
        'select',
        [
          { value: '', label: 'Select Location' },
          { value: 'Garage', label: 'Garage' },
          { value: 'Driveway', label: 'Driveway' },
          { value: 'Yard', label: 'Yard' },
          { value: 'Parking Spot', label: 'Parking Spot' }
        ],
        isEditing ? (e) => {
          handleInputChange('ChargerInfo', 'Location', e.target.value);
          handleInputChange('chargerInfo', 'location', e.target.value);
        } : null
      )}
      {renderField(
        'Distance from Panel',
        getFieldValue(formData, 'chargerInfo.distanceFromPanelMeters', 'ChargerInfo.DistanceFromPanelMeters'),
        'number',
        null,
        isEditing ? (e) => {
          const value = parseFloat(e.target.value) || 0;
          handleInputChange('ChargerInfo', 'DistanceFromPanelMeters', value);
          handleInputChange('chargerInfo', 'distanceFromPanelMeters', value);
        } : null
      )}
    </div>
  );

  const renderEVCharger = () => {
    const hasCharger = getFieldValue(formData, 'evChargerInfo.hasCharger', 'EvChargerInfo.HasCharger', null);
    const wantsToBuy = getFieldValue(formData, 'evChargerInfo.wantsToBuy', 'EvChargerInfo.WantsToBuy', null);
    const showChargerDetails = hasCharger === true || wantsToBuy === true;

    return (
      <div className="section-content">
        {renderField(
          'Has Charger',
          isEditing ? (hasCharger === null ? '' : hasCharger.toString()) : (hasCharger === true ? 'Yes' : hasCharger === false ? 'No' : ''),
          'select',
          [
            { value: '', label: 'Select' },
            { value: 'false', label: 'No' },
            { value: 'true', label: 'Yes' }
          ],
          isEditing ? (e) => {
            const value = e.target.value === '' ? null : e.target.value === 'true';
            handleInputChange('EvChargerInfo', 'HasCharger', value);
            handleInputChange('evChargerInfo', 'hasCharger', value);
          } : null
        )}
        {renderField(
          'Wants to Buy',
          isEditing ? (wantsToBuy === null ? '' : wantsToBuy.toString()) : (wantsToBuy === true ? 'Yes' : wantsToBuy === false ? 'No' : ''),
          'select',
          [
            { value: '', label: 'Select' },
            { value: 'false', label: 'No' },
            { value: 'true', label: 'Yes' }
          ],
          isEditing ? (e) => {
            const value = e.target.value === '' ? null : e.target.value === 'true';
            handleInputChange('EvChargerInfo', 'WantsToBuy', value);
            handleInputChange('evChargerInfo', 'wantsToBuy', value);
          } : null
        )}
        
        {showChargerDetails && (
          <>
            {renderField(
              'Brand',
              getFieldValue(formData, 'evChargerInfo.evCharger.brand', 'EvChargerInfo.EvCharger.Brand'),
              'text',
              null,
              isEditing ? (e) => {
                handleNestedInputChange('EvChargerInfo', 'EvCharger', 'Brand', e.target.value);
                handleNestedInputChange('evChargerInfo', 'evCharger', 'brand', e.target.value);
              } : null
            )}
            {renderField(
              'Model',
              getFieldValue(formData, 'evChargerInfo.evCharger.model', 'EvChargerInfo.EvCharger.Model'),
              'text',
              null,
              isEditing ? (e) => {
                handleNestedInputChange('EvChargerInfo', 'EvCharger', 'Model', e.target.value);
                handleNestedInputChange('evChargerInfo', 'evCharger', 'model', e.target.value);
              } : null
            )}
            {renderField(
              'Power (kW)',
              getFieldValue(formData, 'evChargerInfo.evCharger.powerKw', 'EvChargerInfo.EvCharger.PowerKw'),
              'number',
              null,
              isEditing ? (e) => {
                const value = parseFloat(e.target.value) || 0;
                handleNestedInputChange('EvChargerInfo', 'EvCharger', 'PowerKw', value);
                handleNestedInputChange('evChargerInfo', 'evCharger', 'powerKw', value);
              } : null
            )}
          </>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'Personal Info':
        return renderPersonalInfo();
      case 'Home Info':
        return renderHomeInfo();
      case 'Vehicle Info':
        return renderVehicleInfo();
      case 'Electrical Panel':
        return renderElectricalPanel();
      case 'Charger Location':
        return renderChargerLocation();
      case 'EV Charger':
        return renderEVCharger();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <BaseModal className="view-modal-clean" onClose={onClose}>
      <div className="modal-body-clean">
        <div className="sidebar">
          <div className="logo-section-VM">
            <div className="header-logo">
              <span className="header-logo-icon"></span>
              <span className="header-logo-text">EV Charge</span>
            </div>
          </div>
          
          <div className="sections-menu">
            {sections.map((section) => (
              <div
                key={section.title}
                className={`menu-item ${activeSection === section.title ? 'active' : ''}`}
                onClick={() => setActiveSection(section.title)}
              >
                <img 
                  src={require(`../../res/${section.image}.png`)} 
                  alt={section.title}
                  className="menu-icon"
                />
                <span>{section.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-area">
          <div className="content-header">
            <h3>{activeSection}</h3>
            <div className="header-actions">
              {saved && (
                <span className="saved-indicator">
                  <i className="fas fa-check"></i> Saved
                </span>
              )}
              <button 
                className={`edit-toggle ${isEditing ? 'active' : ''}`}
                onClick={toggleEdit}
                title={isEditing ? 'Cancel Edit' : 'Edit'}
              >
                <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'}`}></i>
              </button>
            </div>
          </div>
          
          {renderContent()}
        </div>
      </div>
      
      <div className="modal-footer-actions">
        <button className="btn-close" onClick={onClose}>
          Close
        </button>
        {isEditing && (
          <button 
            className="btn-save" 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Save
              </>
            )}
          </button>
        )}
      </div>
    </BaseModal>
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

// View User Modal sa osnovnim stilom
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
  const [viewAssessmentModal, setViewAssessmentModal] = useState({ open: false, assessment: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null, loading: false });

  // Handler funkcije za brisanje korisnika
  const handleDeleteUser = (user) => {
    setDeleteModal({ open: true, user, loading: false });
  };

  const confirmDeleteUser = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      await adminService.deleteUser(deleteModal.user.id);
      setDeleteModal({ open: false, user: null, loading: false });
      loadUsers(false); // Refresh data
      
      // Ukloni iz selected items ako je bio selektovan
      setSelectedItems(prev => prev.filter(id => id !== deleteModal.user.id));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(adminService.handleError(error, 'deleting user'));
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

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

  const handleViewUserAssessments = async (user) => {
    try {
      const assessments = await adminService.getUserAssessments(user.id);
      
      if (assessments && assessments.length > 0) {
        // Ako ima assessments, otvori modal sa prvim assessment-om
        // Možete dodati logiku za izbor konkretnog assessment-a ako ih ima više
        const firstAssessment = assessments[0];
        setViewAssessmentModal({ open: true, assessment: firstAssessment });
      } else {
        alert(`No assessments found for user: ${user.username || user.email}`);
      }
    } catch (error) {
      console.error('Error loading user assessments:', error);
      alert(adminService.handleError(error, 'loading user assessments'));
    }
  };

  // Handle Save Assessment
  const handleSaveAssessment = async (updatedAssessment) => {
    try {
      console.log('Saving assessment:', updatedAssessment);
      
      await adminService.updateAssessment(
        updatedAssessment.id, 
        updatedAssessment.customerId, 
        adminService.formatAssessmentForAPI(updatedAssessment)
      );
      
      // Refresh assessment data
      const refreshedAssessment = await adminService.getAssessmentById(
        updatedAssessment.id, 
        updatedAssessment.customerId
      );
      setViewAssessmentModal({ open: true, assessment: refreshedAssessment });
      
    } catch (error) {
      console.error('Error updating assessment:', error);
      alert(adminService.handleError(error, 'updating assessment'));
      throw error; // Re-throw so modal can handle it
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
                  <th>Role</th>
                  <th>Assessment</th>
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
                    <td>
                      <EmailWithVerification 
                        email={user.email} 
                        emailVerified={user.emailVerified} 
                      />
                    </td>
                    <td><StatusBadge user={user} /></td>
                    <td><PrimaryRoleBadge roles={user.roles} /></td>
                    <td>
                      <button 
                        className="btn-assessments" 
                        title="View Assessment"
                        onClick={() => handleViewUserAssessments(user)}
                      >
                        <i className="fas fa-clipboard-list"></i>
                      </button>
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
                          className="btn-delete" 
                          title="Delete"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <i className="fas fa-trash"></i>
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

      {viewAssessmentModal.open && (
        <ViewAssessmentModal 
          assessment={viewAssessmentModal.assessment}
          onClose={() => setViewAssessmentModal({ open: false, assessment: null })}
          onSave={handleSaveAssessment}
        />
      )}

      {deleteModal.open && (
        <DeleteUserModal 
          user={deleteModal.user}
          loading={deleteModal.loading}
          onConfirm={confirmDeleteUser}
          onClose={() => setDeleteModal({ open: false, user: null, loading: false })}
        />
      )}
    </div>
  );
}

export default AllUsers;