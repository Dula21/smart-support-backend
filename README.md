# Smart Support Backend
### AI-Powered Enterprise Ticket Management System

A robust, backend-driven support ticket infrastructure built with **Node.js, Express, and MongoDB (Native Driver)**. Designed to bridge the gap between user requests and administrative action through **intelligent ticket classification** and efficient lifecycle management.

---

## Architecture Overview
The system is built as a modular backend engine designed for high-concurrency cloud environments.



---

## Key Features

### Authentication & Security
- **Secure Auth:** JWT-based stateless authentication.
- **RBAC:** Role-Based Access Control (Admin/User).
- **Security:** Environment-based configuration, CORS protection, and secure route middleware.

### Intelligent Ticket Lifecycle
- **Automated Triage:** AI-powered classification logic (Keyword + LLM fallback) to route tickets instantly.
- **Audit Trail:** Detailed communication logs for every interaction, ensuring full transparency.
- **Asynchronous Notifications:** Automated status update emails triggered asynchronously to maintain system performance.
- **Priority Management:** Customizable ticket priorities (High, Normal, Low) for optimized workflow.

---

## Technical Architecture

### Tech Stack
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Native Driver & Aggregation Framework).
- **Intelligence Layer:** LLM-integrated AI APIs for sentiment and classification.
- **DevOps:** Optimized for Vercel/Render with cloud-native configurations.

### Performance & Security
- **Data Integrity:** Used MongoDB native driver for high-performance data operations.
- **Scalability:** Modularized codebase utilizing separate service layers to support future **Microservices migration**.
- **Optimization:** Implemented AI-based fallback only when keyword-based matching is inconclusive, significantly reducing API latency and costs.

---

## API Documentation (Example)

**POST /api/tickets**
* **Request Body:**
    ```json
    {
      "title": "Login Error",
      "description": "Unable to access account",
      "priority": "High"
    }
    ```
* **Response:**
    ```json
    {
      "status": "success",
      "ticketId": "65ab789...",
      "category": "Authentication"
    }
    ```

---

## Installation & Setup

1. **Install dependencies:**
   `npm install`

2. **Configure environment (.env):**
   ```text
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   AI_API_KEY=your_ai_api_key