# ⚔️ Daily CP Battle

A real-time 1v1 competitive programming battle platform. Get matched with an opponent, solve the same Codeforces problem, and first accepted submission wins. Compete, climb the leaderboard, and track your Elo rating.

🌐 **Live Demo:** https://daily-cp-battle-production.vercel.app/

---

## ✨ Features

- ⚔️ Real-time 1v1 coding battles via Socket.IO
- 🎯 Problems fetched live from Codeforces API by rating (800–1900)
- 🏆 Elo rating system — win to gain, lose to drop
- 👤 User profiles with match history
- 🔗 Codeforces submission auto-verification
- 🔐 JWT authentication with persistent sessions
- 📨 Private invite system with shareable codes
- 📊 Global leaderboard with rating tiers
- 🎨 Modern dark UI — glassmorphism, responsive, mobile-friendly
- 🚀 Fully deployed on Vercel + Render + MongoDB Atlas

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React.js, Tailwind CSS, Socket.IO Client, Axios |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| API | Codeforces REST API |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## 📸 Screenshots

> Add screenshots here
<img width="1905" height="849" alt="image" src="https://github.com/user-attachments/assets/dfc21e0c-0691-4565-999c-889f2e2c3507" />
<img width="1880" height="798" alt="image" src="https://github.com/user-attachments/assets/e298e4fc-fc11-46b1-b9a2-c9ca1df13e54" />
<img width="1093" height="621" alt="image" src="https://github.com/user-attachments/assets/e2026a86-3dd2-43ae-8856-2b1aea3cd504" />
<img width="1104" height="630" alt="image" src="https://github.com/user-attachments/assets/bf4247fb-52a9-44be-97fd-7b40de9170fa" />

---

## ⚙️ Local Setup

**1. Clone the repo**
```bash
git clone https://github.com/aliscodess/daily-cp-battle-production.git
cd daily-cp-battle-production
```

**2. Backend**
```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

**3. Frontend**
```bash
cd frontend
cp .env.example .env
# Fill in your values in .env
npm install
npm start
```

---

## 🔑 Environment Variables

**backend/.env**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
```

**frontend/.env**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Deployment

- **Frontend** → Vercel (auto-deploys on push to main)
- **Backend** → Render
- **Database** → MongoDB Atlas

---

## 📚 What I Built & Learned

- Real-time bidirectional communication with Socket.IO (matchmaking queue, live battle state, reconnection handling)
- Elo rating algorithm for competitive ranking
- Third-party API integration (Codeforces) for problem fetching and submission verification
- JWT auth with persistent sessions and protected routes
- Production deployment with environment-based configuration
- Rate limiting, CORS, and security best practices with Helmet

---

## 👩‍💻 Author

**Alisha**
- LinkedIn: [your LinkedIn](https://www.linkedin.com/in/alisha-malhotra-746a212a5/)
- GitHub: [@aliscodess](https://github.com/aliscodess)

If you found this useful, consider starring the repo ⭐
