# ChatHub Backend 🚀

ChatHub is a robust, real-time messaging platform originally developed as an academic project for **Artificial Intelligence** and **Software Development II** at Universidad Gran Mariscal de Ayacucho. It has since evolved into a complete, portfolio-ready application.

This repository contains the **Backend** of ChatHub. It provides RESTful APIs, real-time WebSocket communication, authentication, database management, and an AI-powered moderation system.

## 🌟 Key Features

* **Real-time Communication:** Built with `Socket.io` for instant messaging, read receipts, and typing indicators.
* **AI Message Moderation:** Integrates with an intelligent AI model (Ollama - Qwen2.5) to automatically detect and censor offensive language in real-time.
* **Authentication & Security:** JWT-based authentication, bcrypt password hashing, and express-rate-limit to prevent brute-force attacks.
* **Push Notifications:** Implements Web Push protocols to alert users of new messages even when the app is in the background.
* **Robust Database Architecture:** Relational data modeling with MySQL, featuring friendship graphs, group chats, and message tracking.
* **Strict Validation:** Uses `Zod` schemas to guarantee data integrity across all incoming HTTP and WebSocket payloads.
* **MVC Architecture:** Clean, scalable, and maintainable Model-View-Controller design pattern.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Real-time Engine:** Socket.io
* **Database:** MySQL (using `mysql2`)
* **Validation:** Zod
* **Authentication:** JSON Web Tokens (JWT) & bcrypt
* **Testing:** Vitest & Supertest
* **AI Integration:** Ollama API

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* pnpm (Package Manager)
* MySQL Server
* Ollama (with `qwen2.5-coder:1.5b` model pulled for AI moderation)

### Installation

1. Clone the repository and navigate to the directory:
   ```bash
   git clone <repo-url>
   cd Back-End-ChatHub
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and configure the following variables:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=chathub
   DB_PORT=3306
   SECRET_KEY=your_jwt_secret
   REFRESH_SECRET_KEY=your_refresh_secret
   OLLAMA_URL=http://localhost:11434
   # Add your VAPID keys for Web Push
   VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   ```

4. Run in Development Mode:
   This project uses a dual-terminal setup for compilation and execution.
   Terminal 1 (Transpile TypeScript on file changes):
   ```bash
   pnpm dev
   ```
   Terminal 2 (Run Node.js with watch mode):
   ```bash
   pnpm serve
   ```

## 🧪 Testing

This project uses **Vitest** for unit and integration testing.

```bash
# Run tests
pnpm test

# Run tests with coverage report
pnpm test:coverage
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
