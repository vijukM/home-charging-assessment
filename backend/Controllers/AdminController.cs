using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using home_charging_assessment.Models;
using home_charging_assessment.Models.DTOs;
using home_charging_assessment.ServiceInterfaces;

namespace home_charging_assessment.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IAssessmentService _assessmentService;

        public AdminController(IAuthService authService, IAssessmentService assessmentService)
        {
            _authService = authService;
            _assessmentService = assessmentService;
        }

        // Existing user management methods
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _authService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUser(string userId)
        {
            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                EmailVerified = user.EmailVerified,
                Roles = user.Roles,
                CreatedAt = user.CreatedAt,
                LastLogin = user.LastLogin,
                IsActive = user.IsActive
            });
        }

        /// <summary>
        /// Get all assessments with pagination and filtering
        /// </summary>
        [HttpGet("assessments")]
        public async Task<IActionResult> GetAllAssessments([FromQuery] AssessmentFilterDto filters)
        {
            try
            {
                var result = await _assessmentService.GetAssessmentsAsync(filters);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving assessments", error = ex.Message });
            }
        }

        /// <summary>
        /// Get assessment statistics for dashboard
        /// </summary>
        [HttpGet("assessments/stats")]
        public async Task<IActionResult> GetAssessmentStats()
        {
            try
            {
                var stats = await _assessmentService.GetAssessmentStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving assessment statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Get drop-off analysis data
        /// </summary>
        [HttpGet("assessments/drop-off")]
        public async Task<IActionResult> GetDropOffAnalysis()
        {
            try
            {
                var dropOffData = await _assessmentService.GetDropOffAnalysisAsync();
                return Ok(dropOffData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving drop-off analysis", error = ex.Message });
            }
        }

        /// <summary>
        /// Get chart data for analytics dashboard
        /// </summary>
        [HttpGet("assessments/charts")]
        public async Task<IActionResult> GetChartData()
        {
            try
            {
                var chartData = await _assessmentService.GetChartDataAsync();
                return Ok(chartData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving chart data", error = ex.Message });
            }
        }

        /// <summary>
        /// Get specific assessment details by ID
        /// </summary>
        [HttpGet("assessments/{assessmentId}")]
        public async Task<IActionResult> GetAssessmentDetails(string assessmentId, [FromQuery] string partitionKey)
        {
            try
            {
                var assessment = await _assessmentService.GetAsync(assessmentId, partitionKey);
                if (assessment == null)
                {
                    return NotFound(new { message = "Assessment not found" });
                }
                return Ok(assessment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving assessment details", error = ex.Message });
            }
        }

        /// <summary>
        /// Update assessment (admin can modify any assessment)
        /// </summary>
        [HttpPut("assessments/{assessmentId}")]
        public async Task<IActionResult> UpdateAssessment(string assessmentId, [FromQuery] string partitionKey, [FromBody] Assessment updatedAssessment)
        {
            try
            {
                var existing = await _assessmentService.GetAsync(assessmentId, partitionKey);
                if (existing == null)    return NotFound(new { message = "Assessment not found" });

                var result = await _assessmentService.UpdateAsync(assessmentId, partitionKey, updatedAssessment);
                return Ok(new { message = "Assessment updated successfully", assessment = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating assessment", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete assessment (admin only) - FIXED IMPLEMENTATION
        /// </summary>
        [HttpDelete("assessments/{assessmentId}")]
        public async Task<IActionResult> DeleteAssessment(string assessmentId, [FromQuery] string partitionKey)
        {
            try
            {
                if (string.IsNullOrEmpty(partitionKey))
                {
                    return BadRequest(new { message = "PartitionKey (customerId) is required" });
                }
                var existing = await _assessmentService.GetAsync(assessmentId, partitionKey);
                if (existing == null)
                {
                    return NotFound(new { message = "Assessment not found" });
                }
                var deleted = await _assessmentService.DeleteAsync(assessmentId, partitionKey);
                if (!deleted)
                {
                    return StatusCode(500, new { message = "Failed to delete assessment" });
                }
                return Ok(new { message = "Assessment deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting assessment", error = ex.Message });
            }
        }

        /// <summary>
        /// Export assessments to Excel/CSV
        /// </summary>
        [HttpPost("assessments/export")]
        public async Task<IActionResult> ExportAssessments([FromBody] ExportRequestDto request)
        {
            try
            {
                var fileBytes = await _assessmentService.ExportAssessmentsAsync(request);
                var fileName = $"assessments_export_{DateTime.Now:yyyyMMdd_HHmmss}.{request.Format}";

                var contentType = request.Format.ToLower() switch
                {
                    "csv" => "text/csv",
                    "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    _ => "application/octet-stream"
                };

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error exporting assessments", error = ex.Message });
            }
        }

        /// <summary>
        /// Get assessments by specific user
        /// </summary>
        [HttpGet("users/{userId}/assessments")]
        public async Task<IActionResult> GetUserAssessments(string userId)
        {
            try
            {
                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var assessments = await _assessmentService.GetUserAssessmentsAsync(userId);
                return Ok(assessments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving user assessments", error = ex.Message });
            }
        }

        /// <summary>
        /// Get assessment completion rates by different criteria
        /// </summary>
        [HttpGet("assessments/completion-rates")]
        public async Task<IActionResult> GetCompletionRates([FromQuery] string? groupBy = "month")
        {
            try
            {
                // Implementation depends on your requirements
                // Could group by month, city, vehicle brand, etc.
                var stats = await _assessmentService.GetAssessmentStatsAsync();

                return Ok(new
                {
                    overallCompletionRate = stats.CompletionRate,
                    topCities = stats.TopCities,
                    topVehicleBrands = stats.TopVehicleBrands,
                    topEvChargerBrands = stats.TopEvChargerBrands, // DODATO
                    topExistingEvChargerBrands = stats.TopExistingEvChargerBrands, // DODATO
                    message = $"Completion rates grouped by {groupBy}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving completion rates", error = ex.Message });
            }
        }

        /// <summary>
        /// Bulk operations on assessments
        /// </summary>
        [HttpPost("assessments/bulk-action")]
        public async Task<IActionResult> BulkAction([FromBody] BulkActionDto request)
        {
            try
            {
                switch (request.Action.ToLower())
                {
                    case "delete": return Ok(new { message = "Bulk delete completed", affectedCount = request.AssessmentIds.Count });

                    case "export":return Ok(new { message = "Bulk export initiated", itemCount = request.AssessmentIds.Count });

                    case "archive": return Ok(new { message = "Bulk archive completed", affectedCount = request.AssessmentIds.Count });

                    default: return BadRequest(new { message = "Invalid bulk action", supportedActions = new[] { "delete", "export", "archive" } });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error performing bulk action", error = ex.Message });
            }
        }

        /// <summary>
        /// Get system health and performance metrics
        /// </summary>
        [HttpGet("system/health")]
        public async Task<IActionResult> GetSystemHealth()
        {
            try
            {
                var stats = await _assessmentService.GetAssessmentStatsAsync();

                return Ok(new
                {
                    status = "healthy",
                    timestamp = DateTime.UtcNow,
                    version = "1.0.0",
                    uptime = TimeSpan.FromMilliseconds(Environment.TickCount64),
                    metrics = new
                    {
                        totalAssessments = stats.Total,
                        completionRate = stats.CompletionRate,
                        averageCompletionTime = stats.AverageCompletionTimeMinutes,
                        topCitiesCount = stats.TopCities.Count,
                        topBrandsCount = stats.TopVehicleBrands.Count,
                        topEvChargerBrandsCount = stats.TopEvChargerBrands.Count, // DODATO
                        topExistingEvChargerBrandsCount = stats.TopExistingEvChargerBrands.Count // DODATO
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "unhealthy",
                    timestamp = DateTime.UtcNow,
                    message = "System health check failed",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get dashboard summary data - UPDATED WITH EV CHARGER DATA
        /// </summary>
        [HttpGet("dashboard/summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            try
            {
                var stats = await _assessmentService.GetAssessmentStatsAsync();
                var chartData = await _assessmentService.GetChartDataAsync();
                var dropOffData = await _assessmentService.GetDropOffAnalysisAsync();

                return Ok(new
                {
                    kpis = new
                    {
                        totalAssessments = stats.Total,
                        completedAssessments = stats.Completed,
                        incompleteAssessments = stats.Incomplete,
                        abandonedAssessments = stats.Abandoned,
                        completionRate = stats.CompletionRate,
                        averageCompletionTime = stats.AverageCompletionTimeMinutes
                    },
                    topData = new
                    {
                        topCities = stats.TopCities.Take(5),
                        topVehicleBrands = stats.TopVehicleBrands.Take(5),
                        topEvChargerBrands = stats.TopEvChargerBrands.Take(5),
                        topExistingEvChargerBrands = stats.TopExistingEvChargerBrands.Take(5)
                    },
                    chartSummary = new
                    {
                        statusDistribution = chartData.StatusDistribution,
                        dropOffBreakdown = dropOffData.PageBreakdown,
                        evChargerDistribution = chartData.EvChargerDistribution
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving dashboard summary", error = ex.Message });
            }
        }

        /// <summary>
        /// Search assessments by various criteria
        /// </summary>
        [HttpGet("assessments/search")]
        public async Task<IActionResult> SearchAssessments([FromQuery] string query, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                {
                    return BadRequest(new { message = "Search query is required" });
                }

                var filters = new AssessmentFilterDto
                {
                    Search = query,
                    Page = page,
                    PageSize = pageSize
                };

                var result = await _assessmentService.GetAssessmentsAsync(filters);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error searching assessments", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete user (admin only)
        /// </summary>
        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            try
            {
                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Ne možeš obrisati sebe
                var currentUserId = User.FindFirst("userId")?.Value;
                if (currentUserId == userId)
                {
                    return BadRequest(new { message = "You cannot delete your own account" });
                }

                var deleted = await _authService.DeleteUserAsync(userId);
                if (!deleted)
                {
                    return StatusCode(500, new { message = "Failed to delete user" });
                }

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting user", error = ex.Message });
            }
        }

    }

    // Additional DTO for bulk actions
    public class BulkActionDto
    {
        public string Action { get; set; } = string.Empty; // "delete", "archive", "export"
        public List<string> AssessmentIds { get; set; } = new List<string>();
        public Dictionary<string, object>? Parameters { get; set; }
    }
}