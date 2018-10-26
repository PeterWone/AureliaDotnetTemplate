using System;
using System.Collections.Generic;
using System.Data.Odbc;
using Dapper;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Meshcutter.Controllers
{
  [Route("api/[controller]")]
  public class SettingsController : Controller
  {
    AppSettings settings;
    public SettingsController(IOptions<AppSettings> options)
    {
      this.settings = options.Value;
    }
    // GET api/Configuration
    [HttpGet]
    public object Get()
    {
      return this.settings.SpaSettings;
    }
  }
}
