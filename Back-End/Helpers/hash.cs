using System;
using System.Security.Cryptography;
using System.Text;

namespace ExamProject.Utilities
{
    public static class Hash
    {
        public static string HashString(string input)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(input);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }
}