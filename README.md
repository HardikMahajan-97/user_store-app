# user_store-app

A complete React frontend for the **User Store Placement Management System** backend.

## Tech Stack

- **React 18** + **Vite** (build tool)
- **React Router v6** (client-side routing)
- **Axios** (HTTP client with interceptors)
- **Tailwind CSS** (styling)
- **React Hot Toast** (notifications)
- **React Icons** (iconography)
- **Context API** (auth state management)

## Features

### Student Portal
- Login / Register / Forgot Password / Reset Password
- Profile management (academic info, skills, projects, experience, achievements, coding & professional profiles)
- Document management (upload to Cloudinary, view, download, delete)
- Change password

### Admin Panel
- Student search by email
- Bulk student search (multiple emails)
- View student documents
- Change password

## Getting Started

### Prerequisites
- Node.js 18+
- The [user_store](https://github.com/HardikMahajan97/user_store) backend running on `http://localhost:8080`

### Installation

```bash
# Clone the repository
git clone https://github.com/HardikMahajan-97/user_store-app.git
cd user_store-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env if your backend runs on a different URL

# Start the development server
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8080` | Backend API base URL |

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/
│   └── axios.js              # Axios instance with interceptors
├── context/
│   └── AuthContext.jsx       # Auth context (user, token, login, logout)
├── components/
│   ├── layout/               # Navbar, Sidebar, Layout
│   ├── common/               # ProtectedRoute, RoleRoute, LoadingSpinner, FormInput
│   └── ui/                   # Card, Button, Modal
├── pages/
│   ├── auth/                 # Login, Register, ForgotPassword, ResetPassword
│   ├── student/              # Dashboard, Profile, Documents, ChangePassword
│   └── admin/                # Dashboard, StudentSearch, BulkSearch, StudentDocuments, ChangePassword
├── hooks/
│   └── useAuth.js            # Custom hook for AuthContext
├── utils/
│   └── constants.js          # API URL, roles, document categories
├── App.jsx                   # Router setup
└── main.jsx                  # Entry point
```

## Security

- JWT tokens stored in `localStorage`
- Axios request interceptor attaches `Authorization: Bearer <token>` to all requests
- Axios response interceptor auto-logs out on 401 responses
- Protected routes redirect unauthenticated users to `/login`
- Role-based routes redirect users to their appropriate dashboard
