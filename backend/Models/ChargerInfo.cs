using System.Text.Json.Serialization;

namespace home_charging_assessment.Models
{
    public class ChargerInfo
    {
        [JsonPropertyName("location")]
        public string? Location { get; set; } // npr. "garage_wall", "driveway"

        [JsonPropertyName("distanceFromPanelMeters")]
        public double? DistanceFromPanelMeters { get; set; } // metri (decimal)
    }
}
