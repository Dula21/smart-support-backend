# Smart Support Backend

A backend-heavy support ticket system built with Node.js, Express, and MongoDB Native.

## Features
- User authentication (register, login) with JWT.
- Ticket CRUD operations.
- Ticket classification based on keywords.
- Role-based access (user/admin).

## Setup
1. Install dependencies: `npm install`.
2. Set up MongoDB locally or update `MONGO_URI` in `.env`.
3. Run: `npm start` or `npm run dev` for development.

## API Endpoints
- **Auth**: POST /api/auth/register, POST /api/auth/login
- **Tickets**: GET /api/tickets, POST /api/tickets, PUT /api/tickets/:id, DELETE /api/tickets/:id

## Environment Variables
- `PORT`: Server port (default 3000).
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret for JWT tokens.