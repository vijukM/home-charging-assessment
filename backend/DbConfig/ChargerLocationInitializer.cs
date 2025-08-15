using Microsoft.Azure.Cosmos;
using home_charging_assessment.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace home_charging_assessment.DbConfig
{
    public class ChargerLocationInitializer
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
                var defaultLocations = new List<ChargerLocation>
                {
                    new ChargerLocation { Id = Guid.NewGuid().ToString(), Name = "Garage" },
                    new ChargerLocation { Id = Guid.NewGuid().ToString(), Name = "Driveway" },
                    new ChargerLocation { Id = Guid.NewGuid().ToString(), Name = "Carport" },
                    new ChargerLocation { Id = Guid.NewGuid().ToString(), Name = "Underground parking" },
                    new ChargerLocation { Id = Guid.NewGuid().ToString(), Name = "Street" },
                    new ChargerLocation { Id = Guid.NewGuid().ToString(), Name = "Yard" },
                    new ChargerLocation { Id = Guid.NewGuid().ToString(), Name = "Side of the house" },
                    new ChargerLocation { Id = Guid.NewGuid().ToString(), Name = "Workplace" },
                    new ChargerLocation { Id = Guid.NewGuid().ToString(), Name = "Other" }
                };

                foreach (var loc in defaultLocations)
                {
                    await container.CreateItemAsync(loc, new PartitionKey(loc.Id));
                }

                Console.WriteLine("Popunjene default lokacije punjača u containeru.");
            }
            else
            {
                Console.WriteLine("Container već sadrži podatke, nije potrebno ubacivati default lokacije.");
            }
        }
    }
}
