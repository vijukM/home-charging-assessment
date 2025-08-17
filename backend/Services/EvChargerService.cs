using home_charging_assessment.Models;
using home_charging_assessment.RepositoryInterfaces;
using home_charging_assessment.ServiceInterfaces;

namespace home_charging_assessment.Services
{
    public class EvChargerService : IEvChargerService
    {
        private readonly IEvChargerRepository _repo;

        public EvChargerService(IEvChargerRepository repo)
        {
            _repo = repo;
        }

        public Task<EvCharger> CreateAsync(EvCharger charger) => _repo.CreateAsync(charger);
        public Task<IEnumerable<EvCharger>> GetAllAsync() => _repo.GetAllAsync();
        public Task<EvCharger?> GetByIdAsync(string id) => _repo.GetByIdAsync(id);
        public Task<EvCharger?> UpdateAsync(string id, EvCharger charger) => _repo.UpdateAsync(id, charger);
        public Task DeleteAsync(string id) => _repo.DeleteAsync(id);
    }
}
