using Microsoft.AspNetCore.Mvc;
using ExamProject.Data;
using ExamProject.Models;
using Microsoft.EntityFrameworkCore;

namespace ExamProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly AppointmentDbContext _database_context;

        public DoctorController(AppointmentDbContext db_context)
        {
            _database_context = db_context;
        }

        /* GET ~~ Get Doctor by ID */
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDoctorById(int id)
        {
            try
            {
                // Find the doctor by ID
                var doctor = await _database_context.Doctors
                    .Where(d => d.ID == id)
                    .Select(d => new
                    {
                        FirstName = d.FirstName,
                        LastName = d.LastName,
                        Speciality = d.Speciality,

                        // Include the doctor's clinic
                        Clinic = _database_context.Clinics
                            .Where(c => c.ID == d.ClinicID)
                            .Select(c => new
                            {
                                c.ID,
                                c.Name,
                                c.Address
                            })
                            .FirstOrDefault()
                    })
                    .FirstOrDefaultAsync();

                // Return NotFound if the doctor is not found
                if (doctor == null)
                {
                    return NotFound($"Doctor with ID {id} not found.");
                }

                return Ok(doctor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while retrieving the doctor: {ex.Message}");
            }
        }
        
        /* GET ~~ Get a list of All Doctors */
        [HttpGet]
        public async Task<IActionResult> ViewAllDoctors()
        {
            var doctors = await _database_context.Doctors
                .Select(d => new
                    {
                    FirstName = d.FirstName,
                    LastName = d.LastName,
                    Speciality = d.Speciality,

                    // Include the doctors clinic
                    Clinic = _database_context.Clinics
                            .Where(c => c.ID == d.ClinicID)
                            .Select(c => new {
                                c.ID,
                                c.Name,
                                c.Address
                            })
                            .FirstOrDefault()
                    })
                .ToListAsync();

            return Ok(doctors);
        }

        /* GET ~~ Get Doctor by Name */
        [HttpGet("Search")]
        public async Task<IActionResult> SearchDoctor(string name)
        {
            // Ensure the name is formatted correctly
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Name must only be text and should include the doctor's First/Last name");
            }

            try
            {
                var result = await _database_context.Doctors
                    .Where(d => d.FirstName.Contains(name) || d.LastName.Contains(name))
                    .Select(d => new
                    {
                        FirstName = d.FirstName,
                        LastName = d.LastName,
                        Speciality = d.Speciality,

                        // Find the Doctor's Clinic
                        Clinic = _database_context.Clinics
                            .Where(c => c.ID == d.ClinicID)
                            .Select(c => new {
                                c.ID,
                                c.Name,
                                c.Address
                            })
                            .FirstOrDefault()
                    })
                    .FirstOrDefaultAsync();

                // Return NotFound if we found no Doctor.
                if (result == null)
                {
                    return NotFound($"No Doctor matching: {name}");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while searching for a doctor: {ex.Message}");
            }
        }

        /* GET ~~ Get Doctor by Name */
        [HttpGet("SearchMany")]
        public async Task<IActionResult> SearchDoctors(string name)
        {
            // Ensure the name is formatted correctly
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Name must only be text and should include the doctors First/Last name");
            }

            try
            {
                var result = await _database_context.Doctors
                    .Where(d => d.FirstName.Contains(name) || d.LastName.Contains(name))
                    .Select(d => new
                    {
                        FirstName = d.FirstName,
                        LastName = d.LastName,
                        Speciality = d.Speciality,

                        // Find the Doctors Clinic
                        Clinic = _database_context.Clinics
                            .Where(c => c.ID == d.ClinicID)
                            .Select(c => new {
                                c.ID,
                                c.Name,
                                c.Address
                            })
                            .FirstOrDefault()
                    })
                    .ToListAsync();

                // Return NotFound if we found no Doctors.
                if (result == null || result.Count == 0)
                {
                    return NotFound($"No Doctors matching: {name}");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while searching for a doctor: {ex.Message}");
            }
        }

        /* POST ~~ Add a Doctor to the System */
        [HttpPost]
        public IActionResult Create([FromBody] Doctor doctor)
        {
            try
            {
                 // Check if the doctor already exists
                var existingDoctor = _database_context.Doctors
                    .FirstOrDefault(d => d.FirstName == doctor.FirstName && d.LastName == doctor.LastName);

                if (existingDoctor != null)
                {
                    return Conflict("Doctor already exists.");
                }

                // Add the Doctor to the DB
                _database_context.Doctors.Add(doctor);
                _database_context.SaveChanges();

                // Doctor was created
                return Ok("Doctor created successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while creating the doctor: {ex.Message}");
            }
        }

        // PUT ~~ Edit Doctor
        [HttpPut]
        public IActionResult Update([FromBody] Doctor doctor)
        {
            try
            {
                // Edit the developer
                _database_context.Entry(doctor).State = EntityState.Modified;
                _database_context.SaveChanges();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while editing the doctor: {ex.Message}");
            }

            return Ok("Doctor updated successfully.");
        }

        // DELETE ~~ Delete a doctor from the system.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            try
            {
                // Find the Doctor by ID
                var doctor = await _database_context.Doctors.FindAsync(id);

                // Doctor doesn't exist
                if (doctor == null)
                {
                    return NotFound();
                }

                // Check if the doctor has any appointments
                var hasAppointments = await _database_context.Appointments.AnyAsync(a => a.DoctorID == id);
                if (hasAppointments)
                {
                    return BadRequest("Cannot delete the doctor as there are appointments associated with them.");
                }

                // Delete the Doctor from DB
                _database_context.Doctors.Remove(doctor);
                _database_context.SaveChanges();

                return Ok("Doctor deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while deleting the Doctor: {ex.Message}");
            }
        }
    }
}