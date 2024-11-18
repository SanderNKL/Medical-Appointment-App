using Microsoft.AspNetCore.Mvc;
using ExamProject.Data;
using Microsoft.EntityFrameworkCore;
using ExamProject.Models;

namespace ExamProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClinicController : ControllerBase
    {
        private readonly AppointmentDbContext _database_context;

        public ClinicController(AppointmentDbContext db_context)
        {
            _database_context = db_context;
        }

        /* GET ~~ Clinic by ID */
        [HttpGet("{id}")]
        public async Task<IActionResult> GetClinicById(int id)
        {
            var clinic = await _database_context.Clinics
                .Where(c => c.ID == id)
                .Select(c => new
                {
                    c.ID,
                    c.Name,
                    c.Address,

                    // Get the clinics Doctors
                    Doctors = c.Doctors != null ? c.Doctors.Select(d => new
                    {
                        d.ID,
                        d.FirstName,
                        d.LastName,
                        Speciality = d.Speciality != null ? new { d.Speciality.ID, d.Speciality.Name } : null
                    }).ToList() : null
                })
                .FirstOrDefaultAsync();
        

            // Return NotFound if no clinic with that ID was found.
            if (clinic == null)
            {
                return NotFound($"A clinic with the id: {id} was not found.");
            }

            return Ok(clinic);
        }
        
        /* GET ~~ Get a list of All Clinics */
        [HttpGet]
        public async Task<IActionResult> ViewAllClinics()
        {
            var clinics = await _database_context.Clinics
                .Select(c => new
                {
                    c.ID,
                    c.Name,
                    c.Address,

                    /* Fetch a list of Doctors assigned to the clinic.*/
                    Doctors = c.Doctors != null ? c.Doctors.Select(d => new
                    {
                        d.ID,
                        d.FirstName,
                        d.LastName,
                        d.Speciality
                    }).ToList() : null
                })
                .ToListAsync();

            return Ok(clinics);
        }

        /* POST ~~ Create a Clinic */
        [HttpPost]
        public IActionResult Create([FromBody] Clinic clinic)
        {
            try
            {
                // Check if a clinic with the same name already exists
                var existingClinic = _database_context.Clinics.FirstOrDefault(c => c.Name == clinic.Name);
                if (existingClinic != null)
                {
                    // Clinic with the same name already exists
                    return Conflict("A clinic with the same name already exists.");
                }

                // Add the Clinic to the DB
                _database_context.Clinics.Add(clinic);
                _database_context.SaveChanges();

                // Clinic was created
                return Ok("Clinic created successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while creating the Clinic: {ex.Message}");
            }
        }


        // PUT ~~ Edit Clinic
        [HttpPut]
        public IActionResult Update([FromBody] Clinic clinic)
        {
            try
            {
                // Edit the clinic
                _database_context.Entry(clinic).State = EntityState.Modified;
                int changes = _database_context.SaveChanges();

                return Ok($"Clinic updated successfully. {changes}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while editing the clinic: {ex.Message}");
            }
        }

        /* DELETE ~~ Delete a clinic */
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Find the Clinic by ID
                var clinic = _database_context.Clinics.Find(id);

                // Clinic doesn't exist
                if (clinic == null)
                {
                    return NotFound();
                }

                // Check if the doctor has any appointments
                var hasDoctors = await _database_context.Doctors
                    .AnyAsync(d => d.ClinicID == id);

                if (hasDoctors)
                {
                    return BadRequest("Cannot delete the clinic as there are doctors associated with it.");
                }

                // Delete the Clinic from DB
                _database_context.Clinics.Remove(clinic);
                _database_context.SaveChanges();

                return Ok("Clinic deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while deleting the clinic: {ex.Message}");
            }
        }
    }
}