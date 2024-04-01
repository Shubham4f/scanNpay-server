# ScanNpay Server

ScanNpay Server is the backend of the ScanNpay project, a wallet app designed for QR payments. This repository contains the server-side codebase responsible for handling authentication, user data, and transactions.

## Technologies Used

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![Jsonwebtokens](https://img.shields.io/badge/jwt-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

## Prerequisites

Before running the project, make sure you have the following installed:

- Node.js: [Download and Install Node.js](https://nodejs.org/)

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Shubham4f/scanNpay-server.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd scanNpay-server
   ```

3. **Open a terminal in the project folder and run the following command to install dependencies:**

   ```bash
   npm install
   ```

4. **Create a .env file based on demo.env:**
   ```env
   DATABASE = your_database_connection_string
   PORT = your_server_port
   JWT_SECRET = your_jwt_secret_key
   RAZORPAY_API_KEY = your_razorpay_api_key
   RAZORPAY_API_SECRET = your_razorpay_api_secret
   ```
5. **Navigate to the project folder in the terminal and execute the following command to run the application:**

   ```bash
   npm start
   ```

## Note

This project is currently under development.
