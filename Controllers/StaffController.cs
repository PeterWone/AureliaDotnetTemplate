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
  public class StaffController : Controller
  {
    IDbConnection syb, mssql;
    string staffsql;
    public StaffController(IDbConnection cxn, SqlConnection mssql)
    {
      this.syb = cxn;
      this.mssql = mssql;
      this.staffsql = System.IO.File.ReadAllText("./querydefs/operator.sql");
    }
    // GET api/order
    [HttpGet]
    public object Get()
    {
      return syb.Query(staffsql);
    }
  }
}
