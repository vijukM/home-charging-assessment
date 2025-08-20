// Models/DTOs/AssessmentDtos.cs
using System.ComponentModel.DataAnnotations;

namespace home_charging_assessment.Models.DTOs
{
    // Paged result wrapper
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public bool HasNextPage => CurrentPage < TotalPages;
        public bool HasPreviousPage => CurrentPage > 1;
    }

    // Assessment filter parameters
    public class AssessmentFilterDto
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Status { get; set; } // "completed", "incomplete", "abandoned"
        public string? Search { get; set; } // Search by name, email
        public int? CurrentPage { get; set; } // Filter by assessment page
        public string? City { get; set; }
        public string? VehicleBrand { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string SortBy { get; set; } = "CreatedAt";
        public string SortOrder { get; set; } = "desc"; // "asc" or "desc"
    }
    public class TopEvChargerBrandDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }
    // Assessment statistics
    public class AssessmentStats
    {
        public int Total { get; set; }
        public int Completed { get; set; }
        public int Incomplete { get; set; }
        public int Abandoned { get; set; }
        public double CompletionRate { get; set; }
        public double AverageCompletionTimeMinutes { get; set; }
        public List<TopCityDto> TopCities { get; set; } = new List<TopCityDto>();
        public List<TopVehicleBrandDto> TopVehicleBrands { get; set; } = new List<TopVehicleBrandDto>();
        public List<TopEvChargerBrandDto> TopEvChargerBrands { get; set; } = new List<TopEvChargerBrandDto>();
        public List<TopEvChargerBrandDto> TopExistingEvChargerBrands { get; set; } = new List<TopEvChargerBrandDto>();
    }

    // Drop-off analysis data
    public class DropOffAnalysis
    {
        public int Page1 { get; set; } // Dropped at Personal Info
        public int Page2 { get; set; } // Dropped at Vehicle Info
        public int Page3 { get; set; } // Dropped at Electrical Panel
        public int Page4 { get; set; } // Dropped at Charger Info
        public int Page5 { get; set; } // Dropped at Home Info
        public int Completed { get; set; } // Successfully completed

        public List<DropOffPageDto> PageBreakdown => new()
        {
            new DropOffPageDto { PageNumber = 1, PageName = "Personal Info", Count = Page1 },
            new DropOffPageDto { PageNumber = 2, PageName = "Vehicle Info", Count = Page2 },
            new DropOffPageDto { PageNumber = 3, PageName = "Electrical Panel", Count = Page3 },
            new DropOffPageDto { PageNumber = 4, PageName = "Charger Info", Count = Page4 },
            new DropOffPageDto { PageNumber = 5, PageName = "Home Info", Count = Page5 },
            new DropOffPageDto { PageNumber = 6, PageName = "Completed", Count = Completed }
        };
    }

    // Chart data for frontend
    public class ChartData
    {
        public CompletionTrendDto CompletionTrend { get; set; } = new();
        public StatusDistributionDto StatusDistribution { get; set; } = new();
        public VehicleBrandsChartDto VehicleBrands { get; set; } = new();
        public CitiesDistributionDto CitiesDistribution { get; set; } = new();
        public MonthlyStatsDto MonthlyStats { get; set; } = new();
        public EvChargerDistributionDto EvChargerDistribution { get; set; } = new(); 

    }
    public class EvChargerDistributionDto
    {
        public List<string> Labels { get; set; } = new() { "Already Have", "Want to Buy", "Don't Want" };
        public List<int> Data { get; set; } = new();
        public List<string> BackgroundColors { get; set; } = new()
    {
        "#22c55e", // Green for "Already Have"
        "#3b82f6", // Blue for "Want to Buy"  
        "#ef4444"  // Red for "Don't Want"
    };
    }   
    // Supporting DTOs
    public class TopCityDto
    {
        public string City { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class TopVehicleBrandDto
    {
        public string Brand { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class DropOffPageDto
    {
        public int PageNumber { get; set; }
        public string PageName { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class CompletionTrendDto
    {
        public List<string> Labels { get; set; } = new(); // Dates
        public List<int> Data { get; set; } = new(); // Completion counts
    }

    public class StatusDistributionDto
    {
        public List<string> Labels { get; set; } = new() { "Completed", "In Progress", "Abandoned" };
        public List<int> Data { get; set; } = new();
        public List<string> BackgroundColors { get; set; } = new()
        {
            "#22c55e", // Green for completed
            "#f59e0b", // Orange for in progress  
            "#ef4444"  // Red for abandoned
        };
    }

    public class VehicleBrandsChartDto
    {
        public List<string> Labels { get; set; } = new(); // Brand names
        public List<int> Data { get; set; } = new(); // Counts
    }

    public class CitiesDistributionDto
    {
        public List<string> Labels { get; set; } = new(); // City names
        public List<int> Data { get; set; } = new(); // Counts
        public List<string> BackgroundColors { get; set; } = new()
        {
            "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
            "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#6366f1"
        };
    }

    public class MonthlyStatsDto
    {
        public List<string> Labels { get; set; } = new(); // Month names
        public List<int> Completed { get; set; } = new(); // Completed per month
        public List<int> Started { get; set; } = new(); // Started per month
    }

    // Export request DTO
    public class ExportRequestDto
    {
        public AssessmentFilterDto Filters { get; set; } = new();
        public string Format { get; set; } = "xlsx"; // "xlsx", "csv"
        public List<string> Columns { get; set; } = new(); // Which columns to export
    }

    // Assessment summary DTO for table display
    public class AssessmentSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string CustomerId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string VehicleBrand { get; set; } = string.Empty;
        public string VehicleModel { get; set; } = string.Empty;
        public int VehicleYear { get; set; }
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int CurrentPage { get; set; }
        public bool IsComplete { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? CompletionTimeMinutes { get; set; }

        // Computed properties
        public string Status => IsComplete ? "completed" :
                               CurrentPage == 0 ? "abandoned" : "incomplete";
        public string FullName => $"{FirstName} {LastName}".Trim();
        public string Vehicle => !string.IsNullOrEmpty(VehicleBrand)
            ? $"{VehicleBrand} {VehicleModel} ({VehicleYear})"
            : string.Empty;
    }
}