using Microsoft.Azure.Cosmos;
using home_charging_assessment.Models;
using home_charging_assessment.RepositoryInterfaces;

namespace home_charging_assessment.Repositories
{
    public class AssessmentRepository : IAssessmentRepository
    {
        private readonly Container _container;

        public AssessmentRepository(CosmosClient cosmosClient, IConfiguration config)
        {
            var dbName = config["CosmosDb:DatabaseId"];
            var containerName = config["CosmosDb:ContainerId"];
            _container = cosmosClient.GetContainer(dbName, containerName);
        }

        public async Task<Assessment> CreateAsync(Assessment assessment)
        {
            var response = await _container.CreateItemAsync(assessment, new PartitionKey(assessment.CustomerId));
            return response.Resource;
        }

        public async Task<Assessment?> GetAsync(string id, string partitionKey)
        {
            try
            {
                var response = await _container.ReadItemAsync<Assessment>(id, new PartitionKey(partitionKey));
                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }
    }
}
