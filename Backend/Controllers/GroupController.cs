// Controllers/GroupController.cs
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GroupController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<Group>> GetGroups()
        {
            return Ok(_context.Groups.ToList());
        }

        [HttpPost]
        public IActionResult CreateGroup([FromBody] Group group)
        {
            _context.Groups.Add(group);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetGroups), new { id = group.Id }, group);
        }

        [HttpGet("{id}")]
        public ActionResult<Group> GetGroupById(int id)
        {
            var group = _context.Groups
                .Include(g => g.Members)
                .Include(g => g.Transactions)
                .FirstOrDefault(g => g.Id == id);

            if (group == null)
                return NotFound();

            return Ok(group);
        }

        [HttpPost("{id}/members")]
        public IActionResult AddMember(int id, [FromBody] Member member)
        {
            var group = _context.Groups.Include(g => g.Members).FirstOrDefault(g => g.Id == id);
            if (group == null) return NotFound();

            group.Members.Add(member);
            _context.SaveChanges();

            return Ok(group);
        }

        [HttpDelete("{groupId}/members/{memberId}")]
        public IActionResult RemoveMember(int groupId, int memberId)
        {
            var group = _context.Groups.Include(g => g.Members).FirstOrDefault(g => g.Id == groupId);
            if (group == null) return NotFound();

            var member = group.Members.FirstOrDefault(m => m.Id == memberId);
            if (member == null || member.Balance != 0) return BadRequest("Member must be settled before removal.");

            group.Members.Remove(member);
            _context.SaveChanges();

            return NoContent();
        }

        [HttpPost("{groupId}/settle/{memberId}")]
        public IActionResult SettleMember(int groupId, int memberId, [FromBody] decimal amount)
        {
            var group = _context.Groups.Include(g => g.Members).FirstOrDefault(g => g.Id == groupId);
            if (group == null) return NotFound();

            var member = group.Members.FirstOrDefault(m => m.Id == memberId);
            if (member == null) return NotFound();

            member.Balance += member.Balance > 0 ? -amount : amount;
            _context.SaveChanges();

            return Ok(group);
        }
    }
}