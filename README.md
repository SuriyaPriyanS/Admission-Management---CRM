# EduMerge - Admission Management & CRM System

A comprehensive React-based admission management system for educational institutions with role-based access control, seat allocation, and real-time quota tracking.

## Features

### Authentication & Authorization
- **Public Registration** - New users can register at `/register` without login
- **Login** - Existing users can login at `/login`
- **Role-based Access Control** - Three roles: ADMIN, OFFICER, MANAGEMENT
- **Protected Routes** - Routes are protected based on user roles

### Dashboard (ADMIN, MANAGEMENT)
- Total intake, confirmed admissions, allocated seats, remaining seats
- Quota-wise seat status with progress bars
- Recent activity feed
- Pending documents list
- Fee pending list
- Quick actions: New Applicant, Allocate Seat

### Master Setup (ADMIN only)
- **Institutions** - Create, edit, delete institutions with J&K cap limit
- **Campuses** - Create, edit, delete campuses linked to institutions
- **Departments** - Create, edit, delete departments linked to campuses
- **Programs** - Create, edit, delete programs with seat matrix (KCET, COMEDK, Management quotas)
- **Academic Years** - Manage academic years with status (Active, Upcoming, Closed)

### Applicants (ADMIN, OFFICER)
- Create applicants with 15 required fields
- Edit and delete applicants
- Update document status (PENDING, SUBMITTED, VERIFIED)
- Filter by quota type, entry type, category

### Seat Allocation (ADMIN, OFFICER)
- **Government Flow** - For KCET/COMEDK applicants with allotment number
- **Management Flow** - For management quota applicants
- Real-time quota availability check
- Seat allocation with validation

### Admission Confirmation (ADMIN, OFFICER)
- View pending confirmations (fee paid + docs verified required)
- Confirm admissions and generate admission numbers
- View confirmed admissions with admission numbers

### Fee Status (ADMIN, OFFICER)
- Track fee payment status
- Mark fees as paid
- View fee pending list

### User Management (ADMIN only)
- Create new users with roles (OFFICER, MANAGEMENT, ADMIN)

## Tech Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Redux Toolkit** - State management
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool

## Project Structure

```
src/
├── app/                    # Redux store and hooks
│   ├── hooks.js
│   └── store.js
├── components/             # Reusable UI components
│   ├── common/
│   │   └── InfoBanner.jsx
│   ├── ui/                 # UI primitives
│   │   ├── badge.jsx
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   ├── select.jsx
│   │   └── textarea.jsx
│   ├── AdmissionsView.jsx
│   ├── ApplicantsView.jsx
│   ├── DashboardView.jsx
│   ├── LoginView.jsx
│   └── MastersView.jsx
├── features/               # Redux slices
│   ├── app/
│   │   └── appSlice.js
│   ├── auth/
│   │   └── authSlice.js
│   └── data/
│       └── dataSlice.js
├── layouts/                # Layout components
│   └── AppLayout.jsx
├── lib/                    # Utilities
│   ├── api.js
│   └── utils.js
├── pages/                  # Page components
│   ├── AdmissionsPage.jsx
│   ├── AllocationPage.jsx
│   ├── ApplicantsPage.jsx
│   ├── ConfirmationPage.jsx
│   ├── DashboardPage.jsx
│   ├── FeesPage.jsx
│   ├── InstitutionsPage.jsx
│   ├── LoginPage.jsx
│   ├── MastersPage.jsx
│   ├── ProgramsPage.jsx
│   ├── PublicRegisterPage.jsx
│   ├── QuotasPage.jsx
│   └── RegisterUserPage.jsx
├── router/                 # Routing
│   └── AppRouter.jsx
├── routes/                 # Route guards
│   ├── ProtectedRoute.jsx
│   └── RoleHomeRedirect.jsx
├── App.jsx
├── index.css
└── main.jsx
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration (ADMIN only for protected route)
- `GET /auth/me` - Get current user

### Masters (ADMIN only)
- `GET/POST /masters/institutions` - List/Create institutions
- `PUT/DELETE /masters/institutions/:id` - Update/Delete institution
- `GET/POST /masters/campuses` - List/Create campuses
- `PUT/DELETE /masters/campuses/:id` - Update/Delete campus
- `GET/POST /masters/departments` - List/Create departments
- `PUT/DELETE /masters/departments/:id` - Update/Delete department
- `GET/POST /masters/programs` - List/Create programs
- `PUT/DELETE /masters/programs/:id` - Update/Delete program

### Applicants (ADMIN, OFFICER)
- `GET/POST /applicants` - List/Create applicants
- `PUT/DELETE /applicants/:id` - Update/Delete applicant
- `PATCH /applicants/:id/documents` - Update document status

### Admissions (ADMIN, OFFICER)
- `GET /admissions` - List admissions
- `POST /admissions/allocate` - Allocate seat
- `PATCH /admissions/:id/confirm` - Confirm admission
- `PATCH /admissions/:id/fee` - Update fee status
- `GET /admissions/availability/:programId/:quotaType` - Check quota availability

### Dashboard (ADMIN, MANAGEMENT)
- `GET /dashboard` - Get dashboard statistics

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
cp .env.example .env
```

4. Update `.env` with your API URL
```
VITE_API_URL=http://localhost:5000/api
```

5. Start development server
```bash
npm run dev
```

6. Open browser and navigate to `http://localhost:5173`

## Default Credentials

After seeding the backend:
- **Admin**: admin@edumerge.local / Admin@123
- **Officer**: officer@edumerge.local / Officer@123
- **Management**: management@edumerge.local / Manager@123

## Role-Based Access

### ADMIN
- Dashboard
- Master Setup (Institutions, Campuses, Departments, Programs)
- Create User
- Applicants
- Seat Allocation
- Admission Confirmation
- Fee Status

### OFFICER
- Applicants
- Seat Allocation
- Admission Confirmation
- Fee Status

### MANAGEMENT
- Dashboard (read-only)

## UI Components

### Design System
- **Colors**: Teal primary, navy dark, lime accent
- **Typography**: Syne for headings, Outfit for body
- **Components**: Cards, Buttons, Badges, Forms with consistent styling
- **Responsive**: Mobile-first design with sidebar navigation

### Key Components
- `DashboardView` - Stats cards, quota progress, activity feed
- `MastersView` - CRUD forms for institutions, campuses, departments, programs
- `ApplicantsView` - Applicant form and list with document status
- `AdmissionsView` - Seat allocation with quota availability check
- `LoginView` - Login form with credential hints
- `PublicRegisterPage` - Public registration form

## State Management

### Redux Slices
- `authSlice` - Authentication state (token, user, login/logout)
- `dataSlice` - Application data (masters, applicants, admissions, dashboard)
- `appSlice` - UI state (messages, loading)

### API Integration
- Centralized API client in `lib/api.js`
- Request/response interceptors for auth token
- Error handling utilities

## Styling

### Tailwind CSS
- Custom color palette matching design system
- Responsive grid layouts
- Custom shadows and borders
- Gradient backgrounds

### Custom Classes
- `.shadow-warm` - Warm shadow effect
- `.mono` - Monospace font for codes
- `.badge-*` - Badge variants (success, warning, danger)

## Contributing

1. Follow the existing code structure
2. Use TypeScript for new features (optional)
3. Add proper error handling
4. Test all CRUD operations
5. Ensure responsive design

## License

This project is proprietary software for educational institutions.
