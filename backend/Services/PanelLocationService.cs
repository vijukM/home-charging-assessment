using home_charging_assessment.Models;
using home_charging_assessment.RepositoryInterfaces;
using home_charging_assessment.ServiceInterfaces;

namespace home_charging_assessment.Services
{
    public class PanelLocationService : IPanelLocationService
    {
        private readonly IPanelLocationRepository _repo;

        public PanelLocationService(IPanelLocationRepository repo)
        {
            _repo = repo;
        }

        public Task<PanelLocation> CreateAsync(PanelLocation option) => _repo.CreateAsync(option);
        public Task<IEnumerable<PanelLocation>> GetAllAsync() => _repo.GetAllAsync();
        public Task<PanelLocation?> GetByIdAsync(string id) => _repo.GetByIdAsync(id);
        public Task<PanelLocation?> UpdateAsync(string id, PanelLocation option) => _repo.UpdateAsync(id, option);
        public Task DeleteAsync(string id) => _repo.DeleteAsync(id);
    }
}
