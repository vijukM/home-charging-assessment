// src/types/adminTypes.js

/**
 * Assessment Filter DTO for API calls
 */
export const createAssessmentFilterDto = ({
  page = 1,
  pageSize = 10,
  status = '',
  search = '',
  currentPageFilter = '',
  city = '',
  vehicleBrand = '',
  dateFrom = '',
  dateTo = '',
  sortBy = 'createdAt',
  sortOrder = 'desc'
} = {}) => ({
  page,
  pageSize,
  status,
  search,
  currentPageFilter,
  city,
  vehicleBrand,
  dateFrom,
  dateTo,
  sortBy,
  sortOrder
});

/**
 * Export Request DTO
 */
export const createExportRequestDto = ({
  format = 'xlsx',
  filters = {},
  columns = ['firstName', 'lastName', 'email', 'status', 'city', 'vehicleBrand'],
  includeHeaders = true,
  dateRange = null
} = {}) => ({
  format,
  filters,
  columns,
  includeHeaders,
  dateRange
});

/**
 * Bulk Action DTO
 */
export const createBulkActionDto = ({
  action = '',
  assessmentIds = [],
  parameters = {}
} = {}) => ({
  action,
  assessmentIds,
  parameters
});

/**
 * User DTO for admin management
 */
export const createUserDto = ({
  id = '',
  username = '',
  email = '',
  emailVerified = false,
  roles = [],
  createdAt = null,
  lastLogin = null,
  isActive = true
} = {}) => ({
  id,
  username,
  email,
  emailVerified,
  roles,
  createdAt,
  lastLogin,
  isActive
});

/**
 * Update User Roles DTO
 */
export const createUpdateUserRolesDto = ({
  roles = []
} = {}) => ({
  roles
});

/**
 * Assessment Stats DTO structure
 */
export const createAssessmentStatsDto = () => ({
  total: 0,
  completed: 0,
  incomplete: 0,
  abandoned: 0,
  completionRate: 0,
  averageCompletionTimeMinutes: 0,
  topCities: [],
  topVehicleBrands: [],
  monthlyTrends: [],
  dailyActivity: []
});

/**
 * Chart Data DTO structure
 */
export const createChartDataDto = () => ({
  statusDistribution: {
    completed: 0,
    incomplete: 0,
    abandoned: 0
  },
  monthlyCompletions: [],
  cityDistribution: [],
  vehicleBrandDistribution: [],
  timeSeriesData: []
});

/**
 * Drop-off Analysis DTO structure
 */
export const createDropOffAnalysisDto = () => ({
  pageBreakdown: [],
  totalDropOffs: 0,
  criticalDropOffPoints: [],
  averageTimePerPage: [],
  completionFunnel: []
});

/**
 * Dashboard Summary DTO structure
 */
export const createDashboardSummaryDto = () => ({
  kpis: {
    totalAssessments: 0,
    completedAssessments: 0,
    incompleteAssessments: 0,
    abandonedAssessments: 0,
    completionRate: 0,
    averageCompletionTime: 0
  },
  topData: {
    topCities: [],
    topVehicleBrands: []
  },
  chartSummary: {
    statusDistribution: {},
    dropOffBreakdown: []
  }
});

/**
 * Paginated Response DTO structure
 */
export const createPaginatedResponseDto = ({
  items = [],
  totalItems = 0,
  totalPages = 0,
  currentPage = 1,
  pageSize = 10,
  hasNextPage = false,
  hasPreviousPage = false
} = {}) => ({
  items,
  totalItems,
  totalPages,
  currentPage,
  pageSize,
  hasNextPage,
  hasPreviousPage
});

/**
 * System Health DTO structure
 */
export const createSystemHealthDto = () => ({
  status: 'unknown',
  timestamp: null,
  version: '',
  uptime: null,
  metrics: {
    totalAssessments: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    topCitiesCount: 0,
    topBrandsCount: 0
  }
});

/**
 * API Response wrapper
 */
export const createApiResponse = ({
  success = false,
  data = null,
  message = '',
  error = null,
  timestamp = new Date().toISOString()
} = {}) => ({
  success,
  data,
  message,
  error,
  timestamp
});

/**
 * Assessment model transformation utilities
 */
