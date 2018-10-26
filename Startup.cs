using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Diagnostics;
using Newtonsoft.Json.Serialization;
using System.Data;
using System.Data.Odbc;
using Microsoft.Extensions.Options;
using System.Data.SqlClient;

namespace Meshcutter
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options => options.AddPolicy("AllowAny", x =>
              x.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()));
            services.AddSignalR();
            services.AddOptions();
            services.Configure<AppSettings>(Configuration);
            var connectionStrings = Configuration.GetSection("ConnectionStrings");
            var defaultConnectionString = connectionStrings[Configuration["DefaultConnectionString"]];
            var sybaseConnectionString = connectionStrings[Configuration["SybaseConnectionString"]];
            var mssqlConnectionString = connectionStrings[Configuration["MssqlConnectionString"]];

            // DEFUNCT EF Core approach
            // services.Configure<OdbcConnectionOptions>(Configuration);
            // services.AddDbContext<Meshcutter.Model.ProwlerDbContext>(options => 
            //   options.UseSqlServer(defaultConnectionString));

            // Since we have more than one connection there's no point having a "default" connection
            // services.AddTransient<IDbConnection, IDbConnection>(options => {
            //     return new OdbcConnection(defaultConnectionString);
            // });

            // MSSQL
            services.AddTransient<SqlConnection, SqlConnection>(options => {
                return new SqlConnection(mssqlConnectionString);
            });

            // SYBASE
            services.AddTransient<IDbConnection, IDbConnection>(options => {
                return new OdbcConnection(sybaseConnectionString);
            });
            // force camel case for dynamic objects same as everything else
            services.AddMvc().AddJsonOptions(options =>
            {
                options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseCors("AllowAny");
            app.UseSignalR(routes =>
            {
                routes.MapHub<MessageHub>("/message");
            });
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    HotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    name: "spa-fallback",
                    defaults: new { controller = "Home", action = "Index" });
            });
        }
    }
}
