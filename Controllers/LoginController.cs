using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.Extensions.Options;
using System.Data;
using System.Data.SqlClient;

namespace Meshcutter.Controllers
{
  [Route("api/[controller]")]
  public class LoginController : Controller
  {
    IDbConnection syb, mssql;
    string loginstatesql;
    public LoginController(IDbConnection cxn, SqlConnection mssql)
    {
      this.syb = cxn;
      this.mssql = mssql;
      this.loginstatesql = System.IO.File.ReadAllText("./querydefs/loginstate.sql");
    }
    // GET api/order
    [HttpGet]
    public object Get()
    {
      var loginstate = this.mssql.QuerySingleOrDefault(loginstatesql);
      return loginstate;
    }
    [HttpPost]
    public void Post(string wstn, string opid, bool state)
    {
      var sp = state ? "LOGON" : "LOGOFF";
      this.mssql.Execute($"EXEC LOGS.{sp} @wstn, @opid", new { wstn, opid });
    }
  }
}
