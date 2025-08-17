using home_charging_assessment.Models;
using home_charging_assessment.Models.DTOs;
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

        // Existing methods
        public Task<Assessment> CreateAsync(Assessment assessment)
        {
            return _repo.CreateAsync(assessment);
        }

        public Task<Assessment?> GetAsync(string id, string partitionKey)
        {
            return _repo.GetAsync(id, partitionKey);
        }

        public Task<Assessment?> UpdateAsync(string id, string partitionKey, Assessment updated)
        {
            return _repo.UpdateAsync(id, partitionKey, updated);
        }

        // New admin methods
        public async Task<PagedResult<AssessmentSummaryDto>> GetAssessmentsAsync(AssessmentFilterDto filters)
        {
            // Get all assessments (you'll need to add this method to repository)
            var allAssessments = await _repo.GetAllAssessmentsAsync();

            // Apply filters
            var filteredAssessments = ApplyFilters(allAssessments, filters);

            // Apply sorting
            filteredAssessments = ApplySorting(filteredAssessments, filters.SortBy, filters.SortOrder);

            // Calculate pagination
            var totalItems = filteredAssessments.Count();
            var totalPages = (int)Math.Ceiling((double)totalItems / filters.PageSize);
            var skip = (filters.Page - 1) * filters.PageSize;

            // Get page items
            var pageItems = filteredAssessments
                .Skip(skip)
                .Take(filters.PageSize)
                .Select(MapToSummaryDto)
                .ToList();

            return new PagedResult<AssessmentSummaryDto>
            {
                Items = pageItems,
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = filters.Page,
                PageSize = filters.PageSize
            };
        }

        public async Task<AssessmentStats> GetAssessmentStatsAsync()
        {
            var allAssessments = await _repo.GetAllAssessmentsAsync();

            var total = allAssessments.Count();
            var completed = allAssessments.Count(a => a.IsComplete);
            var incomplete = allAssessments.Count(a => !a.IsComplete && a.CurrentPage > 0);
            var abandoned = allAssessments.Count(a => !a.IsComplete && a.CurrentPage == 0);

            var completionRate = total > 0 ? (double)completed / total * 100 : 0;

            // Calculate average completion time for completed assessments
            var completedAssessments = allAssessments.Where(a => a.IsComplete && a.CompletedAt.HasValue).ToList();
            var avgCompletionTime = completedAssessments.Any()
                ? completedAssessments.Average(a => (a.CompletedAt!.Value - a.CreatedAt).TotalMinutes)
                : 0;

            // Top cities
            var topCities = allAssessments
                .Where(a => !string.IsNullOrEmpty(a.HomeInfo.Address.City))
                .GroupBy(a => a.HomeInfo.Address.City)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => new TopCityDto
                {
                    City = g.Key,
                    Count = g.Count(),
                    Percentage = total > 0 ? (double)g.Count() / total * 100 : 0
                })
                .ToList();

            // Top vehicle brands
            var topBrands = allAssessments
                .Where(a => !string.IsNullOrEmpty(a.VehicleInfo.Brand))
                .GroupBy(a => a.VehicleInfo.Brand)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => new TopVehicleBrandDto
                {
                    Brand = g.Key,
                    Count = g.Count(),
                    Percentage = total > 0 ? (double)g.Count() / total * 100 : 0
                })
                .ToList();

            return new AssessmentStats
            {
                Total = total,
                Completed = completed,
                Incomplete = incomplete,
                Abandoned = abandoned,
                CompletionRate = Math.Round(completionRate, 2),
                AverageCompletionTimeMinutes = Math.Round(avgCompletionTime, 2),
                TopCities = topCities,
                TopVehicleBrands = topBrands
            };
        }

        public async Task<DropOffAnalysis> GetDropOffAnalysisAsync()
        {
            var allAssessments = await _repo.GetAllAssessmentsAsync();

            return new DropOffAnalysis
            {
                Page0 = allAssessments.Count(a => !a.IsComplete && a.CurrentPage == 0),
                Page1 = allAssessments.Count(a => !a.IsComplete && a.CurrentPage == 1),
                Page2 = allAssessments.Count(a => !a.IsComplete && a.CurrentPage == 2),
                Page3 = allAssessments.Count(a => !a.IsComplete && a.CurrentPage == 3),
                Page4 = allAssessments.Count(a => !a.IsComplete && a.CurrentPage == 4),
                Page5 = allAssessments.Count(a => !a.IsComplete && a.CurrentPage == 5),
                Completed = allAssessments.Count(a => a.IsComplete)
            };
        }

        public async Task<ChartData> GetChartDataAsync()
        {
            var allAssessments = await _repo.GetAllAssessmentsAsync();

            // Completion trend (last 30 days)
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var completionTrend = GetCompletionTrend(allAssessments, thirtyDaysAgo);

            // Status distribution
            var statusDistribution = new StatusDistributionDto
            {
                Data = new List<int>
                {
                    allAssessments.Count(a => a.IsComplete),
                    allAssessments.Count(a => !a.IsComplete && a.CurrentPage > 0),
                    allAssessments.Count(a => !a.IsComplete && a.CurrentPage == 0)
                }
            };

            // Vehicle brands chart
            var vehicleBrands = allAssessments
                .Where(a => !string.IsNullOrEmpty(a.VehicleInfo.Brand))
                .GroupBy(a => a.VehicleInfo.Brand)
                .OrderByDescending(g => g.Count())
                .Take(10)
                .Select(g => new { Brand = g.Key, Count = g.Count() })
                .ToList();

            var vehicleBrandsChart = new VehicleBrandsChartDto
            {
                Labels = vehicleBrands.Select(v => v.Brand).ToList(),
                Data = vehicleBrands.Select(v => v.Count).ToList()
            };

            // Cities distribution
            var cities = allAssessments
                .Where(a => !string.IsNullOrEmpty(a.HomeInfo.Address.City))
                .GroupBy(a => a.HomeInfo.Address.City)
                .OrderByDescending(g => g.Count())
                .Take(10)
                .Select(g => new { City = g.Key, Count = g.Count() })
                .ToList();

            var citiesDistribution = new CitiesDistributionDto
            {
                Labels = cities.Select(c => c.City).ToList(),
                Data = cities.Select(c => c.Count).ToList()
            };

            // Monthly stats (last 12 months)
            var monthlyStats = GetMonthlyStats(allAssessments);

            return new ChartData
            {
                CompletionTrend = completionTrend,
                StatusDistribution = statusDistribution,
                VehicleBrands = vehicleBrandsChart,
                CitiesDistribution = citiesDistribution,
                MonthlyStats = monthlyStats
            };
        }

        public async Task<List<Assessment>> GetUserAssessmentsAsync(string userId)
        {
            // You'll need to add this method to repository
            return await _repo.GetAssessmentsByUserIdAsync(userId);
        }

        public async Task<byte[]> ExportAssessmentsAsync(ExportRequestDto request)
        {
            var assessments = await GetAssessmentsAsync(request.Filters);

            // Implementation for Excel/CSV export
            // You can use libraries like EPPlus for Excel or CsvHelper for CSV
            // For now, returning empty array
            return Array.Empty<byte>();
        }

        // Private helper methods
        private IEnumerable<Assessment> ApplyFilters(IEnumerable<Assessment> assessments, AssessmentFilterDto filters)
        {
            var query = assessments.AsQueryable();

            // Status filter
            if (!string.IsNullOrEmpty(filters.Status))
            {
                query = filters.Status.ToLower() switch
                {
                    "completed" => query.Where(a => a.IsComplete),
                    "incomplete" => query.Where(a => !a.IsComplete && a.CurrentPage > 0),
                    "abandoned" => query.Where(a => !a.IsComplete && a.CurrentPage == 0),
                    _ => query
                };
            }

            // Search filter (name, email)
            if (!string.IsNullOrEmpty(filters.Search))
            {
                var search = filters.Search.ToLower();
                query = query.Where(a =>
                    a.PersonalInfo.FirstName.ToLower().Contains(search) ||
                    a.PersonalInfo.LastName.ToLower().Contains(search) ||
                    a.PersonalInfo.Email.ToLower().Contains(search));
            }

            // Current page filter
            if (filters.CurrentPage.HasValue)
            {
                query = query.Where(a => a.CurrentPage == filters.CurrentPage.Value);
            }

            // City filter
            if (!string.IsNullOrEmpty(filters.City))
            {
                query = query.Where(a => a.HomeInfo.Address.City.ToLower().Contains(filters.City.ToLower()));
            }

            // Vehicle brand filter
            if (!string.IsNullOrEmpty(filters.VehicleBrand))
            {
                query = query.Where(a => a.VehicleInfo.Brand.ToLower().Contains(filters.VehicleBrand.ToLower()));
            }

            // Date filters
            if (filters.DateFrom.HasValue)
            {
                query = query.Where(a => a.CreatedAt >= filters.DateFrom.Value);
            }

            if (filters.DateTo.HasValue)
            {
                query = query.Where(a => a.CreatedAt <= filters.DateTo.Value.AddDays(1));
            }

            return query;
        }

        private IEnumerable<Assessment> ApplySorting(IEnumerable<Assessment> assessments, string sortBy, string sortOrder)
        {
            var isDescending = sortOrder.ToLower() == "desc";

            return sortBy.ToLower() switch
            {
                "firstname" => isDescending
                    ? assessments.OrderByDescending(a => a.PersonalInfo.FirstName)
                    : assessments.OrderBy(a => a.PersonalInfo.FirstName),
                "lastname" => isDescending
                    ? assessments.OrderByDescending(a => a.PersonalInfo.LastName)
                    : assessments.OrderBy(a => a.PersonalInfo.LastName),
                "email" => isDescending
                    ? assessments.OrderByDescending(a => a.PersonalInfo.Email)
                    : assessments.OrderBy(a => a.PersonalInfo.Email),
                "status" => isDescending
                    ? assessments.OrderByDescending(a => a.IsComplete)
                    : assessments.OrderBy(a => a.IsComplete),
                "currentpage" => isDescending
                    ? assessments.OrderByDescending(a => a.CurrentPage)
                    : assessments.OrderBy(a => a.CurrentPage),
                "createdat" or _ => isDescending
                    ? assessments.OrderByDescending(a => a.CreatedAt)
                    : assessments.OrderBy(a => a.CreatedAt)
            };
        }

        private AssessmentSummaryDto MapToSummaryDto(Assessment assessment)
        {
            return new AssessmentSummaryDto
            {
                Id = assessment.Id ?? string.Empty,
                CustomerId = assessment.CustomerId ?? string.Empty,
                FirstName = assessment.PersonalInfo.FirstName,
                LastName = assessment.PersonalInfo.LastName,
                Email = assessment.PersonalInfo.Email,
                Phone = assessment.PersonalInfo.Phone,
                VehicleBrand = assessment.VehicleInfo.Brand,
                VehicleModel = assessment.VehicleInfo.Model,
                VehicleYear = assessment.VehicleInfo.Year ?? 0,
                City = assessment.HomeInfo.Address.City,
                Country = assessment.HomeInfo.Address.Country,
                CurrentPage = assessment.CurrentPage,
                IsComplete = assessment.IsComplete,
                CreatedAt = assessment.CreatedAt,
                CompletedAt = assessment.CompletedAt,
                CompletionTimeMinutes = assessment.CompletedAt.HasValue
                    ? (int)(assessment.CompletedAt.Value - assessment.CreatedAt).TotalMinutes
                    : null
            };
        }

        private CompletionTrendDto GetCompletionTrend(IEnumerable<Assessment> assessments, DateTime fromDate)
        {
            var completedAssessments = assessments
                .Where(a => a.IsComplete && a.CompletedAt.HasValue && a.CompletedAt >= fromDate)
                .GroupBy(a => a.CompletedAt!.Value.Date)
                .OrderBy(g => g.Key)
                .ToDictionary(g => g.Key, g => g.Count());

            var labels = new List<string>();
            var data = new List<int>();

            for (var date = fromDate.Date; date <= DateTime.UtcNow.Date; date = date.AddDays(1))
            {
                labels.Add(date.ToString("MM/dd"));
                data.Add(completedAssessments.GetValueOrDefault(date, 0));
            }

            return new CompletionTrendDto
            {
                Labels = labels,
                Data = data
            };
        }

        private MonthlyStatsDto GetMonthlyStats(IEnumerable<Assessment> assessments)
        {
            var monthlyData = assessments
                .GroupBy(a => new { Year = a.CreatedAt.Year, Month = a.CreatedAt.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Take(12)
                .Select(g => new
                {
                    Label = $"{g.Key.Year}/{g.Key.Month:D2}",
                    Started = g.Count(),
                    Completed = g.Count(a => a.IsComplete)
                })
                .ToList();

            return new MonthlyStatsDto
            {
                Labels = monthlyData.Select(m => m.Label).ToList(),
                Started = monthlyData.Select(m => m.Started).ToList(),
                Completed = monthlyData.Select(m => m.Completed).ToList()
            };
        }
    }
}