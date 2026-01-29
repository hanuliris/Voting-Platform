# 🚀 How to Run the Voting Platform

## Quick Start (Easiest Way)

### Prerequisites:
- Docker Desktop installed and running

### Steps:

1. **Open terminal in project folder**
   ```bash
   cd voting-platform-js
   ```

2. **Start everything with ONE command**
   ```bash
   docker-compose up -d --build
   ```

3. **Wait 2 minutes** for containers to start

4. **Open browser and go to:**
   ```
   http://localhost:3000
   ```

5. **Login with:**
   - **Email**: `voter1@voting.com`
   - **Password**: `Voter@123`

   Or as admin:
   - **Email**: `admin@voting.com`
   - **Password**: `Admin@123`

### That's it! ✅

---

## What's Running?

After `docker-compose up`, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Next.js web app |
| **Backend API** | http://localhost:8080/api | Spring Boot REST API |
| **Database** | localhost:3306 | MySQL database |

---

## Common Commands

```bash
# Stop everything
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Check status
docker-compose ps

# Clean everything (remove data)
docker-compose down -v
```

---

## Manual Run (Without Docker)

### Backend:
```bash
cd backend
mvn clean package
java -jar target/*.jar
```

### Frontend:
```bash
cd frontend
npm install
npm run build
npm start
```

### Database:
Install MySQL 8.0 and create database `voting_platform`

---

## Troubleshooting

### Port Already in Use?
```bash
# Stop all containers
docker-compose down

# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Kill the process or change ports in docker-compose.yml
```

### Can't Connect to Database?
```bash
# Check MySQL container is healthy
docker-compose ps

# View MySQL logs
docker-compose logs mysql
```

### Frontend Won't Load?
```bash
# Check backend is running
curl http://localhost:8080/api/auth/login

# Rebuild frontend
docker-compose up -d --build frontend
```

---

## Default Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@voting.com | Admin@123 |
| Voter | voter1@voting.com | Voter@123 |
| Voter | voter2@voting.com | Voter@123 |
| Candidate | candidate@voting.com | Candidate@123 |

---

## What Each Component Does

### Backend (`/backend`)
- **Language**: Java 21
- **Framework**: Spring Boot
- **Purpose**: REST API, authentication, business logic
- **Key folders**:
  - `config/` - App configuration (see README.md inside)
  - `controller/` - API endpoints (see README.md inside)
  - `service/` - Business logic (see README.md inside)
  - `entity/` - Database tables (see README.md inside)
  - `repository/` - Database access (see README.md inside)
  - `security/` - JWT auth (see README.md inside)
  - `dto/` - Data objects (see README.md inside)

### Frontend (`/frontend`)
- **Language**: JavaScript
- **Framework**: Next.js 14
- **Purpose**: User interface
- **Key folders**:
  - `app/` - Pages (login, vote, results)
  - `components/` - Reusable UI components
  - `lib/` - API client, utilities

### Database
- **Type**: MySQL 8.0
- **Tables**: users, polls, candidates, votes
- **Schema**: Auto-created by Hibernate

---

## Architecture

```
Browser (localhost:3000)
    ↓
Frontend (Next.js)
    ↓ REST API
Backend (Spring Boot :8080)
    ↓ JDBC
MySQL Database (:3306)
```

---

## Postman Smoke Tests

1. **Import assets** from `postman/voting-platform.postman_collection.json` and `postman/voting-platform.local.postman_environment.json`.
2. **Select the environment** in Postman (it preloads localhost URLs and default demo credentials).
3. Run **Admin Login** to store `ADMIN_TOKEN`, then **Get All Polls** or **Create Poll**.
4. Run **Voter Login** to store `VOTER_TOKEN`, set `POLL_ID`/`CANDIDATE_ID` (use "Get Candidates" to find IDs), then fire **Cast Vote**.
5. Finish with **Ledger → List Entries** to show the new block and prove the hash chain updated.

Each request only uses basic headers and JSON bodies so you can demo the API quickly without extra scripting.

---

## Need Help?

Check the README.md files inside each backend package folder for detailed explanations of what each component does.
