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
  public class CutlistController : Controller
  {
    IDbConnection mssql, sybase;
    public CutlistController(SqlConnection mssql, IDbConnection sybase)
    {
      // dependency injected connection objects are created in startup.cs
      this.mssql = mssql;
      this.sybase = sybase;
    }

    // GET api/CutList
    [Route("api/[controller]/{OrderLine_Key}")]
    [HttpGet]
    public object Get(string OrderLine_Key)
    {
      // offsets for meshtypes indicates related frameset and midrail/mullion extrusion dimensions
      var offsets = from row in this.mssql.Query(System.IO.File.ReadAllText("./querydefs/offsets.sql"))
                    select new FrameOffsets(row.NodeId, row.Value);
      // basis is a cut-down orderline with counts of midrails and mullions
      var basis = this.sybase.QuerySingle(System.IO.File.ReadAllText("./querydefs/basis.sql"), new { OrderLine_Key });
      var compatibleOffsets = offsets.Where(o => o.MeshType == basis.MeshType && basis.DoorOrWindow == o.DoorOrWindow);
      var frameShoulderWidth = compatibleOffsets.Single(o => o.Kind.StartsWith("FRAME")).Shoulder;
      var rail = compatibleOffsets.SingleOrDefault(o => o.Kind.StartsWith("MID"));
      var railShoulderWidth = rail == null ? 0 : rail.Shoulder;
      // deduct two frame shoulders and as many mullion or midrail shoulders as apply to the height and width
      // then divide by the number of pieces in each dimension
      var X = (basis.MaxWidth - (2 * frameShoulderWidth) - (basis.Mullions * railShoulderWidth)) / (1 + basis.Mullions);
      var Y = (basis.MaxDrop - (2 * frameShoulderWidth) - (basis.Midrails * railShoulderWidth)) / (1 + basis.Midrails);
      // package and return the results
      var result = new { X, Y, Q = (1 + basis.Mullions) * (1 + basis.Midrails) };
      return result;
    }
  }
  // FrameOffsets parses the KVT entries for frames and rails
  public class FrameOffsets
  {
    public string Kind;
    public string DoorOrWindow;
    public string MeshType;
    public int TotalWidth;
    public int Shoulder;
    public int Shelf { get { return (TotalWidth - Shoulder) / (Kind == "MIDOFFSETS" ? 2 : 1); } }
    public FrameOffsets(string nodeId, string value)
    {
      var N = nodeId.Split(new string[] { ":", "_", "20" }, System.StringSplitOptions.RemoveEmptyEntries);
      Kind = N[0];
      DoorOrWindow = N[1];
      MeshType = N[2];
      var W = value.Split(',');
      Shoulder = int.Parse(W[1]);
      TotalWidth = int.Parse(W[0]);
    }
  }
}