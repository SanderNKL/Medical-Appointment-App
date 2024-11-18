using Microsoft.AspNetCore.Mvc;
using ExamProject.Data;
using ExamProject.Models;
using Microsoft.EntityFrameworkCore;

namespace ExamProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpecialityController : ControllerBase
    {
        private readonly AppointmentDbContext _database_context;

        public SpecialityController(AppointmentDbContext db_context)
        {
            _database_context = db_context;
        }

        /* GET ~~ Get Speciality by ID */
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSpecialityById(int id)
        {
            var speciality = await _database_context.Specialities
                .Where(s => s.ID == id)
                .FirstOrDefaultAsync();
        

            // Return NotFound if no speciality with that ID was found.
            if (speciality == null)
            {
                return NotFound($"A speciality with the id: {id} was not found.");
            }

            return Ok(speciality);
        }
        
        /* GET ~~ Get a list of All Specialities */
        [HttpGet]
        public IActionResult ViewAllSpecialities()
        {
            var speciality = _database_context.Specialities.ToList();
            return Ok(speciality);
        }

        /* POST ~~ Add a Speciality to the System */
        [HttpPost]
        public IActionResult Create([FromBody] Speciality speciality)
        {
            try
            {
                // Check if the speciality already exists
                var existingSpeciality = _database_context.Specialities
                    .FirstOrDefault(s => s.Name == speciality.Name);

                if (existingSpeciality != null)
                {
                    return Conflict("Speciality already exists.");
                }

                // Add the speciality to the DB
                _database_context.Specialities.Add(speciality);
                _database_context.SaveChanges();

                // Speciality was created
                return Ok("Speciality created successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while creating the speciality: {ex.Message}");
            }
        }


        // PUT ~~ Edit Clinic
        [HttpPut]
        public IActionResult Update([FromBody] Speciality speciality)
        {
            try
            {
                // Edit the speciality
                _database_context.Entry(speciality).State = EntityState.Modified;
                int changes = _database_context.SaveChanges();

                return Ok($"Speciality updated successfully. {changes}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while editing the clinic: {ex.Message}");
            }
        }

        /* DELETE ~~ Delete a clinic */
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpeciality(int id)
        {
            try
            {
                // Check for dependencies
                var doctorsWithSpeciality = await _database_context.Doctors
                    .AnyAsync(d => d.SpecialityID == id);

                if (doctorsWithSpeciality)
                {
                    return BadRequest("Cannot delete the speciality as there are doctors associated with it.");
                }

                // Find the Speciality by ID
                var speciality = _database_context.Specialities.Find(id);

                // Speciality doesn't exist
                if (speciality == null)
                {
                    return NotFound();
                }

                // Delete the role from DB
                _database_context.Specialities.Remove(speciality);
                _database_context.SaveChanges();

                return Ok("Speciality deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while deleting the speciality: {ex.Message}");
            }
        }
    }
}