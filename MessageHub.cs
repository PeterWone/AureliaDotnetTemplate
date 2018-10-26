using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Meshcutter {
    public class MessageHub : Hub{
      public Task stateChange(object message)   {
          return Clients.All.SendAsync("stateChange", message);
      }
    }
}


