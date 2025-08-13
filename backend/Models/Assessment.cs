using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace home_charging_assessment.Models
{
    /// <summary>
    /// Glavni Assessment entitet koji sadrži 6 sekcija (svaka sekcija je klasa).
    /// Predviđen za NoSQL (Cosmos) — koristi "id" i "customerId" kao partition key.
    /// </summary>
    public class Assessment
    {
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        // Koristi se kao partition key u tvojoj konfiguraciji ("/customerId")
        [JsonProperty("customerId")]
        public string CustomerId { get; set; } = Guid.NewGuid().ToString();

        [JsonPropertyName("personalInfo")]
        public PersonalInfo? PersonalInfo { get; set; }

        [JsonPropertyName("vehicleInfo")]
        public VehicleInfo? VehicleInfo { get; set; }

        [JsonPropertyName("electricalPanelInfo")]
        public ElectricalPanelInfo? ElectricalPanelInfo { get; set; }

        [JsonPropertyName("chargerInfo")]
        public ChargerInfo? ChargerInfo { get; set; }

        [JsonPropertyName("homeInfo")]
        public HomeInfo? HomeInfo { get; set; }

        [JsonPropertyName("evChargerInfo")]
        public EvChargerInfo? EvChargerInfo { get; set; }

        // Meta polja za multi-step flow i praćenje
        [JsonPropertyName("currentPage")]
        public int CurrentPage { get; set; } = 1;

        [JsonPropertyName("isComplete")]
        public bool IsComplete { get; set; } = false;

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonPropertyName("completedAt")]
        public DateTime? CompletedAt { get; set; }
    }
    

}