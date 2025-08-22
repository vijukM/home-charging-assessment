using home_charging_assessment.Models;
using home_charging_assessment.Models.DTOs;
using home_charging_assessment.Repositories;
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
            if (updated.IsComplete && updated.CompletedAt == null)
            {
                updated.CompletedAt = DateTime.UtcNow;
            }
            return _repo.UpdateAsync(id, partitionKey, updated);
        }

        public async Task<bool> DeleteAsync(string id, string partitionKey)
        {
            return await _repo.DeleteAsync(id, partitionKey);
        }

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
        public async Task<Assessment?> GetIncompleteAssessmentByUserIdAsync(string userId)
        {
            try
            {
                var userAssessments = await _repo.GetAssessmentsByUserIdAsync(userId);
                var incompleteAssessment = userAssessments
                    .Where(a => !a.IsComplete)
                    .OrderByDescending(a => a.CreatedAt)
                    .FirstOrDefault();
                return incompleteAssessment;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting incomplete assessment for user {userId}: {ex.Message}");
            }
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
                .Select(a => a.HomeInfo?.Address?.City)
                .Where(city => !string.IsNullOrEmpty(city))
                .GroupBy(city => city)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => new TopCityDto
                {
                    City = g.Key,
                    Count = g.Count(),
                    Percentage = total > 0 ? (double)g.Count() / total * 100 : 0
                })
                .ToList();

            // Top vehicle brands - safe approach
            var topBrands = allAssessments
                .Select(a => a.VehicleInfo?.Brand)
                .Where(brand => !string.IsNullOrEmpty(brand))
                .GroupBy(brand => brand)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => new TopVehicleBrandDto
                {
                    Brand = g.Key,
                    Count = g.Count(),
                    Percentage = total > 0 ? (double)g.Count() / total * 100 : 0
                })
                .ToList();
            var topWantedChargers = allAssessments
                .Where(a => a.EvChargerInfo != null && a.EvChargerInfo.WantsToBuy == true)
                .Select(a => a.EvChargerInfo.EvCharger?.Brand)
                .Where(brand => !string.IsNullOrEmpty(brand))
                .GroupBy(brand => brand)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => new TopEvChargerBrandDto
                {
                    Name = g.Key,
                    Count = g.Count(),
                    Percentage = total > 0 ? (double)g.Count() / total * 100 : 0
                })
                .ToList();

            var topExistingChargers = allAssessments
                .Where(a => a.EvChargerInfo != null && a.EvChargerInfo.HasCharger == true)
                .Select(a => a.EvChargerInfo.EvCharger?.Brand)
                .Where(brand => !string.IsNullOrEmpty(brand))
                .GroupBy(brand => brand)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => new TopEvChargerBrandDto
                {
                    Name = g.Key,
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
                TopVehicleBrands = topBrands,
                TopEvChargerBrands = topWantedChargers,           // NOVO
                TopExistingEvChargerBrands = topExistingChargers  // NOVO
            };
        }

        public async Task<DropOffAnalysis> GetDropOffAnalysisAsync()
        {
            var allAssessments = await _repo.GetAllAssessmentsAsync();

            return new DropOffAnalysis
            {
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

            //  Vehicle brands chart - FIXED
            var vehicleBrands = allAssessments
                .Select(a => a.VehicleInfo?.Brand)
                .Where(brand => !string.IsNullOrEmpty(brand))
                .GroupBy(brand => brand)
                .OrderByDescending(g => g.Count())
                .Take(10)
                .Select(g => new { Brand = g.Key, Count = g.Count() })
                .ToList();
            var vehicleBrandsChart = new VehicleBrandsChartDto
            {
                Labels = vehicleBrands.Select(v => v.Brand).ToList(),
                Data = vehicleBrands.Select(v => v.Count).ToList()
            };

            //  Cities distribution - FIXED
            var cities = allAssessments
                .Select(a => a.HomeInfo?.Address?.City)
                .Where(city => !string.IsNullOrEmpty(city))
                .GroupBy(city => city)
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


            var completedAssessments = allAssessments.Where(a => a.IsComplete).ToList();

            var alreadyHave = completedAssessments.Count(a =>
                a.EvChargerInfo != null && a.EvChargerInfo.HasCharger == true);

            var wantToBuy = completedAssessments.Count(a =>
                a.EvChargerInfo != null &&
                a.EvChargerInfo.HasCharger == false &&
                a.EvChargerInfo.WantsToBuy == true);

            var dontWant = completedAssessments.Count(a =>
                a.EvChargerInfo.HasCharger == false &&
                a.EvChargerInfo.WantsToBuy == false);

            var evChargerDistribution = new EvChargerDistributionDto
            {
                Data = new List<int> { alreadyHave, wantToBuy, dontWant }
            };

            return new ChartData
            {
                CompletionTrend = completionTrend,
                StatusDistribution = statusDistribution,
                VehicleBrands = vehicleBrandsChart,
                CitiesDistribution = citiesDistribution,
                MonthlyStats = monthlyStats,
                EvChargerDistribution = evChargerDistribution 
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

        // Private helper methods - FIXED WITH NULL SAFETY
        private IEnumerable<Assessment> ApplyFilters(IEnumerable<Assessment> assessments, AssessmentFilterDto filters)
        {
            var query = assessments;

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

            // Search filter (name, email) - FIXED
            if (!string.IsNullOrEmpty(filters.Search))
            {
                var search = filters.Search.ToLower();
                query = query.Where(a =>
                    (a.PersonalInfo?.FirstName != null && a.PersonalInfo.FirstName.ToLower().Contains(search)) ||
                    (a.PersonalInfo?.LastName != null && a.PersonalInfo.LastName.ToLower().Contains(search)) ||
                    (a.PersonalInfo?.Email != null && a.PersonalInfo.Email.ToLower().Contains(search)));
            }

            // Current page filter
            if (filters.CurrentPage.HasValue)
            {
                query = query.Where(a => a.CurrentPage == filters.CurrentPage.Value);
            }

            // City filter - FIXED
            if (!string.IsNullOrEmpty(filters.City))
            {
                query = query.Where(a => a.HomeInfo != null &&
                                        a.HomeInfo.Address != null &&
                                        a.HomeInfo.Address.City != null &&
                                        a.HomeInfo.Address.City.ToLower().Contains(filters.City.ToLower()));
            }

            // Vehicle brand filter - FIXED
            if (!string.IsNullOrEmpty(filters.VehicleBrand))
            {
                query = query.Where(a => a.VehicleInfo != null &&
                                        a.VehicleInfo.Brand != null &&
                                        a.VehicleInfo.Brand.ToLower().Contains(filters.VehicleBrand.ToLower()));
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

        // FIXED WITH NULL SAFETY
        private IEnumerable<Assessment> ApplySorting(IEnumerable<Assessment> assessments, string sortBy, string sortOrder)
        {
            var isDescending = sortOrder.ToLower() == "desc";

            return sortBy.ToLower() switch
            {
                "firstname" => isDescending
                    ? assessments.OrderByDescending(a => a.PersonalInfo?.FirstName ?? string.Empty)
                    : assessments.OrderBy(a => a.PersonalInfo?.FirstName ?? string.Empty),
                "lastname" => isDescending
                    ? assessments.OrderByDescending(a => a.PersonalInfo?.LastName ?? string.Empty)
                    : assessments.OrderBy(a => a.PersonalInfo?.LastName ?? string.Empty),
                "email" => isDescending
                    ? assessments.OrderByDescending(a => a.PersonalInfo?.Email ?? string.Empty)
                    : assessments.OrderBy(a => a.PersonalInfo?.Email ?? string.Empty),
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

        // FIXED WITH NULL SAFETY
        private AssessmentSummaryDto MapToSummaryDto(Assessment assessment)
        {
            return new AssessmentSummaryDto
            {
                Id = assessment.Id ?? string.Empty,
                CustomerId = assessment.CustomerId ?? string.Empty,
                FirstName = assessment.PersonalInfo?.FirstName ?? string.Empty,
                LastName = assessment.PersonalInfo?.LastName ?? string.Empty,
                Email = assessment.PersonalInfo?.Email ?? string.Empty,
                Phone = assessment.PersonalInfo?.Phone ?? string.Empty,
                VehicleBrand = assessment.VehicleInfo?.Brand ?? string.Empty,
                VehicleModel = assessment.VehicleInfo?.Model ?? string.Empty,
                VehicleYear = assessment.VehicleInfo?.Year ?? 0,
                City = assessment.HomeInfo?.Address?.City ?? string.Empty,
                Country = assessment.HomeInfo?.Address?.Country ?? string.Empty,
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