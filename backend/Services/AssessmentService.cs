using home_charging_assessment.Models;
using home_charging_assessment.RepositoryInterfaces;
using home_charging_assessment.ServiceInterfaces;

namespace home_charging_assessment.Services
{
    public class AssessmentService : IAssessmentService
    {
        private readonly IAssessmentRepository _repo;

        public AssessmentService(IAssessmentRepository repo)
        {
            _repo = repo;
        }

        public Task<Assessment> CreateAsync(Assessment assessment)
        {
            return _repo.CreateAsync(assessment);
        }

        public Task<Assessment?> GetAsync(string id, string partitionKey)
        {
            return _repo.GetAsync(id, partitionKey);
        }
    }
}
