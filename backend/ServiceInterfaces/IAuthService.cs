using home_charging_assessment.Models;
using home_charging_assessment.Models.DTOs;

namespace home_charging_assessment.ServiceInterfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
        Task<User> RegisterAsync(RegisterDto registerDto);
        Task<User> RegisterAdminAsync(RegisterDto registerDto);
        Task<bool> VerifyEmailAsync(string token);
        Task ResendVerificationEmailAsync(string email);
        Task ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(string token, string newPassword);
        string GenerateJwtToken(User user);
        Task<User?> GetUserByIdAsync(string userId);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<bool> DeleteUserAsync(string userId);
        Task<User?> UpdateUserAsync(string userId, UpdateUserDto updateUserDto);
    }
}