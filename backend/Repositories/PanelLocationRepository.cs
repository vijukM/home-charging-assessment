using Microsoft.Azure.Cosmos;
using home_charging_assessment.Models;
using home_charging_assessment.RepositoryInterfaces;

namespace home_charging_assessment.Repositories
{
    public class PanelLocationRepository : IPanelLocationRepository
    {
        private readonly Container _container;

        public PanelLocationRepository(CosmosClient client, IConfiguration config)
        {
            var dbName = config["CosmosDb:DatabaseId"];
            var containerName = config["CosmosDb:PanelLocationContainerId"]; // npr. "panelLocation"
            _container = client.GetContainer(dbName, containerName);
        }

        public async Task<PanelLocation> CreateAsync(PanelLocation option)
        {
            var response = await _container.CreateItemAsync(option, new PartitionKey(option.Id));
            return response.Resource;
        }

        public async Task<IEnumerable<PanelLocation>> GetAllAsync()
        {
            var query = _container.GetItemQueryIterator<PanelLocation>("SELECT * FROM c");
            var results = new List<PanelLocation>();
            while (query.HasMoreResults)
            {
                var resp = await query.ReadNextAsync();
                results.AddRange(resp);
            }
            return results;
        }

        public async Task<PanelLocation?> GetByIdAsync(string id)
        {
            try
            {
                var resp = await _container.ReadItemAsync<PanelLocation>(id, new PartitionKey(id));
                return resp.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task<PanelLocation?> UpdateAsync(string id, PanelLocation option)
        {
            var resp = await _container.ReplaceItemAsync(option, id, new PartitionKey(id));
            return resp.Resource;
        }

        public async Task DeleteAsync(string id)
        {
            await _container.DeleteItemAsync<PanelLocation>(id, new PartitionKey(id));
        }
    }
}
