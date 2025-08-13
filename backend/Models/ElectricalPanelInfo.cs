using System.Text.Json.Serialization;

namespace home_charging_assessment.Models
{
    public class ElectricalPanelInfo
    {
        [JsonPropertyName("location")]
        public string? Location { get; set; } // npr. "garage", "basement", "outside"

        [JsonPropertyName("mainBreakerCapacity")]
        public int? MainBreakerCapacity { get; set; } // Amperi, npr. 100, 200

        [JsonPropertyName("numberOfOpenSlots")]
        public int? NumberOfOpenSlots { get; set; } // otvoreni slotovi
    }
}
