using System.Text.Json.Serialization;

namespace home_charging_assessment.Models
{
    public class EvChargerInfo
    {
        [JsonPropertyName("wantsToBuy")]
        public bool WantsToBuy { get; set; } = false;

        [JsonPropertyName("brand")]
        public string? Brand { get; set; }

        [JsonPropertyName("model")]
        public string? Model { get; set; }

        [JsonPropertyName("powerKw")]
        public double? PowerKw { get; set; } // opcionalno
    }
}
