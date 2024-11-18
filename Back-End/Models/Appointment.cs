namespace ExamProject.Models

{
    public class Appointment
    {
        public int ID { get; set; }
        public DateTime Date { get; set; }
        public required string Note { get; set; }

        // Foreign Keys
        public int PatientID { get; set; }
        public int DoctorID { get; set; }
        public int ClinicID { get; set; }

        // Nav Properties
        public virtual Patient? Patient { get; set; }
        public virtual Doctor? Doctor { get; set; }
        public virtual Clinic? Clinic { get; set; }
    }
}
