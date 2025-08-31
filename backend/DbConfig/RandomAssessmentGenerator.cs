using Microsoft.Azure.Cosmos;
using home_charging_assessment.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace home_charging_assessment.DbConfig
{
    public class RandomAssessmentGenerator
    {
        private static readonly Random _random = new Random();
        private const int NumberOfAssessments = 1;
        private const double CompletionProbability = 0.7; // 70% chance of completion

        private static readonly List<string> FirstNames = new List<string>
        {
            "Marko", "Ana", "Miloš", "Jelena", "Stefan", "Milica", "Nikola", "Sandra", "Milan", "Jovana",
            "Petar", "Danijela", "Aleksa", "Tamara", "Nenad", "Dragana", "Vladimir", "Sofija", "Marija", "Bojan",
            "Luka", "Teodora", "Filip", "Katarina", "Nemanja", "Isidora", "Uroš", "Tijana", "Vuk", "Anđela",
            "Dimitrije", "Milana", "Aleksej", "Sara", "Matija", "Nina", "Bogdan", "Emilija", "Viktor", "Kristina"
        };

        private static readonly List<string> LastNames = new List<string>
        {
            "Petrović", "Jovanović", "Nikolić", "Stojanović", "Marković", "Pavlović", "Vasić", "Milić", "Stanković", "Dimitrijević",
            "Radović", "Popović", "Tomić", "Ilić", "Milenković", "Živković", "Savić", "Rašić", "Stanojević", "Milošević",
            "Mitrović", "Đorđević", "Kostić", "Janković", "Simić", "Antić", "Bogdanović", "Ristić", "Todorović", "Stojković"
        };

        private static readonly List<VehicleData> Vehicles = new List<VehicleData>
        {
            new VehicleData { Brand = "Tesla", Model = "Model 3 Long Range", BaseModel = "Model 3" },
            new VehicleData { Brand = "Tesla", Model = "Model Y Performance", BaseModel = "Model Y" },
            new VehicleData { Brand = "Tesla", Model = "Model S Plaid", BaseModel = "Model S" },
            new VehicleData { Brand = "BMW", Model = "i4 eDrive40", BaseModel = "i4" },
            new VehicleData { Brand = "BMW", Model = "iX3 xDrive30", BaseModel = "iX3" },
            new VehicleData { Brand = "BMW", Model = "iX xDrive50", BaseModel = "iX" },
            new VehicleData { Brand = "BMW", Model = "i3 eDrive35", BaseModel = "i3" },
            new VehicleData { Brand = "Volkswagen", Model = "ID.4 Pro", BaseModel = "ID.4" },
            new VehicleData { Brand = "Volkswagen", Model = "ID.3 Pro S", BaseModel = "ID.3" },
            new VehicleData { Brand = "Volkswagen", Model = "ID.Buzz Pro", BaseModel = "ID.Buzz" },
            new VehicleData { Brand = "Audi", Model = "e-tron GT quattro", BaseModel = "e-tron GT" },
            new VehicleData { Brand = "Audi", Model = "Q4 e-tron 50 quattro", BaseModel = "Q4 e-tron" },
            new VehicleData { Brand = "Audi", Model = "e-tron 55 quattro", BaseModel = "e-tron" },
            new VehicleData { Brand = "Honda", Model = "Prologue Elite", BaseModel = "Prologue" },
            new VehicleData { Brand = "Honda", Model = "Prologue Touring", BaseModel = "Prologue" },
            new VehicleData { Brand = "Hyundai", Model = "Ioniq 5 Limited", BaseModel = "Ioniq 5" },
            new VehicleData { Brand = "Hyundai", Model = "Ioniq 6 SE", BaseModel = "Ioniq 6" },
            new VehicleData { Brand = "Ford", Model = "Mustang Mach-E Premium", BaseModel = "Mustang Mach-E" },
            new VehicleData { Brand = "Ford", Model = "F-150 Lightning Lariat", BaseModel = "F-150 Lightning" },
            new VehicleData { Brand = "Kia", Model = "EV6 GT-Line", BaseModel = "EV6" },
            new VehicleData { Brand = "Kia", Model = "Niro EV EX", BaseModel = "Niro EV" }
        };

        private static readonly List<string> PanelLocations = new List<string>
        {
            "Garage", "Basement", "Technical room", "Entrance", "Garage roof", "Attic", "Office", "Outdoor shed", "Utility room", "Kitchen"
        };

        private static readonly List<string> ChargerLocations = new List<string>
        {
            "Garage", "Driveway", "Side of the house", "Underground parking", "Carport", "Workplace", "Yard", "Street", "Other", "Front yard"
        };

        private static readonly List<int> MainBreakerCapacities = new List<int>
        {
            32, 40, 50, 63, 80, 100, 150
        };

        private static readonly List<ChargerData> EvChargers = new List<ChargerData>
        {
            new ChargerData { Brand = "Wallbox", Model = "Pulsar Plus", PowerKw = 11 },
            new ChargerData { Brand = "Wallbox", Model = "Pulsar Plus", PowerKw = 22 },
            new ChargerData { Brand = "ABB", Model = "Terra AC Wallbox", PowerKw = 11 },
            new ChargerData { Brand = "ABB", Model = "Terra AC Wallbox", PowerKw = 22 },
            new ChargerData { Brand = "Schneider Electric", Model = "EVlink Wallbox", PowerKw = 7.4 },
            new ChargerData { Brand = "Schneider Electric", Model = "EVlink Wallbox", PowerKw = 22 },
            new ChargerData { Brand = "KEBA", Model = "KeContact P30", PowerKw = 11 },
            new ChargerData { Brand = "KEBA", Model = "KeContact P30", PowerKw = 22 },
            new ChargerData { Brand = "Siemens", Model = "VersiCharge AC", PowerKw = 7.2 },
            new ChargerData { Brand = "Siemens", Model = "VersiCharge AC", PowerKw = 11 },
            new ChargerData { Brand = "Tesla", Model = "Wall Connector", PowerKw = 16 }
        };

        private static readonly List<AddressData> Addresses = new List<AddressData>
        {
            new AddressData { Street = "Bulevar Oslobođenja", StreetNumber = "123", City = "Novi Sad", PostalCode = "21000", Country = "Serbia" },
            new AddressData { Street = "Episkopa Visariona", StreetNumber = "45", City = "Novi Sad", PostalCode = "21000", Country = "Serbia" },
            new AddressData { Street = "Đure Jakšića", StreetNumber = "78", City = "Novi Sad", PostalCode = "21000", Country = "Serbia" },
            new AddressData { Street = "Somborska", StreetNumber = "156", City = "Subotica", PostalCode = "24000", Country = "Serbia" },
            new AddressData { Street = "Vojvode Stepe", StreetNumber = "234", City = "Niš", PostalCode = "18000", Country = "Serbia" },
            new AddressData { Street = "Maksima Gorkog", StreetNumber = "67", City = "Pančevo", PostalCode = "26000", Country = "Serbia" },
            new AddressData { Street = "Kneza Miloša", StreetNumber = "89", City = "Beograd", PostalCode = "11000", Country = "Serbia" },
            new AddressData { Street = "Maximilianstraße", StreetNumber = "12", City = "Munich", PostalCode = "80539", Country = "Germany" },
            new AddressData { Street = "Alexanderplatz", StreetNumber = "34", City = "Frankfurt", PostalCode = "60313", Country = "Germany" },
            new AddressData { Street = "Reeperbahn", StreetNumber = "56", City = "Hamburg", PostalCode = "20359", Country = "Germany" },
            new AddressData { Street = "Broadway", StreetNumber = "789", City = "New York", PostalCode = "10036", Country = "United States" },
            new AddressData { Street = "Sunset Boulevard", StreetNumber = "1234", City = "Los Angeles", PostalCode = "90069", Country = "United States" },
            new AddressData { Street = "Main Street", StreetNumber = "567", City = "Houston", PostalCode = "77002", Country = "United States" },
            new AddressData { Street = "Ocean Drive", StreetNumber = "890", City = "Miami", PostalCode = "33139", Country = "United States" }
        };

        public static async Task PopulateRandomAssessmentsAsync(CosmosClient client, string databaseName, string containerName, string partitionKeyPath)
        {
            Database database = await client.CreateDatabaseIfNotExistsAsync(databaseName);
            Container container;

            try
            {
                container = database.GetContainer(containerName);
                await container.ReadContainerAsync();
                Console.WriteLine($"Container '{containerName}' already exists.");
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                var containerResponse = await database.CreateContainerAsync(new ContainerProperties
                {
                    Id = containerName,
                    PartitionKeyPath = partitionKeyPath
                }, throughput: 400);

                container = containerResponse.Container;
                Console.WriteLine($"Created container '{containerName}' with partition key '{partitionKeyPath}'");
            }

            var randomAssessments = GenerateRandomAssessments();

            foreach (var assessment in randomAssessments)
            {
                try
                {
                    await container.CreateItemAsync(assessment, new PartitionKey(assessment.CustomerId));
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Conflict)
                {
                    Console.WriteLine($"Assessment with ID {assessment.Id} already exists, skipping.");
                }
            }

            Console.WriteLine($"Added {randomAssessments.Count} random assessments to the container.");
        }

        private static List<Assessment> GenerateRandomAssessments()
        {
            var assessments = new List<Assessment>();

            for (int i = 0; i < NumberOfAssessments; i++)
            {
                var assessment = new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow.AddDays(-_random.Next(0, 30)).AddHours(-_random.Next(0, 24)).AddMinutes(-_random.Next(0, 60))
                };

                assessment.PersonalInfo = GeneratePersonalInfo();

                bool isCompleted = _random.NextDouble() < CompletionProbability;

                if (isCompleted)
                {
                    assessment.VehicleInfo = GenerateVehicleInfo();
                    assessment.ElectricalPanelInfo = GenerateElectricalPanelInfo();
                    assessment.ChargerInfo = GenerateChargerInfo();
                    assessment.HomeInfo = GenerateHomeInfo();
                    assessment.EvChargerInfo = GenerateEvChargerInfo();
                    assessment.CurrentPage = 6;
                    assessment.IsComplete = true;
                    assessment.CompletedAt = assessment.CreatedAt.AddMinutes(_random.Next(15, 45));
                }
                else
                {
                    int currentPage = _random.Next(1, 6); // Pages 1-5 (not complete)
                    assessment.CurrentPage = currentPage;
                    assessment.IsComplete = false;

                    if (currentPage >= 2)
                    {
                        assessment.VehicleInfo = GenerateVehicleInfo();
                    }
                    if (currentPage >= 3)
                    {
                        assessment.ElectricalPanelInfo = GenerateElectricalPanelInfo();
                    }
                    if (currentPage >= 4)
                    {
                        assessment.ChargerInfo = GenerateChargerInfo();
                    }
                    if (currentPage >= 5)
                    {
                        assessment.HomeInfo = GenerateHomeInfo();
                    }
                }

                assessments.Add(assessment);
            }

            return assessments;
        }

        private static PersonalInfo GeneratePersonalInfo()
        {
            var firstName = FirstNames[_random.Next(FirstNames.Count)];
            var lastName = LastNames[_random.Next(LastNames.Count)];
            var emailDomains = new[] { "@gmail.com", "@yahoo.com", "@hotmail.com", "@outlook.com" };
            var phonePrefixes = new[] { "38164", "38165", "38166", "38167", "38168", "38169", "49301", "49401", "49891", "1212", "1323", "1713", "1305" };

            return new PersonalInfo
            {
                FirstName = firstName,
                LastName = lastName,
                Email = $"{firstName.ToLower()}.{lastName.ToLower()}{emailDomains[_random.Next(emailDomains.Length)]}",
                Phone = $"{phonePrefixes[_random.Next(phonePrefixes.Length)]}{_random.Next(100000, 999999)}"
            };
        }

        private static VehicleInfo GenerateVehicleInfo()
        {
            var vehicle = Vehicles[_random.Next(Vehicles.Count)];
            var years = new[] { 2023, 2024, 2025 };

            return new VehicleInfo
            {
                Brand = vehicle.Brand,
                Model = vehicle.Model,
                BaseModel = vehicle.BaseModel,
                Year = years[_random.Next(years.Length)]
            };
        }

        private static ElectricalPanelInfo GenerateElectricalPanelInfo()
        {
            return new ElectricalPanelInfo
            {
                Location = PanelLocations[_random.Next(PanelLocations.Count)],
                MainBreakerCapacity = MainBreakerCapacities[_random.Next(MainBreakerCapacities.Count)],
                NumberOfOpenSlots = _random.Next(0, 8)
            };
        }

        private static ChargerInfo GenerateChargerInfo()
        {
            return new ChargerInfo
            {
                Location = ChargerLocations[_random.Next(ChargerLocations.Count)],
                DistanceFromPanelMeters = Math.Round(_random.NextDouble() * 29 + 1, 1) // 1.0 to 30.0 meters
            };
        }

        private static HomeInfo GenerateHomeInfo()
        {
            var address = Addresses[_random.Next(Addresses.Count)];

            return new HomeInfo
            {
                Address = new Address
                {
                    Street = address.Street,
                    StreetNumber = $"{_random.Next(1, 200)}{(char)('A' + _random.Next(0, 3))}".TrimEnd('A'),
                    City = address.City,
                    PostalCode = address.PostalCode,
                    Country = address.Country
                },
                NumberOfHighEnergyDevices = _random.Next(1, 9)
            };
        }

        private static EvChargerInfo GenerateEvChargerInfo()
        {
            bool hasCharger = _random.NextDouble() < 0.4; // 40% chance of already having a charger
            bool wantsToBuy = !hasCharger || _random.NextDouble() < 0.1; // If no charger, wants to buy; if has charger, 10% chance still wants to buy

            var evChargerInfo = new EvChargerInfo
            {
                HasCharger = hasCharger,
                WantsToBuy = wantsToBuy
            };

            // If they have a charger or want to buy one, generate charger details
            if (hasCharger || wantsToBuy)
            {
                var charger = EvChargers[_random.Next(EvChargers.Count)];
                evChargerInfo.EvCharger = new EvCharger
                {
                    Id = Guid.NewGuid().ToString(),
                    Brand = charger.Brand,
                    Model = charger.Model,
                    PowerKw = charger.PowerKw
                };
            }

            return evChargerInfo;
        }

        private class VehicleData
        {
            public string Brand { get; set; }
            public string Model { get; set; }
            public string BaseModel { get; set; }
        }

        private class ChargerData
        {
            public string Brand { get; set; }
            public string Model { get; set; }
            public double PowerKw { get; set; }
        }

        private class AddressData
        {
            public string Street { get; set; }
            public string StreetNumber { get; set; }
            public string City { get; set; }
            public string PostalCode { get; set; }
            public string Country { get; set; }
        }
    }
}