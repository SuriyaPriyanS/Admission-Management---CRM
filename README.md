# Frontend (React + Vite)

## Stack
- React Router DOM (route-based screens)
- Redux Toolkit + React Redux (global state/auth/data)
- Tailwind CSS + reusable UI components

## Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment
Create `.env` from `.env.example`:
```bash
VITE_API_URL=http://localhost:5000/api
```

## Main Routes
- `/login`
- `/` (role-based redirect)
- `/dashboard` (ADMIN, MANAGEMENT)
- `/institutions` (ADMIN)
- `/programs` (ADMIN)
- `/quotas` (ADMIN)
- `/users/create` (ADMIN, create/register user after login)
- `/applicants` (ADMIN, OFFICER)
- `/allocation` (ADMIN, OFFICER)
- `/confirmation` (ADMIN, OFFICER)
- `/fees` (ADMIN, OFFICER)
