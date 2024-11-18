### Instructions
For the FED and the BED, follow all the instructions given in the README files.


### ENDPOINTS
Appointment:
- GET: /API/Appointment
    Gets an array of all Appointments
- GET: /API/Appointment/{id}
    Gets an appointment from ID
- GET: /API/Appointment/AvailableAppointments
    Gets All Available Appointments for a specific clinic based on date
- GET: /API/Appointment/DoctorAvailableAppointment
    Gets a specific doctors available appointment by date, clinic and doctor id
- POST: /API/Appointment
    Create an appointment
- PUT: /API/Appointment
    Edit an appointment
- DELETE: /API/Appointment/{id}
    Delete an appointment

Clinic:
- GET: /API/Clinic
    Get an array of all Clinics
- GET: /API/Clinic/{id}
    Get a clinic by ID
- POST: /API/Clinic
    Create a clinic
- PUT: /API/Clinic
    Edit a clinic
- DELETE: /API/Clinic/{id}
    Delete a clinic

Doctor:
- GET: /API/Doctor
    Get an array of all doctors
- GET: /API/Doctor/{id}
    Get a doctor by ID
- GET: /API/Doctor/Search
    Search for a specific doctor by first or last name
- GET: /API/Doctor/SearchMany
    Get an array of doctors by first or last name
- POST: /API/Doctor
    Create a doctor
- PUT: /API/Doctor
    Edit a doctor
- DELETE: /API/Doctor/{id}
    Delete a doctor

Patient
- GET: /API/Patient
    Get all patients
- GET: /API/Patient/{id}
    Get a patient by ID
- GET: /API/Patient/BySSN
    Get a patient by their hashed SSN
- POST: /API/Patient
    Create a patient
- PUT: /API/Patient
    Edit a patient
- DELETE: /API/Patient/{id}
    Delete a patient

Speciality
- GET: /API/Speciality
    Get an array of doctor specialties
- GET: /API/Speciality/{id}
    Get a doctor specialty by ID
- POST: /API/Speciality
    Create a specialty
- PUT: /API/Speciality
    Edit a speciality
- DELETE: /API/Speciality/{id}
    Delete a speciality

All Endpoints contain a way to Find All, By ID, Edit, Delete and Create.
They are documented using swagger at localhost:5136/doc (redirects to http://localhost:5136/doc/index.html)

### REFERENCES
- https://www.aleris.no/ (Used as reference and inspiration)