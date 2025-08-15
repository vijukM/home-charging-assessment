using System.Text.Json.Serialization;

namespace home_charging_assessment.Models
{
    public class HomeInfo
    {
        [JsonPropertyName("address")]
        public Address? Address { get; set; }

        [JsonPropertyName("numberOfHighEnergyDevices")]
        public int? NumberOfHighEnergyDevices { get; set; } // npr. bojler, klima
    }
}
