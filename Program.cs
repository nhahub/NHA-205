using Codexly.Data;
using Codexly.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Codexly
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            // For testing: Use in-memory database (no SQL Server needed)
            // To switch to SQL Server: Change UseInMemoryDatabase to UseSqlServer and uncomment connectionString
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase("CodexlyTestDb"));
            builder.Services.AddDatabaseDeveloperPageExceptionFilter();
            
            // Uncomment below and comment above when ready to use SQL Server:
            // var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            // builder.Services.AddDbContext<ApplicationDbContext>(options =>
            //     options.UseSqlServer(connectionString));

            // Disable email confirmation for easier testing
            builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = false)
                .AddEntityFrameworkStores<ApplicationDbContext>();
            builder.Services.AddControllersWithViews();

            // Register TaskService
            builder.Services.AddScoped<ITaskService, TaskService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseMigrationsEndPoint();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");
            app.MapRazorPages();

            app.Run();
        }
    }
}
