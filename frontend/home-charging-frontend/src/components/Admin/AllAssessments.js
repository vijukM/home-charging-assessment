// components/Admin/AllAssessments.js
import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import './AllAssessments.css';

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

// Funkcija za sigurno pristupanje nested objektima
const getNestedValue = (obj, path, defaultValue = '') => {
  if (!obj || !path) return defaultValue;
  
  const value = path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
  
  return value !== null && value !== undefined ? value : defaultValue;
};

// Poboljšana funkcija za dobijanje vrednosti polja
const getFieldValue = (assessment, primaryPath, secondaryPath, defaultValue = '') => {
  if (!assessment) return defaultValue;
  
  // Prvo pokušaj primarnu putanju
  const primaryValue = getNestedValue(assessment, primaryPath, null);
  if (primaryValue !== null && primaryValue !== undefined && primaryValue !== '') {
    return primaryValue;
  }
  
  // Ako primarna ne postoji, pokušaj sekundarnu
  const secondaryValue = getNestedValue(assessment, secondaryPath, null);
  if (secondaryValue !== null && secondaryValue !== undefined && secondaryValue !== '') {
    return secondaryValue;
  }
  
  return defaultValue;
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
const StatusBadge = ({ assessment }) => {
  const isComplete = getFieldValue(assessment, 'isComplete', 'IsComplete', false);
  const currentPage = getFieldValue(assessment, 'currentPage', 'CurrentPage', 0);
  
  if (isComplete) return <span className="status-badge completed">Završen</span>;
  if (currentPage === 0) return <span className="status-badge abandoned">Odustao</span>;
  return <span className="status-badge incomplete">U toku</span>;
};

// Helper komponenta za progress bar
const ProgressBar = ({ currentPage, totalPages = 6 }) => (
  <div className="progress-container">
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${(currentPage / totalPages) * 100}%` }}
      ></div>
    </div>
    <span className="progress-text">
      {currentPage}/{totalPages}
    </span>
  </div>
);

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
      setIsEditing(false); // Exit edit mode after successful save
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
      // Reset form data when canceling edit
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
        (e) => {
          setFormData(prev => ({ ...prev, CustomerId: e.target.value, customerId: e.target.value }));
          setSaved(false);
        }
      )}
      {renderField(
        'First Name',
        getFieldValue(formData, 'personalInfo.firstName', 'PersonalInfo.FirstName'),
        'text',
        null,
        (e) => {
          handleInputChange('PersonalInfo', 'FirstName', e.target.value);
          handleInputChange('personalInfo', 'firstName', e.target.value);
        }
      )}
      {renderField(
        'Last Name',
        getFieldValue(formData, 'personalInfo.lastName', 'PersonalInfo.LastName'),
        'text',
        null,
        (e) => {
          handleInputChange('PersonalInfo', 'LastName', e.target.value);
          handleInputChange('personalInfo', 'lastName', e.target.value);
        }
      )}
      {renderField(
        'Email',
        getFieldValue(formData, 'personalInfo.email', 'PersonalInfo.Email'),
        'email',
        null,
        (e) => {
          handleInputChange('PersonalInfo', 'Email', e.target.value);
          handleInputChange('personalInfo', 'email', e.target.value);
        }
      )}
      {renderField(
        'Phone',
        getFieldValue(formData, 'personalInfo.phone', 'PersonalInfo.Phone'),
        'text',
        null,
        (e) => {
          handleInputChange('PersonalInfo', 'Phone', e.target.value);
          handleInputChange('personalInfo', 'phone', e.target.value);
        }
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
        (e) => {
          handleNestedInputChange('HomeInfo', 'Address', 'Country', e.target.value);
          handleNestedInputChange('homeInfo', 'address', 'country', e.target.value);
        }
      )}
      {renderField(
        'City',
        getFieldValue(formData, 'homeInfo.address.city', 'HomeInfo.Address.City'),
        'text',
        null,
        (e) => {
          handleNestedInputChange('HomeInfo', 'Address', 'City', e.target.value);
          handleNestedInputChange('homeInfo', 'address', 'city', e.target.value);
        }
      )}
      {renderField(
        'Postal Code',
        getFieldValue(formData, 'homeInfo.address.postalCode', 'HomeInfo.Address.PostalCode'),
        'text',
        null,
        (e) => {
          handleNestedInputChange('HomeInfo', 'Address', 'PostalCode', e.target.value);
          handleNestedInputChange('homeInfo', 'address', 'postalCode', e.target.value);
        }
      )}
      {renderField(
        'Street',
        getFieldValue(formData, 'homeInfo.address.street', 'HomeInfo.Address.Street'),
        'text',
        null,
        (e) => {
          handleNestedInputChange('HomeInfo', 'Address', 'Street', e.target.value);
          handleNestedInputChange('homeInfo', 'address', 'street', e.target.value);
        }
      )}
      {renderField(
        'Street Number',
        getFieldValue(formData, 'homeInfo.address.streetNumber', 'HomeInfo.Address.StreetNumber'),
        'text',
        null,
        (e) => {
          handleNestedInputChange('HomeInfo', 'Address', 'StreetNumber', e.target.value);
          handleNestedInputChange('homeInfo', 'address', 'streetNumber', e.target.value);
        }
      )}
      {renderField(
        'High Energy Devices',
        getFieldValue(formData, 'homeInfo.numberOfHighEnergyDevices', 'HomeInfo.NumberOfHighEnergyDevices'),
        'number',
        null,
        (e) => {
          const value = parseInt(e.target.value) || 0;
          handleInputChange('HomeInfo', 'NumberOfHighEnergyDevices', value);
          handleInputChange('homeInfo', 'numberOfHighEnergyDevices', value);
        }
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
        (e) => {
          handleInputChange('VehicleInfo', 'Brand', e.target.value);
          handleInputChange('vehicleInfo', 'brand', e.target.value);
        }
      )}
      {renderField(
        'Base Model',
        getFieldValue(formData, 'vehicleInfo.baseModel', 'VehicleInfo.BaseModel'),
        'text',
        null,
        (e) => {
          handleInputChange('VehicleInfo', 'BaseModel', e.target.value);
          handleInputChange('vehicleInfo', 'baseModel', e.target.value);
        }
      )}
      {renderField(
        'Model',
        getFieldValue(formData, 'vehicleInfo.model', 'VehicleInfo.Model'),
        'text',
        null,
        (e) => {
          handleInputChange('VehicleInfo', 'Model', e.target.value);
          handleInputChange('vehicleInfo', 'model', e.target.value);
        }
      )}
      {renderField(
        'Year',
        getFieldValue(formData, 'vehicleInfo.year', 'VehicleInfo.Year'),
        'number',
        null,
        (e) => {
          const value = parseInt(e.target.value) || '';
          handleInputChange('VehicleInfo', 'Year', value);
          handleInputChange('vehicleInfo', 'year', value);
        }
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
        (e) => {
          handleInputChange('ElectricalPanelInfo', 'Location', e.target.value);
          handleInputChange('electricalPanelInfo', 'location', e.target.value);
        }
      )}
      {renderField(
        'Main Breaker Capacity',
        getFieldValue(formData, 'electricalPanelInfo.mainBreakerCapacity', 'ElectricalPanelInfo.MainBreakerCapacity'),
        'number',
        null,
        (e) => {
          const value = parseInt(e.target.value) || 0;
          handleInputChange('ElectricalPanelInfo', 'MainBreakerCapacity', value);
          handleInputChange('electricalPanelInfo', 'mainBreakerCapacity', value);
        }
      )}
      {renderField(
        'Open Slots',
        getFieldValue(formData, 'electricalPanelInfo.numberOfOpenSlots', 'ElectricalPanelInfo.NumberOfOpenSlots'),
        'number',
        null,
        (e) => {
          const value = parseInt(e.target.value) || 0;
          handleInputChange('ElectricalPanelInfo', 'NumberOfOpenSlots', value);
          handleInputChange('electricalPanelInfo', 'numberOfOpenSlots', value);
        }
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
        (e) => {
          handleInputChange('ChargerInfo', 'Location', e.target.value);
          handleInputChange('chargerInfo', 'location', e.target.value);
        }
      )}
      {renderField(
        'Distance from Panel',
        getFieldValue(formData, 'chargerInfo.distanceFromPanelMeters', 'ChargerInfo.DistanceFromPanelMeters'),
        'number',
        null,
        (e) => {
          const value = parseFloat(e.target.value) || 0;
          handleInputChange('ChargerInfo', 'DistanceFromPanelMeters', value);
          handleInputChange('chargerInfo', 'distanceFromPanelMeters', value);
        }
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
          (e) => {
            const value = e.target.value === '' ? null : e.target.value === 'true';
            handleInputChange('EvChargerInfo', 'HasCharger', value);
            handleInputChange('evChargerInfo', 'hasCharger', value);
          }
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
          (e) => {
            const value = e.target.value === '' ? null : e.target.value === 'true';
            handleInputChange('EvChargerInfo', 'WantsToBuy', value);
            handleInputChange('evChargerInfo', 'wantsToBuy', value);
          }
        )}
        
        {showChargerDetails && (
          <>
            {renderField(
              'Brand',
              getFieldValue(formData, 'evChargerInfo.evCharger.brand', 'EvChargerInfo.EvCharger.Brand'),
              'text',
              null,
              (e) => {
                handleNestedInputChange('EvChargerInfo', 'EvCharger', 'Brand', e.target.value);
                handleNestedInputChange('evChargerInfo', 'evCharger', 'brand', e.target.value);
              }
            )}
            {renderField(
              'Model',
              getFieldValue(formData, 'evChargerInfo.evCharger.model', 'EvChargerInfo.EvCharger.Model'),
              'text',
              null,
              (e) => {
                handleNestedInputChange('EvChargerInfo', 'EvCharger', 'Model', e.target.value);
                handleNestedInputChange('evChargerInfo', 'evCharger', 'model', e.target.value);
              }
            )}
            {renderField(
              'Power (kW)',
              getFieldValue(formData, 'evChargerInfo.evCharger.powerKw', 'EvChargerInfo.EvCharger.PowerKw'),
              'number',
              null,
              (e) => {
                const value = parseFloat(e.target.value) || 0;
                handleNestedInputChange('EvChargerInfo', 'EvCharger', 'PowerKw', value);
                handleNestedInputChange('evChargerInfo', 'evCharger', 'powerKw', value);
              }
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

// Delete Assessment Modal
const DeleteAssessmentModal = ({ assessment, loading, onConfirm, onClose }) => {
  return (
    <BaseModal className="delete-modal delete-overlay" onClose={onClose}>
      <div className="modal-header delete-header">
        <h2>Delete Assessment</h2>
        <button className="btn-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="modal-body delete-body">
        <div className="delete-confirmation">
          <h3>Are you sure you want to delete this assessment?</h3>
          <div className="user-info">
            <p>This will permanently delete the assessment for:</p>
            <div className="user-card">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="user-details">
                <strong>
                  {getFieldValue(assessment, 'personalInfo.firstName', 'PersonalInfo.FirstName', 'Unknown')} {getFieldValue(assessment, 'personalInfo.lastName', 'PersonalInfo.LastName', 'User')}
                </strong>
                <span>{getFieldValue(assessment, 'personalInfo.email', 'PersonalInfo.Email', 'No email provided')}</span>
              </div>
            </div>
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
              <i className="fas fa-trash"></i> Delete Assessment
            </>
          )}
        </button>
      </div>
    </BaseModal>
  );
};

// Glavni AllAssessments komponenta
function AllAssessments() {
  // State management
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // Search state - odvojen od ostalih filtera
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Ostali filteri
  const [filters, setFilters] = useState({
    status: '',
    currentPageFilter: '',
    city: '',
    vehicleBrand: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Selected items for bulk operations
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modal states
  const [viewModal, setViewModal] = useState({ open: false, assessment: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, assessment: null, loading: false });

  // Initial load effect
  useEffect(() => {
    loadData(false); // Initial load
  }, [currentPage, pageSize, filters]);

  // Separate effect for search
  useEffect(() => {
    if (assessments.length > 0) { // Samo ako već imamo podatke
      loadData(true); // Search load
    }
  }, [debouncedSearchTerm]);

  const loadData = async (isSearch = false) => {
    if (isSearch) {
      setSearchLoading(true);
    } else {
      setLoading(true);
      setError(null);
    }
    
    try {
      const filterParams = {
        page: currentPage,
        pageSize: pageSize,
        search: debouncedSearchTerm,
        ...filters
      };

      const assessmentResponse = await adminService.getAllAssessments(filterParams);
      
      if (assessmentResponse) {
        const transformedAssessments = assessmentResponse.items?.map(item => 
          adminService.formatAssessmentFromAPI(item)
        ) || [];
        
        setAssessments(transformedAssessments);
        setTotalPages(assessmentResponse.totalPages || 0);
        setTotalItems(assessmentResponse.totalItems || 0);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      if (!isSearch) { // Greške prikazujemo samo za non-search zahteve
        setError(adminService.handleError(error, 'loading assessments data'));
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
      currentPageFilter: '', 
      city: '', 
      vehicleBrand: '', 
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
      setSelectedItems(assessments.map(a => a.id));
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

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      alert('Please select items first');
      return;
    }

    try {
      const result = await adminService.bulkAction(action, selectedItems);
      alert(result.message || 'Bulk action completed successfully');
      setSelectedItems([]);
      setSelectAll(false);
      loadData(false); // Refresh data
    } catch (error) {
      console.error('Bulk action error:', error);
      alert(adminService.handleError(error, 'performing bulk action'));
    }
  };

  const handleViewDetails = async (assessment) => {
    try {
      const detailedAssessment = await adminService.getAssessmentById(assessment.id, assessment.customerId);
      setViewModal({ open: true, assessment: detailedAssessment });
    } catch (error) {
      console.error('Error loading assessment details:', error);
      alert(adminService.handleError(error, 'loading assessment details'));
    }
  };

  const handleSaveEdit = async (updatedAssessment) => {
    try {
      await adminService.updateAssessment(
        updatedAssessment.id, 
        updatedAssessment.customerId, 
        adminService.formatAssessmentForAPI(updatedAssessment)
      );
      await loadData(false);
      const refreshedAssessment = await adminService.getAssessmentById(
        updatedAssessment.id, 
        updatedAssessment.customerId
      );
      setViewModal({ open: true, assessment: refreshedAssessment });
      
    } catch (error) {
      alert(adminService.handleError(error, 'updating assessment'));
      throw error; // Re-throw so modal can handle it
    }
  };
  
  const handleDeleteAssessment = (assessment) => {
    setDeleteModal({ open: true, assessment, loading: false });
  };

  const confirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    
    try {
      await adminService.deleteAssessment(deleteModal.assessment.id, deleteModal.assessment.customerId);
      setDeleteModal({ open: false, assessment: null, loading: false });
      loadData(false); // Refresh data
    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert(adminService.handleError(error, 'deleting assessment'));
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleExport = async () => {
    try {
      const exportRequest = {
        filters: {
          search: debouncedSearchTerm,
          ...filters
        },
        format: 'xlsx',
        columns: ['firstName', 'lastName', 'email', 'status', 'city', 'vehicleBrand']
      };
      
      await adminService.exportAssessments(exportRequest);
    } catch (error) {
      console.error('Export error:', error);
      alert(adminService.handleError(error, 'exporting assessments'));
    }
  };

  // Main loading state - samo za inicijalno učitavanje
  if (loading && assessments.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Error Loading Assessments</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={() => loadData(false)}>
          <i className="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="all-assessments-container">
      {/* Header */}
      <div className="page-header">
        <h1>All Assessments</h1>
        <div className="header-actions">
          <button className="btn-export" onClick={handleExport}>
            <i className="fas fa-download"></i> Export
          </button>
          <button 
            className="btn-refresh" 
            onClick={() => loadData(false)}
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
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{
                    paddingRight: searchLoading ? '40px' : '12px'
                  }}
                />
                {/* Loading spinner unutar search input-a */}
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
              {/* Opciono: search info */}
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
                <option value="completed">Completed</option>
                <option value="incomplete">In Progress</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>City:</label>
              <input
                type="text"
                placeholder="Filter by city"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Vehicle Brand:</label>
              <input
                type="text"
                placeholder="Filter by brand"
                value={filters.vehicleBrand}
                onChange={(e) => handleFilterChange('vehicleBrand', e.target.value)}
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

        {/* Search overlay umesto potpunog loading-a */}
        <div style={{ position: 'relative' }}>
          {/* Transparentni overlay tokom search-a */}
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
              pointerEvents: 'none' // Dozvoljava interakciju sa tablelom ispod
            }}></div>
          )}

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="bulk-actions">
              <span className="selected-count">{selectedItems.length} items selected</span>
              <div className="bulk-buttons">
                <button 
                  className="btn-bulk btn-bulk-export"
                  onClick={() => handleBulkAction('export')}
                >
                  <i className="fas fa-download"></i> Export Selected
                </button>
                <button 
                  className="btn-bulk btn-bulk-archive"
                  onClick={() => handleBulkAction('archive')}
                >
                  <i className="fas fa-archive"></i> Archive Selected
                </button>
                <button 
                  className="btn-bulk btn-bulk-delete"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete selected assessments?')) {
                      handleBulkAction('delete');
                    }
                  }}
                >
                  <i className="fas fa-trash"></i> Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Assessment Table */}
          <div className="table-container">
            <table className="assessments-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Vehicle</th>
                  <th>City</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map(assessment => (
                  <tr key={assessment.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(assessment.id)}
                        onChange={() => handleSelectItem(assessment.id)}
                      />
                    </td>
                    <td>
                      <strong>
                        {getFieldValue(assessment, 'personalInfo.firstName', 'PersonalInfo.FirstName')} {getFieldValue(assessment, 'personalInfo.lastName', 'PersonalInfo.LastName')}
                      </strong>
                    </td>
                    <td>{getFieldValue(assessment, 'personalInfo.email', 'PersonalInfo.Email')}</td>
                    <td><StatusBadge assessment={assessment} /></td>
                    <td>
                      <ProgressBar currentPage={getFieldValue(assessment, 'currentPage', 'CurrentPage', 0)} />
                    </td>
                    <td>
                      {getFieldValue(assessment, 'vehicleInfo.brand', 'VehicleInfo.Brand') && 
                        `${getFieldValue(assessment, 'vehicleInfo.brand', 'VehicleInfo.Brand')} ${getFieldValue(assessment, 'vehicleInfo.model', 'VehicleInfo.Model')} (${getFieldValue(assessment, 'vehicleInfo.year', 'VehicleInfo.Year')})`
                      }
                    </td>
                    <td>{getFieldValue(assessment, 'homeInfo.address.city', 'HomeInfo.Address.City')}</td>
                    <td>{formatDate(getFieldValue(assessment, 'createdAt', 'CreatedAt'))}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view" 
                          title="View Details"
                          onClick={() => handleViewDetails(assessment)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn-delete" 
                          title="Delete"
                          onClick={() => handleDeleteAssessment(assessment)}
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

      {/* Modals - FIXED: Dodato onSave prop! */}
      {viewModal.open && (
        <ViewAssessmentModal 
          assessment={viewModal.assessment}
          onClose={() => setViewModal({ open: false, assessment: null })}
          onSave={handleSaveEdit}
        />
      )}
      {deleteModal.open && (
        <DeleteAssessmentModal 
          assessment={deleteModal.assessment}
          loading={deleteModal.loading}
          onConfirm={confirmDelete}
          onClose={() => setDeleteModal({ open: false, assessment: null, loading: false })}
        />
      )}
    </div>
  );
}

export default AllAssessments;