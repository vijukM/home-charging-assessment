using Microsoft.Azure.Cosmos;
using home_charging_assessment.Models;
using home_charging_assessment.RepositoryInterfaces;

namespace home_charging_assessment.Repositories
{
    public class ChargerLocationRepository : IChargerLocationRepository
    {
        private readonly Container _container;

        public ChargerLocationRepository(CosmosClient client, IConfiguration config)
        {
            var dbName = config["CosmosDb:DatabaseId"];
            var containerName = config["CosmosDb:ChargerLocationContainerId"]; // npr. "chargerLocation"
            _container = client.GetContainer(dbName, containerName);
        }

        public async Task<ChargerLocation> CreateAsync(ChargerLocation option)
        {
            var response = await _container.CreateItemAsync(option, new PartitionKey(option.Id));
            return response.Resource;
        }

        public async Task<IEnumerable<ChargerLocation>> GetAllAsync()
        {
            var query = _container.GetItemQueryIterator<ChargerLocation>("SELECT * FROM c");
            var results = new List<ChargerLocation>();
            while (query.HasMoreResults)
            {
                var resp = await query.ReadNextAsync();
                results.AddRange(resp);
            }
            return results;
        }

        public async Task<ChargerLocation?> GetByIdAsync(string id)
        {
            try
            {
                var resp = await _container.ReadItemAsync<ChargerLocation>(id, new PartitionKey(id));
                return resp.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task<ChargerLocation?> UpdateAsync(string id, ChargerLocation option)
        {
            var resp = await _container.ReplaceItemAsync(option, id, new PartitionKey(id));
            return resp.Resource;
        }

        public async Task DeleteAsync(string id)
        {
            await _container.DeleteItemAsync<ChargerLocation>(id, new PartitionKey(id));
        }
    }
}
