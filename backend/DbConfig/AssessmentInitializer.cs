using Microsoft.Azure.Cosmos;
using home_charging_assessment.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace home_charging_assessment.DbConfig
{
    public class AssessmentInitializer
    {
        public static async Task InitializeAsync(CosmosClient client, string databaseName, string containerName, string partitionKeyPath)
        {
            // Kreiraj bazu ako ne postoji
            Database database = await client.CreateDatabaseIfNotExistsAsync(databaseName);

            Container container;

            // Pokušaj da uzmeš container
            try
            {
                container = database.GetContainer(containerName);

                ContainerResponse response = await container.ReadContainerAsync();
                ContainerProperties props = response.Resource;

                if (props.PartitionKeyPath != partitionKeyPath)
                {
                    throw new InvalidOperationException(
                        $"Container '{containerName}' već postoji, ali ima partition key '{props.PartitionKeyPath}' umesto '{partitionKeyPath}'. " +
                        "Cosmos DB ne dozvoljava promenu partition key-a. Moraš obrisati container i ponovo ga kreirati."
                    );
                }

                Console.WriteLine($"Container '{containerName}' već postoji sa istim partition key-em '{partitionKeyPath}'.");
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                // Container ne postoji - kreiramo ga
                var containerResponse = await database.CreateContainerAsync(new ContainerProperties
                {
                    Id = containerName,
                    PartitionKeyPath = partitionKeyPath
                }, throughput: 400);

                container = containerResponse.Container;
                Console.WriteLine($"Kreiran container '{containerName}' sa partition key '{partitionKeyPath}'");
            }

            // Proveri da li container već ima podatke
            var query = new QueryDefinition("SELECT VALUE COUNT(1) FROM c");
            var iterator = container.GetItemQueryIterator<int>(query);
            int count = 0;

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                count += response.Resource.FirstOrDefault();
            }

            if (count == 0)
            {
                var defaultAssessments = CreateDefaultAssessments();

                foreach (var assessment in defaultAssessments)
                {
                    await container.CreateItemAsync(assessment, new PartitionKey(assessment.CustomerId));
                }

                Console.WriteLine($"Popunjeno {defaultAssessments.Count} default assessment-a u containeru.");
            }
            else
            {
                Console.WriteLine("Container već sadrži podatke, nije potrebno ubacivati default assessment-e.");
            }
        }

        private static List<Assessment> CreateDefaultAssessments()
        {
            return new List<Assessment>
            {
                // Assessment 1 - Tesla Model 3 (U toku - strana 4)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Marko",
                        LastName = "Petrović",
                        Email = "marko.petrovic@gmail.com",
                        Phone = "38164123456"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Tesla",
                        Model = "Model 3 Long Range",
                        BaseModel = "Model 3",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Garage",
                        MainBreakerCapacity = 50,
                        NumberOfOpenSlots = 3
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Garage",
                        DistanceFromPanelMeters = 1.5
                    },
                    CurrentPage = 4,
                    IsComplete = false,
                    CreatedAt = DateTime.UtcNow.AddHours(-6)
                },

                // Assessment 2 - BMW i4 (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Ana",
                        LastName = "Jovanović",
                        Email = "ana.jovanovic@yahoo.com",
                        Phone = "38169987654"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "BMW",
                        Model = "i4 eDrive40",
                        BaseModel = "i4",
                        Year = 2025
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Basement",
                        MainBreakerCapacity = 63,
                        NumberOfOpenSlots = 1
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Driveway",
                        DistanceFromPanelMeters = 8.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Bulevar Oslobođenja",
                            StreetNumber = "123A",
                            City = "Novi Sad",
                            PostalCode = "21000",
                            Country = "Serbia"
                        },
                        NumberOfHighEnergyDevices = 3
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = true,
                        WantsToBuy = false,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "Wallbox",
                            Model = "Pulsar Plus",
                            PowerKw = 22
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    CompletedAt = DateTime.UtcNow.AddDays(-3).AddMinutes(22)
                },

                // Assessment 3 - Volkswagen ID.4 (U toku - strana 3)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Miloš",
                        LastName = "Nikolić",
                        Email = "milos.nikolic@hotmail.com",
                        Phone = "38165555777"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Volkswagen",
                        Model = "ID.4 Pro",
                        BaseModel = "ID.4",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Technical room",
                        MainBreakerCapacity = 40,
                        NumberOfOpenSlots = 2
                    },
                    CurrentPage = 3,
                    IsComplete = false,
                    CreatedAt = DateTime.UtcNow.AddHours(-2)
                },

                // Assessment 4 - Audi e-tron GT (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Jelena",
                        LastName = "Stojanović",
                        Email = "jelena.stojanovic@gmail.com",
                        Phone = "38164777888"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Audi",
                        Model = "e-tron GT quattro",
                        BaseModel = "e-tron GT",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Garage",
                        MainBreakerCapacity = 80,
                        NumberOfOpenSlots = 4
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Underground parking",
                        DistanceFromPanelMeters = 15.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Episkopa Visariona",
                            StreetNumber = "27",
                            City = "Novi Sad",
                            PostalCode = "21000",
                            Country = "Serbia"
                        },
                        NumberOfHighEnergyDevices = 4
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = false,
                        WantsToBuy = true,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "ABB",
                            Model = "Terra AC Wallbox",
                            PowerKw = 22
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    CompletedAt = DateTime.UtcNow.AddDays(-1).AddMinutes(18)
                },

                // Assessment 5 - Honda Prologue (U toku - strana 2)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Stefan",
                        LastName = "Marković",
                        Email = "stefan.markovic@outlook.com",
                        Phone = "38163444555"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Honda",
                        Model = "Prologue Elite",
                        BaseModel = "Prologue",
                        Year = 2025
                    },
                    CurrentPage = 2,
                    IsComplete = false,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-30)
                },

                // Assessment 6 - Hyundai Ioniq 5 (U toku - strana 6)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Milica",
                        LastName = "Pavlović",
                        Email = "milica.pavlovic@gmail.com",
                        Phone = "38165111222"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Hyundai",
                        Model = "Ioniq 5 Limited",
                        BaseModel = "Ioniq 5",
                        Year = 2025
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Entrance",
                        MainBreakerCapacity = 32,
                        NumberOfOpenSlots = 0
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Side of the house",
                        DistanceFromPanelMeters = 12.5
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Đure Jakšića",
                            StreetNumber = "42",
                            City = "Novi Sad",
                            PostalCode = "21000",
                            Country = "Serbia"
                        },
                        NumberOfHighEnergyDevices = 1
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = false,
                        WantsToBuy = true,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "Schneider Electric",
                            Model = "EVlink Wallbox",
                            PowerKw = 7.4
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-7),
                    CompletedAt = DateTime.UtcNow.AddDays(-7).AddMinutes(20)

                },

                // Assessment 7 - Ford Mustang Mach-E (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Nikola",
                        LastName = "Vasić",
                        Email = "nikola.vasic@gmail.com",
                        Phone = "49302345678"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Ford",
                        Model = "Mustang Mach-E Premium",
                        BaseModel = "Mustang Mach-E",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Basement",
                        MainBreakerCapacity = 63,
                        NumberOfOpenSlots = 3
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Carport",
                        DistanceFromPanelMeters = 5.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Alexanderplatz",
                            StreetNumber = "12",
                            City = "Frankfurt",
                            PostalCode = "60313",
                            Country = "Germany"
                        },
                        NumberOfHighEnergyDevices = 3
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = true,
                        WantsToBuy = false,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "KEBA",
                            Model = "KeContact P30",
                            PowerKw = 11
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-4),
                    CompletedAt = DateTime.UtcNow.AddDays(-4).AddMinutes(20)
                },

                // Assessment 8 - Kia EV6 (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Sandra",
                        LastName = "Milić",
                        Email = "sandra.milic@hotmail.com",
                        Phone = "38166123789"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Kia",
                        Model = "EV6 GT-Line",
                        BaseModel = "EV6",
                        Year = 2025
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Garage roof",
                        MainBreakerCapacity = 50,
                        NumberOfOpenSlots = 2
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Workplace",
                        DistanceFromPanelMeters = 30.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Somborska",
                            StreetNumber = "67",
                            City = "Subotica",
                            PostalCode = "24000",
                            Country = "Serbia"
                        },
                        NumberOfHighEnergyDevices = 2
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = false,
                        WantsToBuy = true,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "Siemens",
                            Model = "VersiCharge AC",
                            PowerKw = 7.2
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    CompletedAt = DateTime.UtcNow.AddDays(-2).AddMinutes(22)
                },

                // Assessment 9 - Tesla Model Y (USA) (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Milan",
                        LastName = "Stanković",
                        Email = "milan.stankovic@yahoo.com",
                        Phone = "12125551234"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Tesla",
                        Model = "Model Y Performance",
                        BaseModel = "Model Y",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Garage",
                        MainBreakerCapacity = 100,
                        NumberOfOpenSlots = 6
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Garage",
                        DistanceFromPanelMeters = 2.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Broadway",
                            StreetNumber = "1500",
                            City = "New York",
                            PostalCode = "10036",
                            Country = "United States"
                        },
                        NumberOfHighEnergyDevices = 5
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = false,
                        WantsToBuy = false,
                       /*
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "Tesla",
                            Model = "Wall Connector",
                            PowerKw = 16
                        }
                        */                   //   ovo sam stavio da ima i primer ko ne zeli da kupi a i nema EV punjac
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-6),
                    CompletedAt = DateTime.UtcNow.AddDays(-6).AddMinutes(30)
                },

                // Assessment 10 - BMW iX3 (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Jovana",
                        LastName = "Dimitrijević",
                        Email = "jovana.dimitrijevic@gmail.com",
                        Phone = "38162334455"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "BMW",
                        Model = "iX3 xDrive30",
                        BaseModel = "iX3",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Attic",
                        MainBreakerCapacity = 40,
                        NumberOfOpenSlots = 1
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Yard",
                        DistanceFromPanelMeters = 20.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Vojvode Stepe",
                            StreetNumber = "88",
                            City = "Niš",
                            PostalCode = "18000",
                            Country = "Serbia"
                        },
                        NumberOfHighEnergyDevices = 2
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = false,
                        WantsToBuy = true,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "Wallbox",
                            Model = "Pulsar Plus",
                            PowerKw = 11
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-8),
                    CompletedAt = DateTime.UtcNow.AddDays(-8).AddMinutes(28)
                },

                // Assessment 11 - Volkswagen ID.3 (U toku - strana 4)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Petar",
                        LastName = "Radović",
                        Email = "petar.radovic@outlook.com",
                        Phone = "38167888999"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Volkswagen",
                        Model = "ID.3 Pro S",
                        BaseModel = "ID.3",
                        Year = 2025
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Office",
                        MainBreakerCapacity = 50,
                        NumberOfOpenSlots = 2
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Street",
                        DistanceFromPanelMeters = 25.0
                    },
                    CurrentPage = 4,
                    IsComplete = false,
                    CreatedAt = DateTime.UtcNow.AddHours(-6)
                },

                // Assessment 12 - Audi Q4 e-tron (Germany) (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Danijela",
                        LastName = "Popović",
                        Email = "danijela.popovic@gmail.com",
                        Phone = "498912345678"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Audi",
                        Model = "Q4 e-tron 50 quattro",
                        BaseModel = "Q4 e-tron",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Garage",
                        MainBreakerCapacity = 80,
                        NumberOfOpenSlots = 5
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Garage",
                        DistanceFromPanelMeters = 1.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Maximilianstraße",
                            StreetNumber = "45",
                            City = "Munich",
                            PostalCode = "80539",
                            Country = "Germany"
                        },
                        NumberOfHighEnergyDevices = 4
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = true,
                        WantsToBuy = false,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "Siemens",
                            Model = "VersiCharge AC",
                            PowerKw = 11
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-9),
                    CompletedAt = DateTime.UtcNow.AddDays(-9).AddMinutes(35)
                },

                // Assessment 13 - Honda Prologue (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Aleksa",
                        LastName = "Tomić",
                        Email = "aleksa.tomic@gmail.com",
                        Phone = "38161777888"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Honda",
                        Model = "Prologue Touring",
                        BaseModel = "Prologue",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Garage roof",
                        MainBreakerCapacity = 50,
                        NumberOfOpenSlots = 2
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Workplace",
                        DistanceFromPanelMeters = 30.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Somborska",
                            StreetNumber = "67",
                            City = "Subotica",
                            PostalCode = "24000",
                            Country = "Serbia"
                        },
                        NumberOfHighEnergyDevices = 2
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = false,
                        WantsToBuy = true,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "ABB",
                            Model = "Terra AC Wallbox",
                            PowerKw = 11
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    CompletedAt = DateTime.UtcNow.AddDays(-2).AddMinutes(22)
                },

                // Assessment 14 - Hyundai Ioniq 6 (U toku - strana 5)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Tamara",
                        LastName = "Ilić",
                        Email = "tamara.ilic@hotmail.com",
                        Phone = "38164555666"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Hyundai",
                        Model = "Ioniq 6 SE",
                        BaseModel = "Ioniq 6",
                        Year = 2025
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Outdoor shed",
                        MainBreakerCapacity = 32,
                        NumberOfOpenSlots = 1
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Other",
                        DistanceFromPanelMeters = 18.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Maksima Gorkog",
                            StreetNumber = "134",
                            City = "Pančevo",
                            PostalCode = "26000",
                            Country = "Serbia"
                        },
                        NumberOfHighEnergyDevices = 1
                    },
                    CurrentPage = 5,
                    IsComplete = false,
                    CreatedAt = DateTime.UtcNow.AddHours(-8),
                },

                // Assessment 15 - Ford F-150 Lightning (USA) (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Nenad",
                        LastName = "Milenković",
                        Email = "nenad.milenkovic@outlook.com",
                        Phone = "13234567890"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Ford",
                        Model = "F-150 Lightning Lariat",
                        BaseModel = "F-150 Lightning",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Garage",
                        MainBreakerCapacity = 80,
                        NumberOfOpenSlots = 4
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Garage",
                        DistanceFromPanelMeters = 3.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Sunset Boulevard",
                            StreetNumber = "8500",
                            City = "Los Angeles",
                            PostalCode = "90069",
                            Country = "United States"
                        },
                        NumberOfHighEnergyDevices = 6
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = true,
                        WantsToBuy = false,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "Tesla",
                            Model = "Wall Connector",
                            PowerKw = 16
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    CompletedAt = DateTime.UtcNow.AddDays(-5).AddMinutes(7)

                },
                    // Assessment 16 - Kia Niro EV (Germany) (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Dragana",
                        LastName = "Živković",
                        Email = "dragana.zivkovic@gmail.com",
                        Phone = "494012345678"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Kia",
                        Model = "Niro EV EX",
                        BaseModel = "Niro EV",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Basement",
                        MainBreakerCapacity = 40,
                        NumberOfOpenSlots = 3
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Street",
                        DistanceFromPanelMeters = 22.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Reeperbahn",
                            StreetNumber = "175",
                            City = "Frankfurt",
                            PostalCode = "60313",
                            Country = "Germany"
                        },
                        NumberOfHighEnergyDevices = 2
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = false,
                        WantsToBuy = true,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "Wallbox",
                            Model = "Pulsar Plus",
                            PowerKw = 11
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    CompletedAt = DateTime.UtcNow.AddDays(-10).AddMinutes(26)
                },

                // Assessment 17 - Tesla Model S (U toku - strana 1)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Vladimir",
                        LastName = "Savić",
                        Email = "vladimir.savic@yahoo.com",
                        Phone = "38168111222"
                    },
                    CurrentPage = 1,
                    IsComplete = false,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-45)
                },

                // Assessment 18 - BMW iX (USA) (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Sofija",
                        LastName = "Rašić",
                        Email = "sofija.rasic@gmail.com",
                        Phone = "17135551234"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "BMW",
                        Model = "iX xDrive50",
                        BaseModel = "iX",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Garage",
                        MainBreakerCapacity = 100,
                        NumberOfOpenSlots = 8
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Driveway",
                        DistanceFromPanelMeters = 6.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Main Street",
                            StreetNumber = "2500",
                            City = "Houston",
                            PostalCode = "77002",
                            Country = "United States"
                        },
                        NumberOfHighEnergyDevices = 7
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = false,
                        WantsToBuy = true,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "KEBA",
                            Model = "KeContact P30",
                            PowerKw = 22
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-15),
                    CompletedAt = DateTime.UtcNow.AddDays(-15).AddMinutes(40)
                },

                // Assessment 19 - Volkswagen ID.Buzz (Germany) (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Marija",
                        LastName = "Stanojević",
                        Email = "marija.stanojevic@hotmail.com",
                        Phone = "496912345678"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Volkswagen",
                        Model = "ID.Buzz Pro",
                        BaseModel = "ID.Buzz",
                        Year = 2025
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Technical room",
                        MainBreakerCapacity = 63,
                        NumberOfOpenSlots = 2
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Underground parking",
                        DistanceFromPanelMeters = 12.0
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Zeil",
                            StreetNumber = "89",
                            City = "Frankfurt",
                            PostalCode = "60313",
                            Country = "Germany"
                        },
                        NumberOfHighEnergyDevices = 5
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = true,
                        WantsToBuy = false,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "Schneider Electric",
                            Model = "EVlink Wallbox",
                            PowerKw = 22
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-11),
                    CompletedAt = DateTime.UtcNow.AddDays(-11).AddMinutes(33)
                },

                // Assessment 20 - Audi e-tron (USA) (Kompletiran)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Bojan",
                        LastName = "Milošević",
                        Email = "bojan.milosevic@outlook.com",
                        Phone = "13055551234"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "Audi",
                        Model = "e-tron 55 quattro",
                        BaseModel = "e-tron",
                        Year = 2024
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Garage",
                        MainBreakerCapacity = 150,
                        NumberOfOpenSlots = 10
                    },
                    ChargerInfo = new ChargerInfo
                    {
                        Location = "Garage",
                        DistanceFromPanelMeters = 1.5
                    },
                    HomeInfo = new HomeInfo
                    {
                        Address = new Address
                        {
                            Street = "Ocean Drive",
                            StreetNumber = "1200",
                            City = "Miami",
                            PostalCode = "33139",
                            Country = "United States"
                        },
                        NumberOfHighEnergyDevices = 8
                    },
                    EvChargerInfo = new EvChargerInfo
                    {
                        HasCharger = true,
                        WantsToBuy = false,
                        EvCharger = new EvCharger
                        {
                            Id = Guid.NewGuid().ToString(),
                            Brand = "Schneider Electric",
                            Model = "EVlink Wallbox",
                            PowerKw = 11
                        }
                    },
                    CurrentPage = 6,
                    IsComplete = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-13),
                    CompletedAt = DateTime.UtcNow.AddDays(-13).AddMinutes(27)
                },

                // Assessment 21 - BMW i3 (U toku - strana 3)
                new Assessment
                {
                    Id = Guid.NewGuid().ToString(),
                    CustomerId = Guid.NewGuid().ToString(),
                    PersonalInfo = new PersonalInfo
                    {
                        FirstName = "Luka",
                        LastName = "Mitrović",
                        Email = "luka.mitrovic@gmail.com",
                        Phone = "38162998877"
                    },
                    VehicleInfo = new VehicleInfo
                    {
                        Brand = "BMW",
                        Model = "i3 eDrive35",
                        BaseModel = "i3",
                        Year = 2025
                    },
                    ElectricalPanelInfo = new ElectricalPanelInfo
                    {
                        Location = "Basement",
                        MainBreakerCapacity = 40,
                        NumberOfOpenSlots = 1
                    },
                    CurrentPage = 3,
                    IsComplete = false,
                    CreatedAt = DateTime.UtcNow.AddHours(-3)
                }
            };
        }
    }
}