export const AssessmentTransformers = {
  /**
   * Transform frontend assessment model to backend DTO
   */
  toBackendDto: (frontendAssessment) => ({
    id: frontendAssessment.id,
    customerId: frontendAssessment.customerId,
    firstName: frontendAssessment.PersonalInfo?.FirstName || '',
    lastName: frontendAssessment.PersonalInfo?.LastName || '',
    email: frontendAssessment.PersonalInfo?.Email || '',
    phone: frontendAssessment.PersonalInfo?.Phone || '',
    vehicleBrand: frontendAssessment.VehicleInfo?.Brand || '',
    vehicleBaseModel: frontendAssessment.VehicleInfo?.BaseModel || '',
    vehicleModel: frontendAssessment.VehicleInfo?.Model || '',
    vehicleYear: frontendAssessment.VehicleInfo?.Year || new Date().getFullYear(),
    electricalPanelLocation: frontendAssessment.ElectricalPanelInfo?.Location || '',
    mainBreakerCapacity: frontendAssessment.ElectricalPanelInfo?.MainBreakerCapacity || 0,
    numberOfOpenSlots: frontendAssessment.ElectricalPanelInfo?.NumberOfOpenSlots || 0,
    chargerLocation: frontendAssessment.ChargerInfo?.Location || '',
    distanceFromPanelMeters: frontendAssessment.ChargerInfo?.DistanceFromPanelMeters || 0,
    street: frontendAssessment.HomeInfo?.Address?.Street || '',
    streetNumber: frontendAssessment.HomeInfo?.Address?.StreetNumber || '',
    city: frontendAssessment.HomeInfo?.Address?.City || '',
    postalCode: frontendAssessment.HomeInfo?.Address?.PostalCode || '',
    country: frontendAssessment.HomeInfo?.Address?.Country || '',
    numberOfHighEnergyDevices: frontendAssessment.HomeInfo?.NumberOfHighEnergyDevices || 0,
    hasCharger: frontendAssessment.EvChargerInfo?.HasCharger || false,
    wantsToBuy: frontendAssessment.EvChargerInfo?.WantsToBuy || false,
    evChargerBrand: frontendAssessment.EvChargerInfo?.EvCharger?.Brand || '',
    evChargerModel: frontendAssessment.EvChargerInfo?.EvCharger?.Model || '',
    evChargerPowerKw: frontendAssessment.EvChargerInfo?.EvCharger?.PowerKw || 0,
    currentPage: frontendAssessment.CurrentPage || 0,
    isComplete: frontendAssessment.IsComplete || false
  }),

  /**
   * Transform backend DTO to frontend assessment model
   */
  toFrontendModel: (backendDto) => ({
    id: backendDto.id,
    customerId: backendDto.customerId,
    PersonalInfo: {
      FirstName: backendDto.firstName || '',
      LastName: backendDto.lastName || '',
      Email: backendDto.email || '',
      Phone: backendDto.phone || ''
    },
    VehicleInfo: {
      Brand: backendDto.vehicleBrand || '',
      BaseModel: backendDto.vehicleBaseModel || '',
      Model: backendDto.vehicleModel || '',
      Year: backendDto.vehicleYear || new Date().getFullYear()
    },
    ElectricalPanelInfo: {
      Location: backendDto.electricalPanelLocation || '',
      MainBreakerCapacity: backendDto.mainBreakerCapacity || 0,
      NumberOfOpenSlots: backendDto.numberOfOpenSlots || 0
    },
    ChargerInfo: {
      Location: backendDto.chargerLocation || '',
      DistanceFromPanelMeters: backendDto.distanceFromPanelMeters || 0
    },
    HomeInfo: {
      Address: {
        Street: backendDto.street || '',
        StreetNumber: backendDto.streetNumber || '',
        City: backendDto.city || '',
        PostalCode: backendDto.postalCode || '',
        Country: backendDto.country || ''
      },
      NumberOfHighEnergyDevices: backendDto.numberOfHighEnergyDevices || 0
    },
    EvChargerInfo: {
      HasCharger: backendDto.hasCharger || false,
      WantsToBuy: backendDto.wantsToBuy || false,
      EvCharger: {
        Brand: backendDto.evChargerBrand || '',
        Model: backendDto.evChargerModel || '',
        PowerKw: backendDto.evChargerPowerKw || 0
      }
    },
    CurrentPage: backendDto.currentPage || 0,
    IsComplete: backendDto.isComplete || false,
    CreatedAt: backendDto.createdAt,
    UpdatedAt: backendDto.updatedAt,
    // Additional metadata fields
    LastActivity: backendDto.lastActivity,
    CompletionTime: backendDto.completionTime,
    IpAddress: backendDto.ipAddress,
    UserAgent: backendDto.userAgent
  })
};

