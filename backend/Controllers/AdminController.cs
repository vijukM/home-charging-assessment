using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using home_charging_assessment.Models;
using home_charging_assessment.Models.DTOs;
using home_charging_assessment.ServiceInterfaces;

namespace home_charging_assessment.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = UserRoles.Admin)]
    public class AdminController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AdminController(IAuthService authService)
        {
            _authService = authService;
        }

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

        [HttpPut("users/{userId}/roles")]
        public async Task<IActionResult> UpdateUserRoles(string userId, [FromBody] UpdateUserRolesDto dto)
        {
            var user = await _authService.UpdateUserRolesAsync(userId, dto.Roles);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new { message = "Roles updated successfully" });
        }
    }
}