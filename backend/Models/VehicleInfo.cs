using System.Text.Json.Serialization;

namespace home_charging_assessment.Models
{
    public class VehicleInfo
    {
        [JsonPropertyName("manufacturer")]
        public string? Manufacturer { get; set; }

        [JsonPropertyName("model")]
        public string? Model { get; set; }

        [JsonPropertyName("year")]
        public int? Year { get; set; }

        [JsonPropertyName("vehicleId")]
        public string? VehicleId { get; set; }
    }
}
