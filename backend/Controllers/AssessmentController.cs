using Microsoft.AspNetCore.Mvc;
using home_charging_assessment.Models;
using home_charging_assessment.ServiceInterfaces;

namespace home_charging_assessment.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            var created = await _service.CreateAsync(assessment);
            return CreatedAtAction(nameof(GetById), new { id = created.Id, partitionKey = created.CustomerId }, created);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id, [FromQuery] string partitionKey)
        {
            var result = await _service.GetAsync(id, partitionKey);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromQuery] string partitionKey, [FromBody] Assessment updated)
        {
            var existing = await _service.GetAsync(id, partitionKey);
            if (existing == null)
                return NotFound();

            var result = await _service.UpdateAsync(id, partitionKey, updated);
            return Ok(result);
        }

    }
}
