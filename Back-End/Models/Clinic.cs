namespace ExamProject.Models

{
    public class Clinic
    {
        public int ID { get; set; }
        public required string Name { get; set; }
        public required string Address { get; set; }

        public virtual ICollection<Doctor>? Doctors { get; set; }
    }
}
