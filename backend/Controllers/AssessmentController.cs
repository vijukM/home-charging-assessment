using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using home_charging_assessment.Models;
using home_charging_assessment.ServiceInterfaces;

namespace home_charging_assessment.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "UserOrAdmin")]  

    public class AssessmentController : ControllerBase
    {
        private readonly IAssessmentService _service;

        public AssessmentController(IAssessmentService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Assessment assessment)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                assessment.CustomerId = userId;
            }

            var created = await _service.CreateAsync(assessment);
            return CreatedAtAction(nameof(GetById), new { id = created.Id, partitionKey = created.CustomerId }, created);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id, [FromQuery] string partitionKey)
        {
            var userId = User.FindFirst("userId")?.Value;
            var isAdmin = User.IsInRole(UserRoles.Admin);

            // Allow access if user owns the assessment OR is an admin
            if (!isAdmin && userId != partitionKey)
            {
                return Forbid();
            }

            var result = await _service.GetAsync(id, partitionKey);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromQuery] string partitionKey, [FromBody] Assessment updated)
        {
            var userId = User.FindFirst("userId")?.Value;
            var isAdmin = User.IsInRole(UserRoles.Admin);

            // Allow update if user owns the assessment OR is an admin
            if (!isAdmin && userId != partitionKey)
            {
                return Forbid();
            }

            var existing = await _service.GetAsync(id, partitionKey);
            if (existing == null)
                return NotFound();

            var result = await _service.UpdateAsync(id, partitionKey, updated);
            return Ok(result);
        }

        [HttpGet("my-assessments")]
        [Authorize(Roles = UserRoles.User)]
        public async Task<IActionResult> GetMyAssessments()
        {
            var userId = User.FindFirst("userId")?.Value;
            // Implement logic to get all assessments for a user
            // This would require adding a method to your service/repository
            return Ok(new { message = "Not implemented yet" });
        }
    }
}