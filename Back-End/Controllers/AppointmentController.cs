using Microsoft.AspNetCore.Mvc;
using ExamProject.Data;
using ExamProject.Models;
using Microsoft.EntityFrameworkCore;

namespace ExamProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly AppointmentDbContext _database_context;

        public AppointmentController(AppointmentDbContext db_context)
        {
            _database_context = db_context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAllAppointments()
        {
            try
            {
                 var appointments = await _database_context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor)
                    .Include(a => a.Clinic)
                    .ToListAsync();
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error retrieving appointments: {ex.Message}");
                return StatusCode(500, "An error occurred while retrieving appointments.");
            }
        }
        

        private async Task<bool> CheckForAppointmentConflict(Appointment newAppointment)
        {
            // Check if there are any existing appointments that conflict with the new appointment
            var existingAppointments = await _database_context.Appointments
                .Where(a =>
                    a.Date == newAppointment.Date &&
                    (a.DoctorID == newAppointment.DoctorID))
                .ToListAsync();

            return existingAppointments.Any();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            var appointment = await _database_context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Include(a => a.Clinic)
                .FirstOrDefaultAsync(a => a.ID == id);

            if (appointment == null)
            {
                return NotFound();
            }

            return appointment;
        }

        // Get Available Hours
        private (DateTime StartTime, DateTime EndTime, DateTime BreakStartTime, DateTime BreakEndTime) GetWorkingHours(DateTime date)
        {
            DateTime startTime = new DateTime(date.Year, date.Month, date.Day, 8, 0, 0, DateTimeKind.Utc);
            DateTime endTime = new DateTime(date.Year, date.Month, date.Day, 17, 0, 0, DateTimeKind.Utc);
            DateTime breakStartTime = new DateTime(date.Year, date.Month, date.Day, 12, 0, 0, DateTimeKind.Utc);
            DateTime breakEndTime = new DateTime(date.Year, date.Month, date.Day, 13, 0, 0, DateTimeKind.Utc);

            return (startTime, endTime, breakStartTime, breakEndTime);
        }

         /* GET ~~ Get all available doctors for a date by a clinic id */
        [HttpGet("AvailableAppointments")]
        public async Task<IActionResult> ViewAllAvailableDoctorAppointments(int clinicId, DateTime date)
        {
            try
            {
                // Check if the specified date falls on a Saturday or Sunday
                if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                {
                    return Ok(new List<object>());
                }

                // Get all doctors in the specified clinic, including their specialties
                var doctors = await _database_context.Doctors
                    .Where(d => d.ClinicID == clinicId)
                    .Include(d => d.Speciality)  // Include the related speciality
                    .ToListAsync();

                // Prepare the response
                var availableAppointments = new List<object>();

                foreach (var doctor in doctors)
                {
                    // Get the doctor's appointments for the specified date
                    var doctorAppointments = await _database_context.Appointments
                        .Where(a => a.DoctorID == doctor.ID && a.Date.Date == date.Date)
                        .ToListAsync();

                    // Define working hours
                    var (startTime, endTime, breakStartTime, breakEndTime) = GetWorkingHours(date);

                    // Generate available time slots
                    List<DateTime> availableSlots = new List<DateTime>();
                    DateTime currentTime = startTime;
                    while (currentTime < endTime)
                    {
                        // Check if the current time slot is within working hours and not during the break
                        if ((currentTime >= startTime && currentTime < breakStartTime) ||
                            (currentTime >= breakEndTime && currentTime < endTime))
                        {
                            // Check if the current time is not in the past
                            if (currentTime > DateTime.UtcNow)
                            {
                                // Check if the current time slot is available (not already booked)
                                if (!doctorAppointments.Any(a => a.Date.TimeOfDay == currentTime.TimeOfDay))
                                {
                                    availableSlots.Add(currentTime);
                                }
                            }
                        }

                        // Move to the next half-hour time slot
                        currentTime = currentTime.AddMinutes(30);
                    }

                    // Add the doctor only if they have available appointment(s)
                    if (availableSlots.Any())
                    {
                        availableAppointments.Add(new
                        {
                            DoctorId = doctor.ID,
                            FirstName = doctor.FirstName,
                            LastName = doctor.LastName,
                            Specialty = doctor.Speciality?.Name,
                            AvailableSlots = availableSlots
                        });
                    }
                }

                return Ok(availableAppointments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while fetching available doctor appointments: {ex.Message}");
            }
        }

        /* GET ~~ Get all available appointments for a doctor by clinic id and doctor id */
        [HttpGet("DoctorAvailableAppointment")]
        public async Task<IActionResult> ViewAvailableDoctorAppointments(int clinicId, int doctorId, DateTime date)
        {
            try
            {
                // Check if the specified date falls on a Saturday or Sunday
                if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                {
                    return NotFound();
                }

                // Get the specified doctor in the specified clinic, including their specialty
                var doctor = await _database_context.Doctors
                    .Where(d => d.ClinicID == clinicId && d.ID == doctorId)
                    .Include(d => d.Speciality)
                    .FirstOrDefaultAsync();

                // If the doctor does not exist, return 404
                if (doctor == null)
                {
                    return NotFound();
                }

                // Get the doctor's appointments for the specified date and time
                var appointmentExists = await _database_context.Appointments
                    .AnyAsync(a => a.DoctorID == doctor.ID && a.Date == date);

                // Define working hours
                var (startTime, endTime, breakStartTime, breakEndTime) = GetWorkingHours(date);

                // Check if the requested time slot is within working hours and not during the break
                bool isWithinWorkingHours = (date >= startTime && date < breakStartTime) || (date >= breakEndTime && date < endTime);

                // Check if the requested time slot is in the past
                bool isInThePast = date <= DateTime.UtcNow;

                // Return the doctor only if the requested time slot is available
                if (isWithinWorkingHours && !isInThePast && !appointmentExists)
                {
                    return Ok(new
                    {
                        DoctorId = doctor.ID,
                        FirstName = doctor.FirstName,
                        LastName = doctor.LastName,
                        Specialty = doctor.Speciality?.Name,
                        AvailableSlots = new List<DateTime> { date }
                    });
                }
                else
                {
                    return NotFound();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error occurred while fetching available doctor appointments: {ex.Message}");
            }
        }

         /* POST ~~ Create an appointment */
        [HttpPost]
        public async Task<ActionResult<Appointment>> CreateAppointment(Appointment appointment)
        {
            try
            {
                // Validate Appointment Data
                if (
                    appointment.Date == default ||
                    appointment.PatientID == 0 ||
                    appointment.DoctorID == 0 ||
                    appointment.ClinicID == 0
                )
                {
                    return BadRequest("All required fields must be filled: Date, PatientID, DoctorID, ClinicID.");
                }

                // Check for appointment conflicts
                bool hasConflict = await CheckForAppointmentConflict(appointment);

                // Define working hours (from 08:00 to 17:00 UTC time)
                var (startTime, endTime, breakStartTime, breakEndTime) = GetWorkingHours(appointment.Date);

                // Check if the requested time slot is within working hours and not during the break
                bool isWithinWorkingHours = (appointment.Date >= startTime && appointment.Date < breakStartTime) || (appointment.Date >= breakEndTime && appointment.Date < endTime);

                // Check if the requested time slot is in the past
                bool isInThePast = appointment.Date <= DateTime.UtcNow;

                // Check if the specified date falls on a Saturday or Sunday
                if (appointment.Date.DayOfWeek == DayOfWeek.Saturday || appointment.Date.DayOfWeek == DayOfWeek.Sunday)
                {
                    return Conflict("An appointments cannot be booked on a Saturday or Sunday");
                }

                // Return the doctor only if the requested time slot is available
                if (hasConflict)
                {
                    return Conflict("An appointment at this date and hour is already booked");
                }

                if (!isWithinWorkingHours)
                {
                    return BadRequest("An appointment cannot be booked outside of working hours.");
                }

                if (isInThePast)
                {
                    return BadRequest("An appointment cannot be booked in the past.");
                }

                // Add the appointment to the database
                _database_context.Appointments.Add(appointment);
                await _database_context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAppointment), new { id = appointment.ID }, appointment);
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error creating appointment: {ex.Message}");
                return StatusCode(500, "An error occurred while creating the appointment.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            try
            {
                var appointment = await _database_context.Appointments.FindAsync(id);
                if (appointment == null)
                {
                    return NotFound();
                }

                _database_context.Appointments.Remove(appointment);
                await _database_context.SaveChangesAsync();

                return NoContent(); // 204 No Content indicates successful deletion
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error deleting appointment: {ex.Message}");
                return StatusCode(500, "An error occurred while deleting the appointment.");
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateAppointment([FromBody] Appointment appointment)
        {
            try
            {
                _database_context.Entry(appointment).State = EntityState.Modified;
                await _database_context.SaveChangesAsync();

                return Ok($"Appointment Updated");
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error updating appointment: {ex.Message}");
                return StatusCode(500, "An error occurred while updating the appointment.");
            }
        }

    }
}