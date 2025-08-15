using System.Text.Json.Serialization;

namespace home_charging_assessment.Models
{
    public class Address
    {
        [JsonPropertyName("street")]
        public string? Street { get; set; }

        [JsonPropertyName("streetNumber")]
        public string? StreetNumber { get; set; }

        [JsonPropertyName("city")]
        public string? City { get; set; }

        [JsonPropertyName("postalCode")]
        public string? PostalCode { get; set; }

        [JsonPropertyName("country")]
        public string? Country { get; set; }
    }
}
