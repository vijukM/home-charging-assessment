using home_charging_assessment.Models;

namespace home_charging_assessment.RepositoryInterfaces
{
    public interface IEvChargerRepository
    {
        Task<EvCharger> CreateAsync(EvCharger charger);
        Task<IEnumerable<EvCharger>> GetAllAsync();
        Task<EvCharger?> GetByIdAsync(string id);
        Task<EvCharger?> UpdateAsync(string id, EvCharger charger);
        Task DeleteAsync(string id);
    }
}