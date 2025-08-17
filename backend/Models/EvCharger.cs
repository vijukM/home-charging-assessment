using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace home_charging_assessment.Models
{
    public class EvCharger
    {
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("brand")]
        public string Brand { get; set; } = string.Empty;

        [JsonProperty("model")]
        public string Model { get; set; } = string.Empty;

        [JsonProperty("powerKw")]
        public double PowerKw { get; set; }

    }
}