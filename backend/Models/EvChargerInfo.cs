using System.Text.Json.Serialization;

namespace home_charging_assessment.Models
{
    public class EvChargerInfo
    {
        [JsonPropertyName("hasCharger")]
        public bool HasCharger { get; set; } = false; // Da li već ima punjač

        [JsonPropertyName("wantsToBuy")]
        public bool WantsToBuy { get; set; } = false; // Da li želi da kupi punjač

        [JsonPropertyName("evCharger")]
        public EvCharger? EvCharger { get; set; } // Jedan punjač objekat

        // Logika:
        // HasCharger = true + EvCharger != null = Ima postojeći punjač
        // HasCharger = false + WantsToBuy = true + EvCharger != null = Želi da kupi punjač  
        // HasCharger = false + WantsToBuy = false + EvCharger = null = Ne želi ništa / želi preporuke
    }
}