import authService from './authService';

const API_BASE_URL = 'http://localhost:5092/api'; // Tvoj backend
class AssessmentService {
  // Get auth headers with JWT token
  getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Create assessment
  async createAssessment(assessmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/assessment`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to create an assessment');
        }
        throw new Error(`Failed to create assessment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Get assessment by ID
  async getAssessment(id, partitionKey) {
    try {
      const response = await fetch(`${API_BASE_URL}/assessment/${id}?partitionKey=${partitionKey}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view assessments');
        }
        throw new Error(`Failed to get assessment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Update assessment
  async updateAssessment(id, partitionKey, assessmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/assessment/${id}?partitionKey=${partitionKey}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to update assessments');
        }
        throw new Error(`Failed to update assessment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Get user's assessments
  async getMyAssessments() {
    try {
      const response = await fetch(`${API_BASE_URL}/assessment/my-assessments`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your assessments');
        }
        throw new Error(`Failed to get assessments: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default new AssessmentService();
