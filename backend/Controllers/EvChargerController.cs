using Microsoft.AspNetCore.Mvc;
using home_charging_assessment.Models;
using home_charging_assessment.ServiceInterfaces;

namespace home_charging_assessment.Controllers
{
    [ApiController]
    [Route("api/[controller]")]   // /api/EvCharger
    public class EvChargerController : ControllerBase
    {
        private readonly IEvChargerService _service;

        public EvChargerController(IEvChargerService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create(EvCharger charger)
        {
            var created = await _service.CreateAsync(charger);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, EvCharger charger)
        {
            var updated = await _service.UpdateAsync(id, charger);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}