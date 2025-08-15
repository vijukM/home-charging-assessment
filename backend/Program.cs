using home_charging_assessment;
using home_charging_assessment.DbConfig;
using home_charging_assessment.Repositories;
using home_charging_assessment.RepositoryInterfaces;
using home_charging_assessment.ServiceInterfaces;
using home_charging_assessment.Services;
using Microsoft.Azure.Cosmos;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var cosmosConfig = builder.Configuration.GetSection("CosmosDb");
var cosmosClient = new CosmosClient(cosmosConfig["Endpoint"], cosmosConfig["Key"]);
builder.Services.AddSingleton(cosmosClient);

var dbResponse = await cosmosClient.CreateDatabaseIfNotExistsAsync(cosmosConfig["DatabaseId"]);
await dbResponse.Database.CreateContainerIfNotExistsAsync(
    cosmosConfig["ContainerId"],
    cosmosConfig["PartitionKeyPath"]);

builder.Services.AddScoped<IAssessmentRepository, AssessmentRepository>();
builder.Services.AddScoped<IAssessmentService, AssessmentService>();
builder.Services.AddScoped<IChargerLocationRepository, ChargerLocationRepository>();
builder.Services.AddScoped<IChargerLocationService, ChargerLocationService>();
builder.Services.AddScoped<IPanelLocationRepository, PanelLocationRepository>();
builder.Services.AddScoped<IPanelLocationService, PanelLocationService>();

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
    await ChargerLocationInitializer.InitializeAsync( cosmosClient,"TestDb","chargerLocation", "/id" );
    await PanelLocationInitializer.InitializeAsync(cosmosClient, "TestDb", "panelLocation", "/id");

}


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowReact");

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
