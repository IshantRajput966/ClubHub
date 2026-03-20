# Setup Instructions for ClubHub

## Prerequisites
- Ensure you have the following installed:
  - Node.js (version >= 14.x)
  - npm (version >= 6.x)
  - MongoDB (for database)

## Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/IshantRajput966/ClubHub.git
   cd ClubHub
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables
- Create a `.env` file in the root directory and provide the following environment variables:
  ```
  PORT=3000
  DB_URL=mongodb://localhost:27017/clubhub
  SECRET_KEY=your_secret_key
  ```

## Database Initialization
- Make sure MongoDB service is running.
- Use the following command to initialize the database:
   ```bash
   mongo <path_to_database_initialization_script.js>
   ```

## Demo Accounts
- You can use the following credentials for demo accounts:
  - Username: demo_user
  - Password: demo_password

## Production Build
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the server:
   ```bash
   npm start
   ```

## Troubleshooting
- If you encounter issues, check:
  - Ensure all services are running.
  - Review error logs for specific error messages.

## Project Structure
```
/ClubHub
│
├── /src                 # Source files
├── /docs                # Documentation files
├── package.json         # npm package configuration
├── .env                 # Environment variables
└── README.md            # Project overview
```
