

# Setup
## 1 -- SETTING UP .NET
Make sure you have downloaded .NET SDK

## 2 -- SETTING UP NECCESARY FILES
Rename example-appsettings.json to appsettings.json (remove example)

## 3 -- SETTING UP CONNECTION STR
Set the connection string to your specifications.

Connection str:
```
server=localhost;database=clinic;user=YOUR-USERNAME-HERE;password=YOUR-PASSWORD-HERE
```

Example appsettings.json:
```
{
  "Logging": {
    "LogLevel": {
        "Default": "Information",
        "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "AllowedOrigins": [
    "http://localhost:3000"
  ],
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;database=YOUR-DB-NAME-HERE;user=YOUR-USERNAME-HERE;password=YOUR-PASSWORD-HERE"
  }
}
```

Replace YOUR-USERNAME-HERE and YOUR-PASSWORD-HERE with your actual Mysql username and password.
The database=clinic can be changed to your database name, but in this instance I used clinic.

In AllowedOrigins, you must add your front-end application address and with the correct port to prevent a CORS policy error.
For example:
```
"AllowedOrigins": [
    "http://localhost:3000"
  ],
```

## 4 -- Make sure the necessary extensions are installed:
Use 
```
dotnet restore
```
to ensure all of the extensions are up to date.

## 5 -- Build the Database tables using:
```
# First Run:
dotnet ef migrations add InitialCreate

# Then Run:
dotnet ef database update
```

These will create all of the tables (make sure the database does not have the tables already created, because otherwise it may (often will) fail to create them all.)
Do also insure that no Models are created as this will not allow you to run the initialcreate command. If you do, delete them.

It will also create a table called __EFMigrationsHistory. This table is used to track migration history and can be safely deleted if so wished.
Though, it may be useful to keep it as it contributes to managing your database safely.
If you for any reason do wish to remove it, you may use the SQL command:  DROP TABLE __EFMigrationsHistory;

## 6 -- Starting the APP
Run these commands in the terminal:
```
dotnet build
dotnet run
```

You should now be able to head to http://localhost:your-port/doc/index.html to see the documentation

# Additional Libraries:
Microsoft.EntityFrameworkCore.Design, Version: 8.0.3
MySQL.EntityFrameworkCore, Version: 8.0.0:
Swashbuckle.AspNetCore, Version: 6.4.0: