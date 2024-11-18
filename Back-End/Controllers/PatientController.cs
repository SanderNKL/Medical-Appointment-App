using Microsoft.AspNetCore.Mvc;
using ExamProject.DTOs;
using ExamProject.Data;
using ExamProject.Models;
using Microsoft.EntityFrameworkCore;
using ExamProject.Utilities;

namespace ExamProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly AppointmentDbContext _database_context;

        public PatientController(AppointmentDbContext db_context)
        {
            _database_context = db_context;
        }

        /* GET ~~ Get a patient by their ID */
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPatientById(int id)
        {
            var patient = await _database_context.Patients.FindAsync(id);

            if (patient == null)
            {
                return NotFound();
            }

            var patientDTO = new PatientDTO
            {
                ID = patient.ID,
                FirstName = patient.FirstName,
                LastName = patient.LastName,
                Birthdate = patient.Birthdate,
                Gender = patient.Gender,
            };

            return Ok(patientDTO);
        }
        
        /* GET ~~ Get a list of All Patients */
        [HttpGet]
        public async Task<IActionResult> ViewAllDoctors()
        {
            var patients = await _database_context.Patients.ToListAsync();
            var patientDTOs = patients.Select(p => new PatientDTO
            {
                ID = p.ID,
                FirstName = p.FirstName,
                LastName = p.LastName,
                Birthdate = p.Birthdate,
                Gender = p.Gender,
            }).ToList();

            return Ok(patientDTOs);
        }

        /* GET ~~ Get a patient by their SSN */
        [HttpGet("BySSN")]
        public async Task<IActionResult> GetPatientBySSN(string ssn)
        {
            var hashedSSN = Hash.HashString(ssn);
            var patient = await _database_context.Patients
                .FirstOrDefaultAsync(p => p.SSN == hashedSSN);

            if (patient == null)
            {
                return NotFound(hashedSSN);
            }

            var patientDTO = new PatientDTO
            {
                ID = patient.ID,
                FirstName = patient.FirstName,
                LastName = patient.LastName,
                Birthdate = patient.Birthdate,
                Gender = patient.Gender,
            };

            return Ok(patientDTO);
        }

        /* POST ~~ Create a patient */
        [HttpPost]
        public async Task<IActionResult> CreatePatient([FromBody] Patient newPatient, string hashedSSN)
        {
            if (newPatient == null) 
            {
                return BadRequest("Patient data is null");
            }

            // Check for Sosial Security Number
            if (string.IsNullOrEmpty(hashedSSN))
            {
                return BadRequest("SSN is required");
            }

            // Check if all required fields are filled
            if (string.IsNullOrEmpty(newPatient.FirstName) ||
                string.IsNullOrEmpty(newPatient.LastName) ||
                string.IsNullOrEmpty(newPatient.Gender))
            {
                return BadRequest("First Name, Last Name, and Gender are required fields");
            }

            // Check if a patient with the same SSN already exists.
            var existingPatient = await _database_context.Patients
                .FirstOrDefaultAsync(p => p.SSN == Hash.HashString(hashedSSN));

            // Prevent duplicate record
            if (existingPatient != null)
            {
                return Conflict("A patient with the same SSN already exists");
            }


            newPatient.SetSSN(hashedSSN); // Hash and set the SSN

            _database_context.Patients.Add(newPatient);
            await _database_context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPatientBySSN), new { ssn = hashedSSN }, newPatient);
        }

        /* PUT ~~ Edit Patient */
        [HttpPut]
        public IActionResult Update([FromBody] Patient patient)
        {
            try
            {
                // Edit the developer
                _database_context.Entry(patient).State = EntityState.Modified;
                _database_context.SaveChanges();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while editing the patient: {ex.Message}");
            }

            return Ok("Patient updated successfully.");
        }

        /* DELETE ~~ Delete a patient */
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            // Find the patient by ID
            var patient = await _database_context.Patients.FindAsync(id);
            
            // If patient not found, return 404 Not Found
            if (patient == null)
            {
                return NotFound();
            }

            // Check if the patient has any appointments
            var hasAppointments = await _database_context.Appointments.AnyAsync(a => a.PatientID == id);
            if (hasAppointments)
            {
                return BadRequest("Cannot delete the patient as there are appointments associated with them.");
            }

            // Remove the patient from the database
            _database_context.Patients.Remove(patient);
            await _database_context.SaveChangesAsync();

            return Ok("Patient deleted successfully");
        }
    }
}