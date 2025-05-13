using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("name")]
        public IActionResult GetUserName()
        {
            var user = _context.UserProfiles.FirstOrDefault();
            return Ok(new { name = user?.Name ?? "" });
        }

        [HttpPost("name")]
        public IActionResult SetUserName([FromBody] NameDto dto)
        {
            var user = _context.UserProfiles.FirstOrDefault();
            if (user == null)
            {
                user = new User { Name = dto.Name };
                _context.UserProfiles.Add(user);
            }
            else
            {
                user.Name = dto.Name;
            }

            _context.SaveChanges();
            return Ok();
        }

        public class NameDto
        {
            public string Name { get; set; } = "";
        }
    }
}
