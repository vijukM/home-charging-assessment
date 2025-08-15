using home_charging_assessment.Models;

namespace home_charging_assessment.ServiceInterfaces
{
    public interface IPanelLocationService
    {
        Task<PanelLocation> CreateAsync(PanelLocation option);
        Task<IEnumerable<PanelLocation>> GetAllAsync();
        Task<PanelLocation?> GetByIdAsync(string id);
        Task<PanelLocation?> UpdateAsync(string id, PanelLocation option);
        Task DeleteAsync(string id);
    }
}
