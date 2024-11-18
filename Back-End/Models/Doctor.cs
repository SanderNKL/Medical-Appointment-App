namespace ExamProject.Models

{
    public class Doctor
    {
        public int ID { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }

        // Foreign Key
        public int SpecialityID { get; set; }
        public required int ClinicID { get; set; }

        public virtual Speciality? Speciality { get; set; }
    }
}