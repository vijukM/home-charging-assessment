using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace home_charging_assessment.Models
{
    public class PersonalInfo
    {
        [JsonPropertyName("firstName")]
        public string? FirstName { get; set; }

        [JsonPropertyName("lastName")]
        public string? LastName { get; set; }

        [JsonPropertyName("email")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string? Email { get; set; }

        [JsonPropertyName("phone")]
        [Phone(ErrorMessage = "Invalid phone number")]
        public string? Phone { get; set; }
    }
}
