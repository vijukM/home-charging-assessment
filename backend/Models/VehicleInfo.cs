using System.Text.Json.Serialization;

namespace home_charging_assessment.Models
{
    public class VehicleInfo
    {
        [JsonPropertyName("brand")]
        public string? Brand     { get; set; }

        [JsonPropertyName("model")]
        public string? Model { get; set; }

        [JsonPropertyName("baseModel")]
        public string? BaseModel { get; set; }

        [JsonPropertyName("year")]
        public int? Year { get; set; }

    }
}
