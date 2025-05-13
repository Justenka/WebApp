namespace Backend.Models
{
    public class CreateTransactionDto
    {
        public string Title { get; set; }
        public decimal Amount { get; set; }
        public string PaidBy { get; set; }
        public string SplitType { get; set; }
        public Dictionary<int, decimal>? SplitDetails { get; set; }
    }
}
