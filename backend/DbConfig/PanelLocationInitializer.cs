using Microsoft.Azure.Cosmos;
using home_charging_assessment.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public static class PanelLocationInitializer
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
            var defaultLocations = new List<PanelLocation>
            {
                new PanelLocation { Id = Guid.NewGuid().ToString(), Name = "Garage" },
                new PanelLocation { Id = Guid.NewGuid().ToString(), Name = "Basement" },
                new PanelLocation { Id = Guid.NewGuid().ToString(), Name = "Attic" },
                new PanelLocation { Id = Guid.NewGuid().ToString(), Name = "Technical room" },
                new PanelLocation { Id = Guid.NewGuid().ToString(), Name = "Entrance" },
                new PanelLocation { Id = Guid.NewGuid().ToString(), Name = "Office" },
                new PanelLocation { Id = Guid.NewGuid().ToString(), Name = "Garage roof" },
                new PanelLocation { Id = Guid.NewGuid().ToString(), Name = "Outdoor shed" },
                new PanelLocation { Id = Guid.NewGuid().ToString(), Name = "Other" }
            };

            foreach (var loc in defaultLocations)
            {
                await container.CreateItemAsync(loc, new PartitionKey(loc.Id));
            }

            Console.WriteLine("Popunjene default lokacije panela u containeru.");
        }
        else
        {
            Console.WriteLine("Container već sadrži podatke, nije potrebno ubacivati default lokacije.");
        }
    }
}
