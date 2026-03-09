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
- **Priority Management:** Customizable ticket priorities (High, Normal, Low) for optimized workflow.
- **Audit Trail & Communication Logs:** Detailed logs for every interaction, ensuring full transparency between Users and Admins.
- **Asynchronous Notifications:** Automated email updates triggered asynchronously via Nodemailer upon ticket status changes.

---

## Technical Architecture

### Tech Stack
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Native Driver & Aggregation Framework).
- **Intelligence Layer:** LLM-integrated AI APIs for sentiment and classification.
- **DevOps:** Optimized for Vercel/Render with cloud-native configurations.

### Performance & Security
- **Data Integrity:** MongoDB native driver for high-performance operations.
- **Scalability:** Modular service-layer architecture (User Service, Ticket Service, Notification Service) to support future **Microservices migration**.
- **Optimization:** AI-based fallback only when keyword-based matching is inconclusive, reducing latency.

---

## API Documentation (Selected Endpoints)

**POST /api/tickets**
* **Request:** `{ "title": "...", "description": "...", "priority": "High" }`
* **Response:** `{ "status": "success", "ticketId": "...", "category": "..." }`

**GET /api/tickets/:id/logs**
* **Purpose:** Retrieves the full audit trail and communication history for a specific ticket.

---

## System Flow
1. **Submission:** User submits ticket -> Backend processes via AI Classification.
2. **Persistence:** Ticket stored in MongoDB with Audit Trail logs.
3. **Admin Action:** Admin updates ticket status -> Backend triggers **Asynchronous Notification Service**.
4. **Resolution:** User receives email notification and views status on Dashboard.

---

## Project Purpose
This project demonstrates:
- **Enterprise-grade API Design.**
- **AI-Integrated Workflow Optimization.**
- **Asynchronous Process Management.**
- **Scalable System Architecture.**