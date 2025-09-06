# KampungKaki 

KampungKaki platform connects volunteers with requesters who need assistance.
This repository contains the **API server** (built with Node.js, TypeScript, Express) and the **PostgreSQL database setup**.

---
## 🔎 Overview

KampungKaki is a community-driven platform designed to connect persons with disabilities (PWDs) with nearby volunteers for ad-hoc, non-medical tasks. It lowers barriers to independence by making help accessible on-demand while reviving the kampung spirit of neighborly support.

To test:

Authentication → https://ekampongkaki.onrender.com (To be integrated with the rest of the app)

Rest of the app → Local deploy (Continue reading)

---
## 👩‍💻 Features of Our Project  

### ⚙️ 1. Practical Execution and Reliability  
- 📝 **Core features**: Beneficiaries can post requests (shopping, companionship, home tasks, transport, etc.), volunteers can browse and accept tasks, and both parties coordinate through in-app chat and masked phone numbers.  
- ✅ **Verification & accountability**: Each task has start/complete timestamps, code verification, and photo proof uploads to ensure accuracy and fairness in recorded hours.  
- 🗄️ **Backend stability**: Node.js with PostgreSQL provides a robust relational database.
- 🧑‍💻 **Code quality**: TypeScript enforces type safety and modules are structured for clarity. 

---

### 🔒 2. Safeguarding Data and Responsible Use  
- 🛂 **Strong identity checks**: Mobile phone authentication with One-Time-Password (OTP) ensures all users are genuine and vetted, reducing risks of fraud or abuse.  
- 🔐 **Secure communications**: API calls are secure and personal profile details are stored.
- 🕒 **Privacy by design**: Details of the beneficiaries and the volunteers are hidden until requests are accepted.   

---

### 🌍 3. Social Value and Long-Term Benefits  
- 🤝 **Empowering independence**: Reduces reliance on caregivers and costly institutional services.  
- 👨‍👩‍👧 **Supporting caregivers**: Families gain relief when small but time-consuming tasks are offloaded to volunteers.  
- 💸 **Affordable & dignified help**: Provides equitable access to essential services without stigma.  
- 🏘️ **Building community**: Encourages repeated volunteer–beneficiary interactions, reviving the kampung spirit and reducing isolation.  
- 📈 **Scalable model**: The framework can extend to elderly, migrant workers, or low-income families.  

---

### 💡 4. Originality and Fresh Thinking  
- ⏱️ **Micro-volunteering**: Enables flexible, ad-hoc contributions instead of rigid, long-term commitments.  
- 🌐 **Accessibility-first design**: Voice input, multilingual support, and screen-reader compatibility widen inclusivity.  
- 🏅 **Novel accountability system**: VIA hours logging bring new transparency.  
- 🔗 **Smart integrations**: Mobile Phone OTP (auth) and Google Maps (navigation) deliver a seamless experience.  

---

### 🎨 5. Design and User Friendliness  
- 🧾 **Simple, intuitive flows**: Beneficiaries use step-by-step request forms; volunteers browse via clean search and map views.   
- 🚀 **Smooth journey**: From posting a request to confirming completion, each step minimizes friction.  
- ✨ **Polished look**: A modern, accessible UI balances simplicity with professionalism, building trust in the platform.  

---

## 🚀 Tech Stack  

- **Frontend**: React, Vite.js   
- **Backend**: Node.js, Express, TypeScript  
- **Database**: PostgreSQL  
- **Authentication**: Mobile phone OTP (Render-hosted service, future integration with Singpass)  
- **Dev Tools**: Nodemon, ts-node  
- **Deployment**: Render (authentication), Localhost (frontend)

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
## 🔮 Future Extensions  

- ⚡ **Stronger backend infrastructure**: Expand real-time features with Redis for geo-matching, Firebase for chat, and CI/CD pipelines for automated deployment.  
- 🔐 **Enhanced security stack**: Add JWT-based API calls, TLS encryption across all traffic, and private VPC subnets for backend isolation.  
- 🕵️ **Admin audits**: Periodic reviews of ratings, photos, and recorded hours to ensure fairness, consistency, and prevent misuse.  
- ⏱️ **Proof & verified hours**: Volunteers upload photo proof, while timestamps log start and completion times to prevent inflated hours.  
- 🔁 **Recurring requests**: Beneficiaries can schedule repeated tasks (e.g., weekly grocery runs) and volunteers can opt in for continued support.  
- 🎯 **Smart volunteer suggestions**: The system recommends tasks based on location and previous activity.  
- 🌐 **Stronger accessibility**: Multilingual support, richer voice input options, and ARIA-compliant interfaces for vision-impaired users.  
- 🧩 **Community expansion**: Extend the model to elderly residents, migrant workers, and low-income families with tailored templates and features.  
- 🎁 **Rewards & partnerships**: Work with schools (for VIA hours) and corporations (for vouchers and sponsorships) to encourage volunteer participation.  

---

## 🤝 Contributing

1. Fork this repo
2. Create a new branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📚 GitHub Repositories

1. Main Repository: https://github.com/shejiac/kampungkaki
2. Authentication Repositories: https://github.com/caffeinatedberry/kkMobilephoneauth, https://github.com/caffeinatedberry/kkbackend-final

---

## 📄 License

MIT License 

---
