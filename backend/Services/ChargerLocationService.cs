using home_charging_assessment.Models;
using home_charging_assessment.RepositoryInterfaces;
using home_charging_assessment.ServiceInterfaces;

namespace home_charging_assessment.Services
{
    public class ChargerLocationService : IChargerLocationService
    {
        private readonly IChargerLocationRepository _repo;

        public ChargerLocationService(IChargerLocationRepository repo)
        {
            _repo = repo;
        }

        public Task<ChargerLocation> CreateAsync(ChargerLocation option) => _repo.CreateAsync(option);
        public Task<IEnumerable<ChargerLocation>> GetAllAsync() => _repo.GetAllAsync();
        public Task<ChargerLocation?> GetByIdAsync(string id) => _repo.GetByIdAsync(id);
        public Task<ChargerLocation?> UpdateAsync(string id, ChargerLocation option) => _repo.UpdateAsync(id, option);
        public Task DeleteAsync(string id) => _repo.DeleteAsync(id);
    }
}
