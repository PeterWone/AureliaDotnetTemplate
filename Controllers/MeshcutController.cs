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
using System.Data.SqlClient;

namespace Meshcutter.Controllers
{
  [Route("api/[controller]")]
  public class MeshcutterController : Controller
  {
    IDbConnection mssql, syb;
    string MeshcutterSql, MeshcutterUpdate;
    IEnumerable<FrameOffsets> offsets;
    public MeshcutterController(SqlConnection mssql, IDbConnection cxn)
    {
      this.syb = cxn;
      this.mssql = mssql;
      this.MeshcutterSql = System.IO.File.ReadAllText("./querydefs/items.sybase");
      this.MeshcutterUpdate = System.IO.File.ReadAllText("./querydefs/item-update.sybase");
      this.offsets = from row in this.mssql.Query(System.IO.File.ReadAllText("./querydefs/offsets.sql"))
                     select new FrameOffsets(row.NodeId, row.Value);
    }
    // GET api/Meshcutter
    [HttpGet]
    public object Get()
    {
      return from item in this.syb.Query(this.MeshcutterSql)
             select new
             {
               item.FidNumber,
               item.ItemNumber,
               item.Midrails,
               item.Mullions,
               item.Stage,
               item.At,
               item.DoorOrWindow,
               item.IsActiveDoor,
               item.IsUrgent,
               item.MeshType,
               item.MaxDrop,
               item.MaxWidth,
               item.ProductDescription,
               item.GroupCode,
               item.LockSide,
               item.DaysInFactory,
               item.CustomersClientName,
               item.Order_Key,
               item.OrderLine_Key,
               item.Painted,
               item.IsWonky,
               item.IsHung,
               offsets.Single(offset =>
                item.MeshType == offset.MeshType
                && item.DoorOrWindow == offset.DoorOrWindow
                && offset.Kind == "FRAMEOFFSETS"
               ).Shoulder
             };
    }
    // POST api/Meshcutter
    [HttpPost]
    public void Post([FromBody]string OrderLine_Key)
    {
      Debug.WriteLine($"mark complete {OrderLine_Key}");
      this.syb.Execute(MeshcutterUpdate, new { OrderLine_Key });
    }
  }
}
