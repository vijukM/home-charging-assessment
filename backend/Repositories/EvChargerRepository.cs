using Microsoft.Azure.Cosmos;
using home_charging_assessment.Models;
using home_charging_assessment.RepositoryInterfaces;

namespace home_charging_assessment.Repositories
{
    public class EvChargerRepository : IEvChargerRepository
    {
        private readonly Container _container;

        public EvChargerRepository(CosmosClient client, IConfiguration config)
        {
            var dbName = config["CosmosDb:DatabaseId"];
            var containerName = config["CosmosDb:EvChargerContainerId"]; // "evCharger"
            _container = client.GetContainer(dbName, containerName);
        }

        public async Task<EvCharger> CreateAsync(EvCharger charger)
        {
            var response = await _container.CreateItemAsync(charger, new PartitionKey(charger.Id));
            return response.Resource;
        }

        public async Task<IEnumerable<EvCharger>> GetAllAsync()
        {
            var query = _container.GetItemQueryIterator<EvCharger>("SELECT * FROM c");
            var results = new List<EvCharger>();
            while (query.HasMoreResults)
            {
                var resp = await query.ReadNextAsync();
                results.AddRange(resp);
            }
            return results;
        }

        public async Task<EvCharger?> GetByIdAsync(string id)
        {
            try
            {
                var resp = await _container.ReadItemAsync<EvCharger>(id, new PartitionKey(id));
                return resp.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task<EvCharger?> UpdateAsync(string id, EvCharger charger)
        {
            var resp = await _container.ReplaceItemAsync(charger, id, new PartitionKey(id));
            return resp.Resource;
        }

        public async Task DeleteAsync(string id)
        {
            await _container.DeleteItemAsync<EvCharger>(id, new PartitionKey(id));
        }
    }
}