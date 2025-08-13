using home_charging_assessment.Models;

namespace home_charging_assessment.ServiceInterfaces
{
    public interface IAssessmentService
    {
        Task<Assessment> CreateAsync(Assessment assessment);
        Task<Assessment?> GetAsync(string id, string partitionKey);
        Task<Assessment> UpdateAsync(string id, string partitionKey, Assessment updated);

    }
}
