namespace home_charging_assessment.ServiceInterfaces
{
    public interface IEmailService
    {
        Task SendEmailVerificationAsync(string email, string username, string verificationUrl);
        Task SendPasswordResetAsync(string email, string username, string resetUrl);
        Task SendWelcomeEmailAsync(string email, string username);
    }
}