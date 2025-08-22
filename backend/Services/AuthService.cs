using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using home_charging_assessment.Models;
using home_charging_assessment.Models.DTOs;
using home_charging_assessment.RepositoryInterfaces;
using home_charging_assessment.ServiceInterfaces;

namespace home_charging_assessment.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly JwtSettings _jwtSettings;
        private readonly string _frontendUrl;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository, 
            IEmailService emailService,
            IOptions<JwtSettings> jwtSettings,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _emailService = emailService;
            _jwtSettings = jwtSettings.Value;
            _frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:3000";
            _logger = logger;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetByUsernameAsync(loginDto.Username);
            
            if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return null;
            }

            if (!user.IsActive)
            {
                throw new InvalidOperationException("Account is deactivated");
            }

            if (!user.EmailVerified)
            {
                throw new InvalidOperationException("Please verify your email before logging in");
            }

            user.LastLogin = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            var token = GenerateJwtToken(user);
            
            return new LoginResponseDto
            {
                Token = token,
                Username = user.Username,
                UserId = user.Id,
                Email = user.Email,
                EmailVerified = user.EmailVerified,
                Roles = user.Roles,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes)
            };
        }

        public async Task<User> RegisterAsync(RegisterDto registerDto)
        {
            if (await _userRepository.UsernameExistsAsync(registerDto.Username))
            {
                throw new InvalidOperationException("Username already exists");
            }

            if (await _userRepository.EmailExistsAsync(registerDto.Email))
            {
                throw new InvalidOperationException("Email already registered");
            }

            var verificationToken = GenerateVerificationToken();
            
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = HashPassword(registerDto.Password),
                EmailVerificationToken = verificationToken,
                EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24),
                EmailVerified = false,
                Roles = new List<string> { UserRoles.User }
            };

            var createdUser = await _userRepository.CreateAsync(user);

            // Try to send verification email, but don't fail registration if email fails
            try
            {
                var verificationUrl = $"{_frontendUrl}/verify-email?token={verificationToken}";
                await _emailService.SendEmailVerificationAsync(user.Email, user.Username, verificationUrl);
                _logger.LogInformation("Verification email sent to {Email}", user.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to {Email}. User registration completed but email not sent.", user.Email);
                // Don't throw - user is still registered successfully
            }

            return createdUser;
        }

        public async Task<User> RegisterAdminAsync(RegisterDto registerDto)
        {
            if (await _userRepository.UsernameExistsAsync(registerDto.Username))
            {
                throw new InvalidOperationException("Username already exists");
            }

            if (await _userRepository.EmailExistsAsync(registerDto.Email))
            {
                throw new InvalidOperationException("Email already registered");
            }

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = HashPassword(registerDto.Password),
                EmailVerified = true, // Admin accounts are pre-verified
                Roles = new List<string> { UserRoles.Admin, UserRoles.User }
            };

            return await _userRepository.CreateAsync(user);
        }

        public async Task<bool> VerifyEmailAsync(string token)
        {
            var user = await _userRepository.GetByVerificationTokenAsync(token);
            
            if (user == null)
            {
                throw new InvalidOperationException("Invalid verification token");
            }

            if (user.EmailVerificationTokenExpiry < DateTime.UtcNow)
            {
                throw new InvalidOperationException("Verification token has expired");
            }

            user.EmailVerified = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiry = null;
            
            await _userRepository.UpdateAsync(user);
            
            // Try to send welcome email
            try
            {
                await _emailService.SendWelcomeEmailAsync(user.Email, user.Username);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send welcome email to {Email}", user.Email);
                // Don't fail verification if welcome email fails
            }
            
            return true;
        }

        public async Task ResendVerificationEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            
            if (user == null)
            {
                // Don't reveal if email exists
                return;
            }

            if (user.EmailVerified)
            {
                throw new InvalidOperationException("Email is already verified");
            }

            // Generate new token
            var verificationToken = GenerateVerificationToken();
            user.EmailVerificationToken = verificationToken;
            user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
            
            await _userRepository.UpdateAsync(user);

            try
            {
                var verificationUrl = $"{_frontendUrl}/verify-email?token={verificationToken}";
                await _emailService.SendEmailVerificationAsync(user.Email, user.Username, verificationUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resend verification email to {Email}", user.Email);
                throw new InvalidOperationException("Failed to send verification email. Please try again later.");
            }
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            
            if (user == null)
            {
                // Don't reveal if email exists
                return;
            }

            var resetToken = GenerateVerificationToken();
            user.PasswordResetToken = resetToken;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
            
            await _userRepository.UpdateAsync(user);

            try
            {
                var resetUrl = $"{_frontendUrl}/reset-password?token={resetToken}";
                await _emailService.SendPasswordResetAsync(user.Email, user.Username, resetUrl);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}", user.Email);
                throw new InvalidOperationException("Failed to send password reset email. Please try again later.");
            }
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            var user = await _userRepository.GetByPasswordResetTokenAsync(token);
            
            if (user == null)
            {
                throw new InvalidOperationException("Invalid reset token");
            }

            if (user.PasswordResetTokenExpiry < DateTime.UtcNow)
            {
                throw new InvalidOperationException("Reset token has expired");
            }

            user.PasswordHash = HashPassword(newPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            
            await _userRepository.UpdateAsync(user);
            
            return true;
        }

        public string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("userId", user.Id),
                new Claim("emailVerified", user.EmailVerified.ToString())
            };

            foreach (var role in user.Roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<User?> GetUserByIdAsync(string userId)
        {
            return await _userRepository.GetByIdAsync(userId);
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return users.Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                EmailVerified = u.EmailVerified,
                Roles = u.Roles,
                CreatedAt = u.CreatedAt,
                LastLogin = u.LastLogin,
                IsActive = u.IsActive
            });
        }


        private string GenerateVerificationToken()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[32];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        public async Task<bool> DeleteUserAsync(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return false;
                }
                // Možeš dodati dodatne provere ovde:
                // - Da li korisnik ima aktivne assessments
                // - Da li je poslednji admin u sistemu
                var deleted = await _userRepository.DeleteAsync(userId);

                if (deleted)
                {
                    _logger.LogInformation("User {UserId} ({Username}) was deleted", userId, user.Username);
                }

                return deleted;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", userId);
                return false;
            }
        }
        public async Task<User?> UpdateUserAsync(string userId, UpdateUserDto updateUserDto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return null;
                }

                // Proveri da li username već postoji (osim za trenutnog korisnika)
                if (!string.IsNullOrEmpty(updateUserDto.Username) && user.Username != updateUserDto.Username)
                {
                    var existingUser = await _userRepository.GetByUsernameAsync(updateUserDto.Username);
                    if (existingUser != null && existingUser.Id != userId)
                    {
                        throw new InvalidOperationException("Username already exists");
                    }
                }

                // Proveri da li email već postoji (osim za trenutnog korisnika)
                if (!string.IsNullOrEmpty(updateUserDto.Email) && user.Email != updateUserDto.Email)
                {
                    var existingUser = await _userRepository.GetByEmailAsync(updateUserDto.Email);
                    if (existingUser != null && existingUser.Id != userId)
                    {
                        throw new InvalidOperationException("Email already exists");
                    }
                }

                // Update user properties
                user.Username = updateUserDto.Username ?? user.Username;
                user.Email = updateUserDto.Email ?? user.Email;
                user.EmailVerified = updateUserDto.EmailVerified;
                user.IsActive = updateUserDto.IsActive;

                // Update roles
                if (updateUserDto.Roles != null && updateUserDto.Roles.Any())
                {
                    user.Roles = updateUserDto.Roles;
                }

                var updatedUser = await _userRepository.UpdateAsync(user);

                if (updatedUser != null)
                {
                    _logger.LogInformation("User {UserId} ({Username}) was updated", userId, user.Username);
                }

                return updatedUser;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", userId);
                throw;
            }
        }
    }
}
