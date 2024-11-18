namespace ExamProject.DTOs
{
    public class PatientDTO
    {
        public int ID { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public DateTime Birthdate { get; set; }
        public required string Gender { get; set; }
    }
}