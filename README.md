(1) To test authentication for app
=> https://ekampongkaki.onrender.com 
(would be linked to the app when app is deployed)

(2) To test the rest of the app:
=> local deploy








GITHUB REPO for authentication
https://github.com/caffeinatedberry/kkMobilephoneauth
https://github.com/caffeinatedberry/kkbackend-final


---

# KampungKaki 

KampungKaki platform connects volunteers with requesters who need assistance.
This repository contains the **API server** (built with Node.js, TypeScript, Express) and the **PostgreSQL database setup**.

---

## 🚀 Tech Stack

* **Backend**: Node.js, Express, TypeScript
* **Database**: PostgreSQL
* **Dev Tools**: Nodemon, ts-node

---

## 📦 Prerequisites

Before starting, make sure you have installed:

* [Node.js](https://nodejs.org/) (v18+ recommended)
* [PostgreSQL](https://www.postgresql.org/) (v14+ recommended)
* [npm](https://www.npmjs.com/) 

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/shejiac/kampungkaki.git
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

```bash
cd front end
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=kampung_kaki

# Server
PORT=3000
NODE_ENV=development
```

### 4. Setup the Database

Run the setup script to create the database schema:

```bash
npx ts-node backend/scripts/dbSetup.ts
```

This will:

* Connect to your PostgreSQL instance
* Create the `kampung_kaki` database (if it doesn’t exist)
* Create required tables (`t_requests`, `t_accepted_requests`, etc.)

If you want to reset the schema, just drop the DB manually and re-run the script.

Run the dummy data scripts to create the database details to get started:

```bash
npx ts-node backend/scripts/mockUsers.ts
```
```bash
npx ts-node backend/scripts/mockRequests.ts
```

### 5. Start the Development Server

```bash
cd backend
npm run dev
```


```bash
cd frontend
npm run dev
```

Server will run at:
```
http://localhost:5173
```
---

## 🗄️ Database Schema (Current Tables)

* **`t_users`**: Stores user information
* **`t_requests`**: Stores user requests
* **`t_accepted_requests`**: Stores accepted requests (links volunteers with requesters)
* **`t_chats`**: Stores chat information
* **`t_chat_messages`**: Stores chat message information


*(Update this section with all tables and fields once schema is finalized.)*

---

## 📜 Scripts

* `npm run dev` → Start development server with nodemon
* `npm run build` → Build TypeScript to JavaScript

---

## 🤝 Contributing

1. Fork this repo
2. Create a new branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License 

---
