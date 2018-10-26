using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Meshcutter.Controllers {
    [Route("api/message")]
    public class MessageController:Controller{
        public MessageController(IHubContext<MessageHub> messageHubContext){

        }
        public IActionResult Post(){
            // broadcast message to all clients
            return Ok();
        }
    }
}