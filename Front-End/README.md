# Setup
## 1 -- SETTING UP THE APPLICATION
Install the necessary libraries using:
```
npm install
```

Then rename example.env.local to .env.local
Make sure NEXT_PUBLIC_BASE_API_URL is set to the correct API URL for the back-end.
(The default should work fine, but change it if this is not the case)

## 2 -- CORS Policy
Navigate to the BED, go to appsettings.json and add the FED adress ( with port ) to AllowedOrigins.
If you need help, read the example as given in the BED Readme file. 

## 3 -- RUNNING THE APPLICATION
To run the application simply type:
```
npm run dev
```
into the terminal, and it should boot up correctly.
If not, make sure to go back to step 1, and ensure that everything was installed properly.
Some libraries (in rare cases) may not install themselves properly, and if thats the case reading their installation method is required.