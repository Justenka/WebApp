// Models/Transaction.cs
namespace Backend.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public decimal Amount { get; set; }
        public string PaidBy { get; set; }
        public string SplitType { get; set; }
        public int GroupId { get; set; }
    }
}