/**
 * Validation utilities
 */
export const Validators = {
  /**
   * Validate assessment filter parameters
   */
  validateAssessmentFilter: (filter) => {
    const errors = [];
    
    if (filter.page && (filter.page < 1 || !Number.isInteger(filter.page))) {
      errors.push('Page must be a positive integer');
    }
    
    if (filter.pageSize && (filter.pageSize < 1 || filter.pageSize > 100)) {
      errors.push('Page size must be between 1 and 100');
    }
    
    if (filter.status && !['completed', 'incomplete', 'abandoned'].includes(filter.status)) {
      errors.push('Status must be one of: completed, incomplete, abandoned');
    }
    
    if (filter.sortBy && !['createdAt', 'updatedAt', 'firstName', 'lastName', 'city'].includes(filter.sortBy)) {
      errors.push('Invalid sort field');
    }
    
    if (filter.sortOrder && !['asc', 'desc'].includes(filter.sortOrder)) {
      errors.push('Sort order must be asc or desc');
    }
    
    if (filter.dateFrom && filter.dateTo && new Date(filter.dateFrom) > new Date(filter.dateTo)) {
      errors.push('Date from must be before date to');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate export request parameters
   */
  validateExportRequest: (request) => {
    const errors = [];
    
    if (!['csv', 'xlsx'].includes(request.format)) {
      errors.push('Format must be csv or xlsx');
    }
    
    if (!Array.isArray(request.columns) || request.columns.length === 0) {
      errors.push('Columns must be a non-empty array');
    }
    
    const validColumns = [
      'firstName', 'lastName', 'email', 'phone', 'status', 'city', 
      'vehicleBrand', 'vehicleModel', 'createdAt', 'currentPage'
    ];
    
    const invalidColumns = request.columns.filter(col => !validColumns.includes(col));
    if (invalidColumns.length > 0) {
      errors.push(`Invalid columns: ${invalidColumns.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate bulk action request
   */
  validateBulkAction: (request) => {
    const errors = [];
    
    if (!['delete', 'archive', 'export'].includes(request.action)) {
      errors.push('Action must be one of: delete, archive, export');
    }
    
    if (!Array.isArray(request.assessmentIds) || request.assessmentIds.length === 0) {
      errors.push('Assessment IDs must be a non-empty array');
    }
    
    if (request.assessmentIds.length > 1000) {
      errors.push('Cannot perform bulk action on more than 1000 items at once');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Constants for admin module
 */
export const AdminConstants = {
  ASSESSMENT_STATUS: {
    COMPLETED: 'completed',
    INCOMPLETE: 'incomplete',
    ABANDONED: 'abandoned'
  },
  
  EXPORT_FORMATS: {
    CSV: 'csv',
    XLSX: 'xlsx'
  },
  
  BULK_ACTIONS: {
    DELETE: 'delete',
    ARCHIVE: 'archive',
    EXPORT: 'export'
  },
  
  SORT_FIELDS: {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    CITY: 'city',
    STATUS: 'status'
  },
  
  SORT_ORDERS: {
    ASC: 'asc',
    DESC: 'desc'
  },
  
  DEFAULT_PAGE_SIZES: [10, 25, 50, 100],
  
  MAX_EXPORT_ITEMS: 10000,
  MAX_BULK_ACTION_ITEMS: 1000
};

export default {
  createAssessmentFilterDto,
  createExportRequestDto,
  createBulkActionDto,
  createUserDto,
  createUpdateUserRolesDto,
  createAssessmentStatsDto,
  createChartDataDto,
  createDropOffAnalysisDto,
  createDashboardSummaryDto,
  createPaginatedResponseDto,
  createSystemHealthDto,
  createApiResponse,
  AssessmentTransformers,
  Validators,
  AdminConstants
};