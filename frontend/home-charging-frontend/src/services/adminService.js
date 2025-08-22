// src/services/adminService.js
class AdminService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5092/api';
    this.endpoints = {
      // Assessment endpoints
      assessments: '/admin/assessments',
      assessmentStats: '/admin/assessments/stats',
      assessmentCharts: '/admin/assessments/charts',
      assessmentDropOff: '/admin/assessments/drop-off',
      assessmentExport: '/admin/assessments/export',
      assessmentBulkAction: '/admin/assessments/bulk-action',
      assessmentSearch: '/admin/assessments/search',
      assessmentCompletionRates: '/admin/assessments/completion-rates',
      
      // User endpoints
      users: '/admin/users',
      userAssessments: (userId) => `/admin/users/${userId}/assessments`,
      userRoles: (userId) => `/admin/users/${userId}/roles`,
      
      // System endpoints
      systemHealth: '/admin/system/health',
      dashboardSummary: '/admin/dashboard/summary'
    };
  }

  // Helper method to get headers with token
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders(),
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Handle file downloads
      if (response.headers.get('content-type')?.includes('application/') && 
          !response.headers.get('content-type')?.includes('json')) {
        return response.blob();
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Assessment Management
  async getAllAssessments(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `${this.endpoints.assessments}${queryString ? `?${queryString}` : ''}`;
    
    return await this.apiCall(endpoint);
  }

  async getAssessmentStats() {
    return await this.apiCall(this.endpoints.assessmentStats);
  }

  async getAssessmentCharts() {
    return await this.apiCall(this.endpoints.assessmentCharts);
  }

  async getDropOffAnalysis() {
    return await this.apiCall(this.endpoints.assessmentDropOff);
  }

 async getAssessmentById(assessmentId, partitionKey) {
  if (!partitionKey)  throw new Error('PartitionKey (customerId) is required');
  
  const params = `?partitionKey=${encodeURIComponent(partitionKey)}`;
  return await this.apiCall(`${this.endpoints.assessments}/${assessmentId}${params}`);
}

  async updateAssessment(assessmentId, partitionKey, assessmentData) {
  if (!partitionKey)   throw new Error('PartitionKey (customerId) is required');
  
  const params = `?partitionKey=${encodeURIComponent(partitionKey)}`;
  return await this.apiCall(`${this.endpoints.assessments}/${assessmentId}${params}`, {
    method: 'PUT',
    body: JSON.stringify(assessmentData)
  });
}
async deleteAssessment(assessmentId, partitionKey) {
  if (!partitionKey) throw new Error('PartitionKey (customerId) is required');

  const params = `?partitionKey=${encodeURIComponent(partitionKey)}`;
  return await this.apiCall(`${this.endpoints.assessments}/${assessmentId}${params}`, {
    method: 'DELETE'
  });
}

  async exportAssessments(exportRequest) {
    const blob = await this.apiCall(this.endpoints.assessmentExport, {
      method: 'POST',
      body: JSON.stringify(exportRequest)
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessments_export_${new Date().toISOString().split('T')[0]}.${exportRequest.format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true, message: 'Export downloaded successfully' };
  }

  async bulkAction(action, assessmentIds, parameters = {}) {
    return await this.apiCall(this.endpoints.assessmentBulkAction, {
      method: 'POST',
      body: JSON.stringify({
        action,
        assessmentIds,
        parameters
      })
    });
  }

  async searchAssessments(query, page = 1, pageSize = 10) {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    return await this.apiCall(`${this.endpoints.assessmentSearch}?${params}`);
  }

  async getCompletionRates(groupBy = 'month') {
    return await this.apiCall(`${this.endpoints.assessmentCompletionRates}?groupBy=${groupBy}`);
  }

  // User Management
  async getAllUsers() {
    return await this.apiCall(this.endpoints.users);
  }

  async getUserById(userId) {
    return await this.apiCall(`${this.endpoints.users}/${userId}`);
  }

  async updateUserRoles(userId, roles) {
    return await this.apiCall(this.endpoints.userRoles(userId), {
      method: 'PUT',
      body: JSON.stringify({ roles })
    });
  }
  async updateUser(userId, userData) {
    return await this.apiCall(`${this.endpoints.users}/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
  async getUserAssessments(userId) {
    return await this.apiCall(this.endpoints.userAssessments(userId));
  }
  async deleteUser(userId) {
  return await this.apiCall(`${this.endpoints.users}/${userId}`, {
    method: 'DELETE'
  });
  }
  // System Management
  async getSystemHealth() {
    return await this.apiCall(this.endpoints.systemHealth);
  }

  async getDashboardSummary() {
    return await this.apiCall(this.endpoints.dashboardSummary);
  }

   formatAssessmentForAPI(assessment) {
    // Transform frontend assessment model to backend expected format
    // Keep the structure that backend expects
    return {
      id: assessment.id,
      customerId: assessment.customerId || assessment.CustomerId,
      personalInfo: {
        firstName: assessment.PersonalInfo?.FirstName || assessment.personalInfo?.firstName || '',
        lastName: assessment.PersonalInfo?.LastName || assessment.personalInfo?.lastName || '',
        email: assessment.PersonalInfo?.Email || assessment.personalInfo?.email || '',
        phone: assessment.PersonalInfo?.Phone || assessment.personalInfo?.phone || ''
      },
      homeInfo: {
        address: {
          street: assessment.HomeInfo?.Address?.Street || assessment.homeInfo?.address?.street || '',
          streetNumber: assessment.HomeInfo?.Address?.StreetNumber || assessment.homeInfo?.address?.streetNumber || '',
          city: assessment.HomeInfo?.Address?.City || assessment.homeInfo?.address?.city || '',
          postalCode: assessment.HomeInfo?.Address?.PostalCode || assessment.homeInfo?.address?.postalCode || '',
          country: assessment.HomeInfo?.Address?.Country || assessment.homeInfo?.address?.country || ''
        },
        numberOfHighEnergyDevices: assessment.HomeInfo?.NumberOfHighEnergyDevices || assessment.homeInfo?.numberOfHighEnergyDevices || 0
      },
      vehicleInfo: {
        brand: assessment.VehicleInfo?.Brand || assessment.vehicleInfo?.brand || '',
        baseModel: assessment.VehicleInfo?.BaseModel || assessment.vehicleInfo?.baseModel || '',
        model: assessment.VehicleInfo?.Model || assessment.vehicleInfo?.model || '',
        year: assessment.VehicleInfo?.Year || assessment.vehicleInfo?.year || 0
      },
      electricalPanelInfo: {
        location: assessment.ElectricalPanelInfo?.Location || assessment.electricalPanelInfo?.location || '',
        mainBreakerCapacity: assessment.ElectricalPanelInfo?.MainBreakerCapacity || assessment.electricalPanelInfo?.mainBreakerCapacity || 0,
        numberOfOpenSlots: assessment.ElectricalPanelInfo?.NumberOfOpenSlots || assessment.electricalPanelInfo?.numberOfOpenSlots || 0
      },
      chargerInfo: {
        location: assessment.ChargerInfo?.Location || assessment.chargerInfo?.location || '',
        distanceFromPanelMeters: assessment.ChargerInfo?.DistanceFromPanelMeters || assessment.chargerInfo?.distanceFromPanelMeters || 0
      },
      evChargerInfo: {
        hasCharger: assessment.EvChargerInfo?.HasCharger || assessment.evChargerInfo?.hasCharger || false,
        wantsToBuy: assessment.EvChargerInfo?.WantsToBuy || assessment.evChargerInfo?.wantsToBuy || false,
        evCharger: {
          brand: assessment.EvChargerInfo?.EvCharger?.Brand || assessment.evChargerInfo?.evCharger?.brand || '',
          model: assessment.EvChargerInfo?.EvCharger?.Model || assessment.evChargerInfo?.evCharger?.model || '',
          powerKw: assessment.EvChargerInfo?.EvCharger?.PowerKw || assessment.evChargerInfo?.evCharger?.powerKw || 0
        }
      },
      currentPage: assessment.CurrentPage || assessment.currentPage || 0,
      isComplete: assessment.IsComplete || assessment.isComplete || false,
      createdAt: assessment.CreatedAt || assessment.createdAt,
      completedAt: assessment.CompletedAt || assessment.completedAt
    };
  }

  formatAssessmentFromAPI(apiAssessment) {
    // Transform backend assessment to frontend model
    return {
      id: apiAssessment.id,
      customerId: apiAssessment.customerId,
      PersonalInfo: {
        FirstName: apiAssessment.firstName || '',
        LastName: apiAssessment.lastName || '',
        Email: apiAssessment.email || '',
        Phone: apiAssessment.phone || ''
      },
      VehicleInfo: {
        Brand: apiAssessment.vehicleBrand || '',
        BaseModel: apiAssessment.vehicleBaseModel || '',
        Model: apiAssessment.vehicleModel || '',
        Year: apiAssessment.vehicleYear || new Date().getFullYear()
      },
      ElectricalPanelInfo: {
        Location: apiAssessment.electricalPanelLocation || '',
        MainBreakerCapacity: apiAssessment.mainBreakerCapacity || 0,
        NumberOfOpenSlots: apiAssessment.numberOfOpenSlots || 0
      },
      ChargerInfo: {
        Location: apiAssessment.chargerLocation || '',
        DistanceFromPanelMeters: apiAssessment.distanceFromPanelMeters || 0
      },
      HomeInfo: {
        Address: {
          Street: apiAssessment.street || '',
          StreetNumber: apiAssessment.streetNumber || '',
          City: apiAssessment.city || '',
          PostalCode: apiAssessment.postalCode || '',
          Country: apiAssessment.country || ''
        },
        NumberOfHighEnergyDevices: apiAssessment.numberOfHighEnergyDevices || 0
      },
      EvChargerInfo: {
        HasCharger: apiAssessment.hasCharger || false,
        WantsToBuy: apiAssessment.wantsToBuy || false,
        EvCharger: {
          Brand: apiAssessment.evChargerBrand || '',
          Model: apiAssessment.evChargerModel || '',
          PowerKw: apiAssessment.evChargerPowerKw || 0
        }
      },
      CurrentPage: apiAssessment.currentPage || 0,
      IsComplete: apiAssessment.isComplete || false,
      CreatedAt: apiAssessment.createdAt,
      UpdatedAt: apiAssessment.updatedAt
    };
  }

  // Error handling utility
  handleError(error, context = '') {
    console.error(`Admin Service Error ${context}:`, error);
    
    // You can add custom error handling logic here
    // For example, redirecting to login if token is expired
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    // Return user-friendly error messages
    const errorMessages = {
      'Network error': 'Connection problem. Please check your internet.',
      'HTTP 403': 'You do not have permission to perform this action.',
      'HTTP 404': 'The requested resource was not found.',
      'HTTP 500': 'Server error. Please try again later.'
    };

    return errorMessages[error.message] || error.message || 'An unexpected error occurred.';
  }
}

// Export singleton instance
const adminService = new AdminService();
export default adminService;