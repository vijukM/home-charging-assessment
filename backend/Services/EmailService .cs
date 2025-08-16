using System.Net;
using System.Net.Mail;
using home_charging_assessment.ServiceInterfaces;

namespace home_charging_assessment.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _frontendUrl;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            var smtpSettings = _configuration.GetSection("SmtpSettings");
            _fromEmail = smtpSettings["FromEmail"] ?? "noreply@evcharge.app";
            _fromName = smtpSettings["FromName"] ?? "EV Charge Assessment";
            _frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        }

        public async Task SendEmailVerificationAsync(string email, string username, string verificationUrl)
        {
            var subject = "✅ Verify Your Email - EV Charge Assessment";

            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
                        <h2 style='color: #2d5a2d; text-align: center;'>🚗⚡ Welcome to EV Charge Assessment!</h2>
                        
                        <p style='font-size: 16px; color: #333;'>Hi <strong>{username}</strong>,</p>
                        
                        <p style='font-size: 16px; color: #333; line-height: 1.6;'>
                            Thank you for joining us! To complete your registration, please verify your email address by clicking the button below:
                        </p>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{verificationUrl}' 
                               style='background: #28a745; color: white; padding: 15px 30px; text-decoration: none; 
                                      border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold;
                                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);'>
                                ✅ VERIFY MY EMAIL
                            </a>
                        </div>
                        
                        <div style='background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;'>
                            <p style='margin: 0; color: #1976d2; font-size: 14px;'>
                                <strong>Note:</strong> This verification link will expire in 24 hours for security reasons.
                            </p>
                        </div>
                        
                        <p style='font-size: 14px; color: #666; margin-top: 30px;'>
                            If you can't click the button, copy and paste this link into your browser:
                        </p>
                        <p style='word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 12px; color: #2d5a2d;'>
                            {verificationUrl}
                        </p>
                        
                        <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
                        
                        <p style='color: #888; font-size: 12px; text-align: center;'>
                            If you didn't create an account with us, please ignore this email.<br>
                            This email was sent from EV Charge Assessment System.
                        </p>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendPasswordResetAsync(string email, string username, string resetUrl)
        {
            var subject = "🔑 Password Reset - EV Charge Assessment";

            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;'>
                        <h2 style='color: #dc3545; text-align: center;'>🔒 Password Reset Request</h2>
                        
                        <p>Hi <strong>{username}</strong>,</p>
                        
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{resetUrl}' 
                               style='background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; 
                                      border-radius: 8px; display: inline-block; font-weight: bold;'>
                                🔑 RESET PASSWORD
                            </a>
                        </div>
                        
                        <p style='color: #666; font-size: 14px;'>This link will expire in 1 hour.</p>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendWelcomeEmailAsync(string email, string username)
        {
            var subject = "🎉 Welcome to EV Charge Assessment!";

            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;'>
                        <h2 style='color: #28a745; text-align: center;'>🎉 Email Verified Successfully!</h2>
                        
                        <p>Hi <strong>{username}</strong>,</p>
                        
                        <p>Congratulations! Your email has been verified and your account is now active.</p>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{_frontendUrl}' 
                               style='background: #2d5a2d; color: white; padding: 15px 30px; text-decoration: none; 
                                      border-radius: 8px; display: inline-block; font-weight: bold;'>
                                🚗⚡ START ASSESSMENT
                            </a>
                        </div>
                        
                        <p>You can now access all features of our platform!</p>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");

                _logger.LogInformation("🔄 Sending email via SendGrid to {Email} with subject: {Subject}", to, subject);

                using var smtpClient = new SmtpClient
                {
                    Host = smtpSettings["Host"],
                    Port = int.Parse(smtpSettings["Port"]),
                    EnableSsl = bool.Parse(smtpSettings["EnableSsl"]),
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(
                        smtpSettings["Username"], // "apikey"
                        smtpSettings["Password"]  // Tvoj SendGrid API key
                    ),
                    Timeout = 30000
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_fromEmail, _fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(to);

                await smtpClient.SendMailAsync(mailMessage);
                _logger.LogInformation("✅ Email sent successfully via SendGrid to {Email}", to);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to send email via SendGrid to {Email}: {Message}", to, ex.Message);
                throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
            }
        }
    }
}
