# Smart Support Backend  
### AI-Powered Support Ticket Management System

A backend-driven support ticket system built with Node.js, Express, and MongoDB (Native Driver).  
The system includes secure authentication, ticket lifecycle management, and AI-assisted ticket classification.

---

## Overview

This backend serves as the core engine of a full-stack Support Management System.  
It handles user authentication, ticket operations, and automated classification logic to streamline issue handling.

The architecture is modular and designed for integration with a frontend application.

---

## Features

### Authentication
- User registration
- User login
- JWT-based authentication
- Role-based access control (User / Admin)
- Forgot Password / Reset Link

### Ticket Management
- Create tickets
- Retrieve tickets
- Update tickets
- Delete tickets
- User-specific ticket access
- Admin-level management

### Ticket Classification
- Automatic classification using:
  - Keyword-based logic
  - AI-based fallback classification
- Assigns tickets to predefined categories

---

## Tech Stack

Backend:
- Node.js
- Express.js
- MongoDB (Native Driver)

Security:
- JWT
- Environment-based configuration

AI Integration:
- External model API for classification

---

## Project Structure
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
└── server.js


The structure follows separation of concerns for scalability and maintainability.

---

## Installation & Setup

1. Install dependencies:

npm install

2. Create a `.env` file:

PORT=3000  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_jwt_secret  
AI_API_KEY=your_ai_api_key  

3. Run the server:

Development:
npm run dev

Production:
npm start

---

## API Endpoints

Authentication:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/rest-password

Tickets:
- GET /api/tickets
- POST /api/tickets
- PUT /api/tickets/:id
- DELETE /api/tickets/:id

---

## System Flow

1. User submits a ticket  
2. Backend processes the request  
3. Classification logic determines the category  
4. Ticket is stored in MongoDB  
5. Categorized data is returned to the frontend  

---

## Project Purpose

This project demonstrates:
- Backend API design
- Secure authentication implementation
- AI model integration into application workflows
- Role-based access control
- Structured system architecture

Built as part of a portfolio focused on intelligent, AI-integrated web systems.