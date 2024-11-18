using Microsoft.EntityFrameworkCore;
using ExamProject.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppointmentDbContext>(options =>
{
    // Get the Database Conection String
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseMySQL(connectionString!);
});

// Configure CORS policy to allow FED to send BED Requests
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
    options.AddPolicy("AllowSpecificOrigin",
        policyBuilder =>
        {
            policyBuilder.WithOrigins(allowedOrigins)
                         .AllowAnyHeader()
                         .AllowAnyMethod();
        });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure the HTTP request pipeline.
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    // Used Stack Overflow (Accepted Answer): https://stackoverflow.com/questions/39116047/how-to-change-base-url-of-swagger-in-asp-net-core
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "V1");
        c.RoutePrefix = "doc";
    });
}


// IMPORTANT!! - Allows CORS Policy reading
app.UseCors("AllowSpecificOrigin");


app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
