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

        // Existing methods
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

        public async Task<Assessment?> UpdateAsync(string id, string partitionKey, Assessment updated)
        {
            var response = await _container.ReplaceItemAsync(
                updated,
                id,
                new PartitionKey(partitionKey)
            );
            return response.Resource;
        }

        // NEW ADMIN METHODS

        /// <summary>
        /// Get all assessments (use with caution - could be expensive)
        /// </summary>
        public async Task<List<Assessment>> GetAllAssessmentsAsync()
        {
            // Koristi Cosmos DB timestamp (_ts) ili bilo koje polje koje već postoji
            var query = "SELECT * FROM c ORDER BY c._ts DESC";
            return await ExecuteQueryAsync<Assessment>(query);
        }

        /// <summary>
        /// Get assessments by specific user ID
        /// </summary>
        public async Task<List<Assessment>> GetAssessmentsByUserIdAsync(string userId)
        {
            var query = "SELECT * FROM c WHERE c.customerId = @userId";
            var queryDef = new QueryDefinition(query)
                .WithParameter("@userId", userId);
            
            return await ExecuteQueryAsync<Assessment>(queryDef);
        }

        /// <summary>
        /// Delete assessment by ID and partition key
        /// </summary>
        public async Task<bool> DeleteAsync(string id, string partitionKey)
        {
            try
            {
                await _container.DeleteItemAsync<Assessment>(id, new PartitionKey(partitionKey));
                return true;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return false;
            }
        }

        /// <summary>
        /// Get assessments by status (completed, incomplete)
        /// </summary>
        public async Task<List<Assessment>> GetAssessmentsByStatusAsync(string status)
        {
            var query = status.ToLower() switch
            {
                "completed" => "SELECT * FROM c WHERE c.isComplete = true ORDER BY c._ts DESC",
                "incomplete" => "SELECT * FROM c WHERE c.isComplete = false AND c.currentPage > 0 ORDER BY c._ts DESC",
                _ => "SELECT * FROM c ORDER BY c._ts DESC"
            };

            return await ExecuteQueryAsync<Assessment>(query);
        }

        /// <summary>
        /// Get assessments within date range using Cosmos DB timestamp
        /// </summary>
        public async Task<List<Assessment>> GetAssessmentsByDateRangeAsync(DateTime fromDate, DateTime toDate)
        {
            // Koristi _ts (Unix timestamp) koji Cosmos DB automatski dodaje
            var fromTimestamp = ((DateTimeOffset)fromDate).ToUnixTimeSeconds();
            var toTimestamp = ((DateTimeOffset)toDate).ToUnixTimeSeconds();
            
            var query = "SELECT * FROM c WHERE c._ts >= @fromDate AND c._ts <= @toDate ORDER BY c._ts DESC";
            var queryDef = new QueryDefinition(query)
                .WithParameter("@fromDate", fromTimestamp)
                .WithParameter("@toDate", toTimestamp);
            
            return await ExecuteQueryAsync<Assessment>(queryDef);
        }

        /// <summary>
        /// Get total count of assessments
        /// </summary>
        public async Task<int> GetAssessmentCountAsync()
        {
            var query = "SELECT VALUE COUNT(1) FROM c";
            var results = await ExecuteQueryAsync<int>(query);
            return results.FirstOrDefault();
        }

        /// <summary>
        /// Get only completed assessments
        /// </summary>
        public async Task<List<Assessment>> GetCompletedAssessmentsAsync()
        {
            var query = "SELECT * FROM c WHERE c.isComplete = true";
            return await ExecuteQueryAsync<Assessment>(query);
        }

        /// <summary>
        /// Get incomplete assessments (started but not finished)
        /// </summary>
        public async Task<List<Assessment>> GetIncompleteAssessmentsAsync()
        {
            var query = "SELECT * FROM c WHERE c.isComplete = false AND c.currentPage > 0";
            return await ExecuteQueryAsync<Assessment>(query);
        }

        // ADDITIONAL HELPER METHODS FOR BETTER PERFORMANCE

        /// <summary>
        /// Get assessments with pagination (more efficient for large datasets)
        /// </summary>
        public async Task<(List<Assessment> items, string? continuationToken)> GetAssessmentsPagedAsync(
            int maxItemCount = 100, 
            string? continuationToken = null,
            string? whereClause = null)
        {
            var query = string.IsNullOrEmpty(whereClause) 
                ? "SELECT * FROM c ORDER BY c._ts DESC"
                : $"SELECT * FROM c WHERE ({whereClause}) ORDER BY c._ts DESC";

            var queryDefinition = new QueryDefinition(query);
            var queryRequestOptions = new QueryRequestOptions
            {
                MaxItemCount = maxItemCount
            };

            var iterator = _container.GetItemQueryIterator<Assessment>(
                queryDefinition, 
                continuationToken, 
                queryRequestOptions);

            var items = new List<Assessment>();
            string? nextContinuationToken = null;

            if (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                items.AddRange(response);
                nextContinuationToken = response.ContinuationToken;
            }

            return (items, nextContinuationToken);
        }

        /// <summary>
        /// Get assessment counts by status (efficient for statistics)
        /// </summary>
        public async Task<Dictionary<string, int>> GetAssessmentCountsByStatusAsync()
        {
            var queries = new Dictionary<string, string>
            {
                ["total"] = "SELECT VALUE COUNT(1) FROM c",
                ["completed"] = "SELECT VALUE COUNT(1) FROM c WHERE c.isComplete = true",
                ["incomplete"] = "SELECT VALUE COUNT(1) FROM c WHERE c.isComplete = false AND c.currentPage > 0"
            };

            var results = new Dictionary<string, int>();

            foreach (var kvp in queries)
            {
                var counts = await ExecuteQueryAsync<int>(kvp.Value);
                results[kvp.Key] = counts.FirstOrDefault();
            }

            return results;
        }

        /// <summary>
        /// Get top cities with assessment counts
        /// </summary>
        public async Task<List<(string city, int count)>> GetTopCitiesAsync(int topCount = 10)
        {
            var query = @"
                SELECT c.homeInfo.address.city as city, COUNT(1) as count 
                FROM c 
                WHERE IS_DEFINED(c.homeInfo.address.city) AND c.homeInfo.address.city != '' 
                GROUP BY c.homeInfo.address.city 
                ORDER BY COUNT(1) DESC 
                OFFSET 0 LIMIT @topCount";

            var queryDef = new QueryDefinition(query)
                .WithParameter("@topCount", topCount);

            var results = await ExecuteQueryAsync<dynamic>(queryDef);
            
            return results.Select(r => ((string)r.city, (int)r.count)).ToList();
        }

        /// <summary>
        /// Get top vehicle brands with assessment counts
        /// </summary>
        public async Task<List<(string brand, int count)>> GetTopVehicleBrandsAsync(int topCount = 10)
        {
            var query = @"
                SELECT c.vehicleInfo.brand as brand, COUNT(1) as count 
                FROM c 
                WHERE IS_DEFINED(c.vehicleInfo.brand) AND c.vehicleInfo.brand != '' 
                GROUP BY c.vehicleInfo.brand 
                ORDER BY COUNT(1) DESC 
                OFFSET 0 LIMIT @topCount";

            var queryDef = new QueryDefinition(query)
                .WithParameter("@topCount", topCount);

            var results = await ExecuteQueryAsync<dynamic>(queryDef);
            
            return results.Select(r => ((string)r.brand, (int)r.count)).ToList();
        }

        /// <summary>
        /// Get assessments created in the last N days using Cosmos DB timestamp
        /// </summary>
        public async Task<List<Assessment>> GetRecentAssessmentsAsync(int days = 30)
        {
            var fromDate = DateTime.UtcNow.AddDays(-days);
            var fromTimestamp = ((DateTimeOffset)fromDate).ToUnixTimeSeconds();
            
            var query = "SELECT * FROM c WHERE c._ts >= @fromDate ORDER BY c._ts DESC";
            var queryDef = new QueryDefinition(query)
                .WithParameter("@fromDate", fromTimestamp);
            
            return await ExecuteQueryAsync<Assessment>(queryDef);
        }

        // PRIVATE HELPER METHODS

        /// <summary>
        /// Execute query with string SQL
        /// </summary>
        private async Task<List<T>> ExecuteQueryAsync<T>(string query)
        {
            var queryDefinition = new QueryDefinition(query);
            return await ExecuteQueryAsync<T>(queryDefinition);
        }

        /// <summary>
        /// Execute parameterized query
        /// </summary>
        private async Task<List<T>> ExecuteQueryAsync<T>(QueryDefinition queryDefinition)
        {
            var results = new List<T>();
            var iterator = _container.GetItemQueryIterator<T>(queryDefinition);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }

        /// <summary>
        /// Bulk delete assessments (admin utility)
        /// </summary>
        public async Task<int> BulkDeleteAssessmentsAsync(List<(string id, string partitionKey)> assessmentsToDelete)
        {
            var deletedCount = 0;
            var tasks = new List<Task<bool>>();

            foreach (var (id, partitionKey) in assessmentsToDelete)
            {
                tasks.Add(DeleteAsync(id, partitionKey));
            }

            var results = await Task.WhenAll(tasks);
            deletedCount = results.Count(r => r);

            return deletedCount;
        }

        /// <summary>
        /// Search assessments by text (name, email, city)
        /// </summary>
        public async Task<List<Assessment>> SearchAssessmentsAsync(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm))
                return new List<Assessment>();

            var query = @"
                SELECT * FROM c 
                WHERE CONTAINS(LOWER(c.personalInfo.firstName), @searchTerm) 
                   OR CONTAINS(LOWER(c.personalInfo.lastName), @searchTerm)
                   OR CONTAINS(LOWER(c.personalInfo.email), @searchTerm)
                   OR CONTAINS(LOWER(c.homeInfo.address.city), @searchTerm)
                ORDER BY c.createdAt DESC";

            var queryDef = new QueryDefinition(query)
                .WithParameter("@searchTerm", searchTerm.ToLower());

            return await ExecuteQueryAsync<Assessment>(queryDef);
        }
    }
}