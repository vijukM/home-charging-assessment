using Newtonsoft.Json;

namespace home_charging_assessment.Models
{
    public class Assessment
    {
        [JsonProperty("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonProperty("customerId")]
        public string CustomerId { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Assessment()
        {
            Id = Guid.NewGuid().ToString();
            CustomerId = Guid.NewGuid().ToString();
        }
        public Assessment(string customerId)
        {
            Id = Guid.NewGuid().ToString();          // Novi assessment ID
            CustomerId = customerId;                 // Postojeći customer
        }
    }

}