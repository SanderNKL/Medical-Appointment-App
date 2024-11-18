using System;
using System.Security.Cryptography;
using System.Text;
using ExamProject.Utilities;

namespace ExamProject.Models

{
    public class Patient
    {
        public int ID { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string SSN { get; set; }
        public DateTime Birthdate { get; set; }
        public required string Gender { get; set; }

        // Hash and Set the Sosial Security Number
        public void SetSSN(string ssn)
        {
            SSN = Hash.HashString(ssn);
        }
    }
}
