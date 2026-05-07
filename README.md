# BuyWise AI v2.0 - Complete Platform

Smart price tracking and comparison platform.

## 📁 Structure

```
/backend
  ├── package.json
  ├── server.js
  ├── .env.example
  ├── .gitignore
  └── README.md

/frontend
  ├── package.json
  ├── vite.config.js
  ├── tailwind.config.js
  ├── postcss.config.js
  ├── index.html
  ├── .env.example
  ├── .gitignore
  ├── README.md
  └── src/
      ├── main.jsx
      ├── App.jsx
      └── index.css
```

## 🚀 Deployment

### Backend (Render)
1. Upload `/backend` to GitHub
2. Create Web Service on Render
3. Set Root Directory: `backend`
4. Set Start Command: `node server.js`
5. Add MONGO_URI environment variable

### Frontend (Netlify)
1. Upload `/frontend` to GitHub
2. Connect to Netlify
3. Set Base Directory: `frontend`
4. Set Build: `npm run build`
5. Set Publish: `dist`

## ✅ Features

- Product discovery
- Price tracking
- Smart alerts
- Multi-store comparison
- One-click buying

## 🔗 Live URLs

- Backend: https://buywise-ai-backend.onrender.com
- Frontend: https://buywise-ai-frontend.netlify.app

## 📝 Notes

- MongoDB Atlas already configured
- All dependencies included
- Production ready
- Ready to deploy
