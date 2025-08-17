using home_charging_assessment.Models;

namespace home_charging_assessment.RepositoryInterfaces
{
    public interface IAssessmentRepository
    {
        Task<Assessment> CreateAsync(Assessment assessment);
        Task<Assessment?> GetAsync(string id, string partitionKey);
        Task<Assessment?> UpdateAsync(string id, string partitionKey, Assessment updated);

        // New methods needed for admin functionality
        Task<List<Assessment>> GetAllAssessmentsAsync();
        Task<List<Assessment>> GetAssessmentsByUserIdAsync(string userId);
        Task<bool> DeleteAsync(string id, string partitionKey);

        // Optional: More specific query methods for better performance
        Task<List<Assessment>> GetAssessmentsByStatusAsync(string status);
        Task<List<Assessment>> GetAssessmentsByDateRangeAsync(DateTime fromDate, DateTime toDate);
        Task<int> GetAssessmentCountAsync();
        Task<List<Assessment>> GetCompletedAssessmentsAsync();
        Task<List<Assessment>> GetIncompleteAssessmentsAsync();
        Task<List<Assessment>> GetAbandonedAssessmentsAsync();

    }
}
