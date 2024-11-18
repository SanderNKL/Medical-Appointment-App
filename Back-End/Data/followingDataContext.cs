using Microsoft.EntityFrameworkCore;
using ExamProject.Models;

namespace ExamProject.Data
{
    public class AppointmentDbContext : DbContext
    {
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Speciality> Specialities { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Clinic> Clinics { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        
        public AppointmentDbContext(DbContextOptions<AppointmentDbContext> options) : base(options)
        {
        }

        // Build our Database tables using Specified Columns and Relationships
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            
            /*
            Doctor
            ~~~~~~~~~~~~~~
            Here we define the doctor and establish foreign keys.
            */
            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.Speciality);

            // Clinic
            modelBuilder.Entity<Clinic>()
                .HasKey(c => c.ID);
            
            // Patient
            modelBuilder.Entity<Patient>()
                .HasKey(p => p.ID);
            
            // Speciality
            modelBuilder.Entity<Speciality>()
                .HasKey(s => s.ID);

            /* 
            Apointment
            ~~~~~~~~~~~~~~
            We're defining an Appointment as well as establishing relationships
            between Doctors, Patients and Clinics
            */
            // Relationship with Doctor
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor);

            // Relationship with Patient
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient);

            // Relationship with Clinic
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Clinic);
        }
    }
}