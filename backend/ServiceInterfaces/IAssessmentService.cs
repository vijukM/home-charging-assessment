using home_charging_assessment.Models;
using home_charging_assessment.Models.DTOs;

namespace home_charging_assessment.ServiceInterfaces
{
    public interface IAssessmentService
    {
        Task<Assessment> CreateAsync(Assessment assessment);
        Task<Assessment?> GetAsync(string id, string partitionKey);
        Task<Assessment> UpdateAsync(string id, string partitionKey, Assessment updated);

        Task<PagedResult<AssessmentSummaryDto>> GetAssessmentsAsync(AssessmentFilterDto filters);
        Task<AssessmentStats> GetAssessmentStatsAsync();
        Task<DropOffAnalysis> GetDropOffAnalysisAsync();
        Task<ChartData> GetChartDataAsync();

        Task<List<Assessment>> GetUserAssessmentsAsync(string userId);

        Task<byte[]> ExportAssessmentsAsync(ExportRequestDto request);

    }
}
