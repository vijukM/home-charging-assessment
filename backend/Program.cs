using System.Text;
using home_charging_assessment;
using home_charging_assessment.DbConfig;
using home_charging_assessment.Models;
using home_charging_assessment.Repositories;
using home_charging_assessment.RepositoryInterfaces;
using home_charging_assessment.ServiceInterfaces;
using home_charging_assessment.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Azure.Cosmos;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole(UserRoles.Admin));
    options.AddPolicy("UserOrAdmin", policy => policy.RequireRole(UserRoles.User, UserRoles.Admin));
});

var cosmosConfig = builder.Configuration.GetSection("CosmosDb");
var cosmosClient = new CosmosClient(cosmosConfig["Endpoint"], cosmosConfig["Key"]);
builder.Services.AddSingleton(cosmosClient);

var dbResponse = await cosmosClient.CreateDatabaseIfNotExistsAsync(cosmosConfig["DatabaseId"]);

await dbResponse.Database.CreateContainerIfNotExistsAsync(cosmosConfig["ContainerId"],cosmosConfig["PartitionKeyPath"]);

await dbResponse.Database.CreateContainerIfNotExistsAsync( cosmosConfig["UserContainerId"], "/partitionKey");

builder.Services.AddScoped<IAssessmentRepository, AssessmentRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IChargerLocationRepository, ChargerLocationRepository>();
builder.Services.AddScoped<IPanelLocationRepository, PanelLocationRepository>();
builder.Services.AddScoped<IEvChargerRepository, EvChargerRepository>();

builder.Services.AddScoped<IAssessmentService, AssessmentService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IChargerLocationService, ChargerLocationService>();
builder.Services.AddScoped<IPanelLocationService, PanelLocationService>();
builder.Services.AddScoped<IEvChargerService, EvChargerService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

var app = builder.Build();

    using (var scope = app.Services.CreateScope())
    {
        await AssessmentInitializer.InitializeAsync(cosmosClient, "TestDb", "assessments", "/customerId");
        await ChargerLocationInitializer.InitializeAsync(cosmosClient, "TestDb", "chargerLocation", "/id");
        await PanelLocationInitializer.InitializeAsync(cosmosClient, "TestDb", "panelLocation", "/id");
        await EvChargerInitializer.InitializeAsync(cosmosClient, "TestDb", "evCharger", "/id");
        await RandomAssessmentGenerator.PopulateRandomAssessmentsAsync(cosmosClient, "TestDb", "assessments", "/customerId");

}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();