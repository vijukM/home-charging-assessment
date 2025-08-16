using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace home_charging_assessment.Models
{
    public class User
    {
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("username")]
        [Required]
        public string Username { get; set; } = string.Empty;

        [JsonProperty("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        [JsonProperty("email")]
        [EmailAddress]
        [Required]
        public string Email { get; set; } = string.Empty;

        [JsonProperty("emailVerified")]
        public bool EmailVerified { get; set; } = false;

        [JsonProperty("emailVerificationToken")]
        public string? EmailVerificationToken { get; set; }

        [JsonProperty("emailVerificationTokenExpiry")]
        public DateTime? EmailVerificationTokenExpiry { get; set; }

        [JsonProperty("passwordResetToken")]
        public string? PasswordResetToken { get; set; }

        [JsonProperty("passwordResetTokenExpiry")]
        public DateTime? PasswordResetTokenExpiry { get; set; }

        [JsonProperty("roles")]
        public List<string> Roles { get; set; } = new List<string> { UserRoles.User };

        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonProperty("lastLogin")]
        public DateTime? LastLogin { get; set; }

        [JsonProperty("isActive")]
        public bool IsActive { get; set; } = true;

        [JsonProperty("partitionKey")]
        public string PartitionKey => "USER";
    }

    public static class UserRoles
    {
        public const string Admin = "Admin";
        public const string User = "User";
        public const string Technician = "Technician";
    }
}