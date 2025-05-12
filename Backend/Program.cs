using Backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

//Register EF Core with In-Memory DB
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("ExpenseDb"));

//Register Controllers
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Ports must match with frontend
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("AllowFrontend");

//Use routing for API endpoints
app.UseRouting();
app.UseAuthorization();

//Map controller routes
app.MapControllers();

app.Run();
