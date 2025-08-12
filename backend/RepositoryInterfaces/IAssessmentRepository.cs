using home_charging_assessment.Models;

namespace home_charging_assessment.RepositoryInterfaces
{
    public interface IAssessmentRepository
    {
        Task<Assessment> CreateAsync(Assessment assessment);
        Task<Assessment?> GetAsync(string id, string partitionKey);
    }
}
