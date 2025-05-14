using Xunit;
using Microsoft.AspNetCore.Mvc;
using Backend.Controllers;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Backend.Tests
{
    public class UserControllerTests
    {
        private AppDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "UserTestDb_" + System.Guid.NewGuid())
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public void GetUserName_ReturnsEmpty_WhenNoUserExists()
        {
            var context = GetInMemoryDbContext();
            var controller = new UserController(context);

            var result = controller.GetUserName() as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            Assert.Equal("{ name =  }", result.Value.ToString());
        }

        [Fact]
        public void SetUserName_CreatesNewUser_WhenNoneExists()
        {
            var context = GetInMemoryDbContext();
            var controller = new UserController(context);
            var dto = new UserController.NameDto { Name = "John" };

            var result = controller.SetUserName(dto);

            var userInDb = context.UserProfiles.FirstOrDefault();
            Assert.NotNull(userInDb);
            Assert.Equal("John", userInDb.Name);
        }

        [Fact]
        public void SetUserName_UpdatesUser_WhenUserExists()
        {
            var context = GetInMemoryDbContext();
            context.UserProfiles.Add(new User { Name = "OldName" });
            context.SaveChanges();

            var controller = new UserController(context);
            var dto = new UserController.NameDto { Name = "NewName" };

            var result = controller.SetUserName(dto);

            var userInDb = context.UserProfiles.FirstOrDefault();
            Assert.NotNull(userInDb);
            Assert.Equal("NewName", userInDb.Name);
        }

        [Fact]
        public void GetUserName_ReturnsCorrectName_WhenUserExists()
        {
            var context = GetInMemoryDbContext();
            context.UserProfiles.Add(new User { Name = "Alice" });
            context.SaveChanges();

            var controller = new UserController(context);

            var result = controller.GetUserName() as OkObjectResult;

            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            Assert.Equal("{ name = Alice }" , result.Value.ToString());
        }
    }
}
