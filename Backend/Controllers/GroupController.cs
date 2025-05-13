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
            var groups = _context.Groups
                .Include(g => g.Members)
                .ToList();

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

            var payer = group.Members.FirstOrDefault(m => m.Id == memberId);
            if (payer == null) return NotFound();

            if (payer.Balance >= 0)
                return BadRequest("This member doesn't owe money.");

            decimal remainingToSettle = Math.Min(Math.Abs(payer.Balance), amount);

            // Get all members who are owed money (positive balance), ordered by how much they're owed
            var owedMembers = group.Members
                .Where(m => m.Balance > 0)
                .OrderByDescending(m => m.Balance)
                .ToList();

            foreach (var receiver in owedMembers)
            {
                if (remainingToSettle == 0)
                    break;

                decimal transferAmount = Math.Min(receiver.Balance, remainingToSettle);

                receiver.Balance -= transferAmount;
                payer.Balance += transferAmount;
                remainingToSettle -= transferAmount;
            }

            _context.SaveChanges();
            return Ok(group);
        }

        [HttpPost("{groupId}/transactions")]
        public IActionResult AddTransaction(int groupId, [FromBody] CreateTransactionDto dto)
        {
            var group = _context.Groups.Include(g => g.Members).FirstOrDefault(g => g.Id == groupId);
            if (group == null) return NotFound("Group not found");

            var transaction = new Transaction
            {
                Title = dto.Title,
                Amount = dto.Amount,
                PaidBy = dto.PaidBy,
                SplitType = dto.SplitType,
                GroupId = groupId
            };

            _context.Transactions.Add(transaction);

            var totalAmount = dto.Amount;
            var payer = group.Members.FirstOrDefault(m => m.Name == dto.PaidBy);
            if (payer == null) return BadRequest("Payer not found in group");

            decimal totalOwedToPayer = 0;

            if (dto.SplitType == "equal")
            {
                int memberCount = group.Members.Count;
                decimal baseShare = Math.Floor((totalAmount / memberCount) * 100) / 100; // round down to 2 decimals
                decimal remainder = totalAmount - baseShare * memberCount;

                var orderedMembers = group.Members.OrderBy(m => m.Id).ToList(); // consistent order
                int i = 0;

                foreach (var member in orderedMembers)
                {
                    decimal share = baseShare;

                    // Distribute the remainder, one cent at a time
                    if (i < (int)Math.Round(remainder * 100)) // convert to cents
                    {
                        share += 0.01m;
                    }

                    if (member.Id != payer.Id)
                    {
                        member.Balance -= share;
                        totalOwedToPayer += share;
                    }

                    i++;
                }
            }
            else if (dto.SplitType == "percentage" && dto.SplitDetails != null)
            {
                foreach (var kvp in dto.SplitDetails)
                {
                    var member = group.Members.FirstOrDefault(m => m.Id == kvp.Key);
                    if (member == null) continue;

                    var share = totalAmount * (kvp.Value / 100);

                    if (member.Id != payer.Id)
                    {
                        member.Balance -= share;
                        totalOwedToPayer += share;
                    }
                }
            }
            else if (dto.SplitType == "dynamic" && dto.SplitDetails != null)
            {
                foreach (var kvp in dto.SplitDetails)
                {
                    var member = group.Members.FirstOrDefault(m => m.Id == kvp.Key);
                    if (member == null) continue;

                    var share = kvp.Value;

                    if (member.Id != payer.Id)
                    {
                        member.Balance -= share;
                        totalOwedToPayer += share;
                    }
                }
            }

            payer.Balance += totalOwedToPayer;

            _context.SaveChanges();

            return Ok(transaction);
        }
    }
}