using Microsoft.Azure.Cosmos;
using home_charging_assessment.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace home_charging_assessment.DbConfig
{
    public class EvChargerInitializer
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
                var defaultChargers = new List<EvCharger>
                {
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Tesla", Model = "Wall Connector Gen 3", PowerKw = 7.4 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Tesla", Model = "Wall Connector Gen 3", PowerKw = 11.5 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Tesla", Model = "Wall Connector Gen 3", PowerKw = 16 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Tesla", Model = "Mobile Connector", PowerKw = 3.7 },

                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Wallbox", Model = "Pulsar Plus", PowerKw = 7.4 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Wallbox", Model = "Pulsar Plus", PowerKw = 22 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Wallbox", Model = "Commander 2", PowerKw = 11 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Wallbox", Model = "Commander 2", PowerKw = 22 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Wallbox", Model = "Copper SB", PowerKw = 11 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Wallbox", Model = "Copper SB", PowerKw = 22 },

                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "ABB", Model = "Terra AC Wallbox", PowerKw = 7.4 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "ABB", Model = "Terra AC Wallbox", PowerKw = 22 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "ABB", Model = "Terra Home", PowerKw = 11 },

                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Schneider Electric", Model = "EVlink Wallbox", PowerKw = 7.4 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Schneider Electric", Model = "EVlink Wallbox", PowerKw = 22 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Schneider Electric", Model = "EVlink Pro AC", PowerKw = 11 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Schneider Electric", Model = "EVlink Pro AC", PowerKw = 22 },

                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Siemens", Model = "VersiCharge AC", PowerKw = 7.2 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Siemens", Model = "VersiCharge AC", PowerKw = 11 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Siemens", Model = "VersiCharge IQ", PowerKw = 7.4 },

                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "JuiceBox", Model = "JuiceBox 32", PowerKw = 7.7 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "JuiceBox", Model = "JuiceBox 40", PowerKw = 10 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "JuiceBox", Model = "JuiceBox 48", PowerKw = 11.5 },

                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "KEBA", Model = "KeContact P30", PowerKw = 11 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "KEBA", Model = "KeContact P30", PowerKw = 22 },

                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Mennekes", Model = "AMTRON Compact", PowerKw = 11 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Mennekes", Model = "AMTRON Xtra", PowerKw = 22 },

                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "EO Charging", Model = "EO Mini Pro 3", PowerKw = 7.4 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "EO Charging", Model = "EO Genius", PowerKw = 22 },

                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Hypervolt", Model = "Home 2.1", PowerKw = 7 },
    
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Pod Point", Model = "Solo 3", PowerKw = 7 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Pod Point", Model = "Solo 3", PowerKw = 22 },

                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Generic", Model = "Type 2 AC", PowerKw = 3.7 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Generic", Model = "Type 2 AC", PowerKw = 7.4 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Generic", Model = "Type 2 AC", PowerKw = 11 },
                    new EvCharger { Id = Guid.NewGuid().ToString(), Brand = "Generic", Model = "Type 2 AC", PowerKw = 22 }
                };


                foreach (var charger in defaultChargers)
                {
                    await container.CreateItemAsync(charger, new PartitionKey(charger.Id));
                }

                Console.WriteLine("Popunjeni default EV punjači u containeru.");
            }
            else
            {
                Console.WriteLine("Container već sadrži podatke, nije potrebno ubacivati default EV punjače.");
            }
        }
    }
}