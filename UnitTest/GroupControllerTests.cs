
using Xunit;
using Backend.Controllers;
using Backend.Models;
using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Tests
{
    public class GroupControllerTests
    {
        private AppDbContext GetInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        private GroupController CreateController(AppDbContext context)
        {
            return new GroupController(context);
        }

        [Fact]
        public void GetGroups_ReturnsAllGroups()
        {
            var context = GetInMemoryDb();
            context.Groups.Add(new Group { Title = "TestGroup" });
            context.SaveChanges();

            var controller = CreateController(context);

            var result = controller.GetGroups();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var groups = Assert.IsAssignableFrom<IEnumerable<Group>>(okResult.Value);
            Assert.Single(groups);
        }

        [Fact]
        public void CreateGroup_AddsNewGroup()
        {
            var context = GetInMemoryDb();
            var controller = CreateController(context);

            var group = new Group { Title = "NewGroup" };
            var result = controller.CreateGroup(group);

            var created = Assert.IsType<CreatedAtActionResult>(result);
            var addedGroup = Assert.IsType<Group>(created.Value);
            Assert.Equal("NewGroup", addedGroup.Title);
        }

        [Fact]
        public void GetGroupById_ReturnsGroup()
        {
            var context = GetInMemoryDb();
            var group = new Group { Title = "MyGroup" };
            context.Groups.Add(group);
            context.SaveChanges();

            var controller = CreateController(context);
            var result = controller.GetGroupById(group.Id);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedGroup = Assert.IsType<Group>(okResult.Value);
            Assert.Equal("MyGroup", returnedGroup.Title);
        }

        [Fact]
        public void AddMember_WorksCorrectly()
        {
            var context = GetInMemoryDb();
            var group = new Group { Title = "Group1", Members = new List<Member>() };
            context.Groups.Add(group);
            context.SaveChanges();

            var controller = CreateController(context);
            var newMember = new Member { Name = "Alice" };
            var result = controller.AddMember(group.Id, newMember);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedGroup = Assert.IsType<Group>(okResult.Value);
            Assert.Single(updatedGroup.Members);
        }

        [Fact]
        public void RemoveMember_WithZeroBalance_RemovesMember()
        {
            var context = GetInMemoryDb();
            var member = new Member { Name = "Bob", Balance = 0 };
            var group = new Group { Title = "Group1", Members = new List<Member> { member } };
            context.Groups.Add(group);
            context.SaveChanges();

            var controller = CreateController(context);
            var result = controller.RemoveMember(group.Id, member.Id);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public void RemoveMember_WithNonZeroBalance_Fails()
        {
            var context = GetInMemoryDb();
            var member = new Member { Name = "Bob", Balance = 10 };
            var group = new Group { Title = "Group1", Members = new List<Member> { member } };
            context.Groups.Add(group);
            context.SaveChanges();

            var controller = CreateController(context);
            var result = controller.RemoveMember(group.Id, member.Id);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Member must be settled before removal.", badRequest.Value);
        }

        [Fact]
        public void SettleMember_DistributesPaymentCorrectly()
        {
            var context = GetInMemoryDb();
            var payer = new Member { Name = "Debtor", Balance = -20 };
            var receiver = new Member { Name = "Creditor", Balance = 20 };
            var group = new Group { Title = "Group1", Members = new List<Member> { payer, receiver } };
            context.Groups.Add(group);
            context.SaveChanges();

            var controller = CreateController(context);
            var result = controller.SettleMember(group.Id, payer.Id, 10);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedGroup = Assert.IsType<Group>(okResult.Value);
            Assert.Equal(-10, updatedGroup.Members.First(m => m.Name == "Debtor").Balance);
            Assert.Equal(10, updatedGroup.Members.First(m => m.Name == "Creditor").Balance);
        }

        [Fact]
        public void AddTransaction_EqualSplit_SplitsCorrectly()
        {
            var context = GetInMemoryDb();
            var payer = new Member { Id = 1, Name = "Alice", Balance = 0 };
            var bob = new Member { Id = 2, Name = "Bob", Balance = 0 };
            var group = new Group { Id = 1, Title = "TestGroup", Members = new List<Member> { payer, bob } };
            context.Groups.Add(group);
            context.SaveChanges();

            var controller = CreateController(context);

            var dto = new CreateTransactionDto
            {
                Title = "Lunch",
                Amount = 20,
                PaidBy = "Alice",
                SplitType = "equal"
            };

            var result = controller.AddTransaction(group.Id, dto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var transaction = Assert.IsType<Transaction>(okResult.Value);

            var updatedPayer = context.Members.First(m => m.Name == "Alice");
            var updatedBob = context.Members.First(m => m.Name == "Bob");

            Assert.Equal(10, updatedPayer.Balance);
            Assert.Equal(-10, updatedBob.Balance);
        }
    }
}
