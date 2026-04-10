# Deployment Instructions for Dance Studio Management System

This project is now production-ready. Follow these steps to deploy.

## 1. Backend (Node.js/Express)
Deploy the contents of the `dance studio/backend` folder to a service like **Render, Railway, or Heroku**.

### Environment Variables
Set the following variables on your hosting provider:
- `MONGODB_URI`: Your production MongoDB connection string (e.g., MongoDB Atlas).
- `PORT`: Usually set automatically by the provider (defaults to 5000).
- `ALLOWED_ORIGINS`: A comma-separated list of your frontend URLs (e.g., `https://your-studio-site.com,https://your-admin-panel.com`).

---

## 2. Frontend - Landing Page (React/Vite)
Deploy the contents of the `dance studio/studio` folder to **Vercel or Netlify**.

### Environment Variables
Set the following variables in the build settings:
- `VITE_API_URL`: The URL of your deployed backend + /api (e.g., `https://your-backend.onrender.com/api`).

---

## 3. Frontend - Admin Panel (React/Vite)
Deploy the contents of the `dance studio admin/frontend/admin` folder to **Vercel or Netlify**.

### Environment Variables
Set the following variables in the build settings:
- `VITE_API_URL`: The URL of your deployed backend + /api (e.g., `https://your-backend.onrender.com/api`).

---

## Important Pre-Deployment Checklist
1.  **Build Command**: Ensure your deployment service runs `npm run build` for the frontends.
2.  **Socket.io**: Real-time features work automatically over the backend URL. No extra setup is needed beyond setting the `VITE_API_URL`.
3.  **Database**: Make sure your MongoDB Atlas (or other DB host) allows access from the IP addresses of your backend server (whitelist `0.0.0.0/0` if unsure).

---

## Development vs Production
The code automatically detects if it's running locally and will fall back to `localhost:5000` for ease of testing.
