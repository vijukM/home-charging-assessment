using home_charging_assessment.Models;

namespace home_charging_assessment.RepositoryInterfaces
{
    public interface IChargerLocationRepository
    {
        Task<ChargerLocation> CreateAsync(ChargerLocation option);
        Task<IEnumerable<ChargerLocation>> GetAllAsync();
        Task<ChargerLocation?> GetByIdAsync(string id);
        Task<ChargerLocation?> UpdateAsync(string id, ChargerLocation option);
        Task DeleteAsync(string id);
    }
}
