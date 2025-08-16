using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;
using home_charging_assessment.Models;
using home_charging_assessment.RepositoryInterfaces;

namespace home_charging_assessment.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly Container _container;

        public UserRepository(CosmosClient cosmosClient, IConfiguration config)
        {
            var dbName = config["CosmosDb:DatabaseId"];
            var containerName = config["CosmosDb:UserContainerId"];
            _container = cosmosClient.GetContainer(dbName, containerName);
        }

        public async Task<Models.User> CreateAsync(Models.User user)
        {
            var response = await _container.CreateItemAsync(user, new PartitionKey(user.PartitionKey));
            return response.Resource;
        }

        public async Task<Models.   User?> GetByIdAsync(string id)
        {
            try
            {
                var response = await _container.ReadItemAsync<Models.User>(id, new PartitionKey("USER"));
                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task<Models.User?> GetByUsernameAsync(string username)
        {
            var query = _container.GetItemLinqQueryable<Models.User>()
                .Where(u => u.Username == username)
                .Take(1);

            using var iterator = query.ToFeedIterator();
            if (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                return response.FirstOrDefault();
            }

            return null;
        }

        public async Task<Models.User?> GetByEmailAsync(string email)
        {
            var query = _container.GetItemLinqQueryable<Models.User>()
                .Where(u => u.Email == email)
                .Take(1);

            using var iterator = query.ToFeedIterator();
            if (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                return response.FirstOrDefault();
            }

            return null;
        }

        public async Task<Models.User?> GetByVerificationTokenAsync(string token)
        {
            var query = _container.GetItemLinqQueryable<Models.User>()
                .Where(u => u.EmailVerificationToken == token)
                .Take(1);

            using var iterator = query.ToFeedIterator();
            if (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                return response.FirstOrDefault();
            }

            return null;
        }

        public async Task<Models.User?> GetByPasswordResetTokenAsync(string token)
        {
            var query = _container.GetItemLinqQueryable<Models.User>()
                .Where(u => u.PasswordResetToken == token)
                .Take(1);

            using var iterator = query.ToFeedIterator();
            if (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                return response.FirstOrDefault();
            }

            return null;
        }

        public async Task<Models.User?> UpdateAsync(Models.User user)
        {
            var response = await _container.ReplaceItemAsync(
                user,
                user.Id,
                new PartitionKey(user.PartitionKey)
            );
            return response.Resource;
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            var user = await GetByUsernameAsync(username);
            return user != null;
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            var user = await GetByEmailAsync(email);
            return user != null;
        }

        public async Task<IEnumerable<Models.User>> GetAllUsersAsync()
        {
            var query = _container.GetItemLinqQueryable<Models.User>().ToFeedIterator();
            var users = new List<Models.User>();

            while (query.HasMoreResults)
            {
                var response = await query.ReadNextAsync();
                users.AddRange(response);
            }

            return users;
        }
    }
}