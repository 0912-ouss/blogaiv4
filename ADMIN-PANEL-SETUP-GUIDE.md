# 🎯 Admin Panel Setup Guide

A comprehensive admin panel built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Recharts** for managing your blog.

## 📦 Features

### ✅ Core Features Implemented:

1. **Authentication System**
   - Login/Logout with JWT tokens
   - Protected routes
   - Session management

2. **Dashboard**
   - Overview statistics (articles, views, comments, categories)
   - Top performing articles
   - Article status distribution chart
   - Daily AI generation progress tracker

3. **Article Management**
   - List all articles with search and filters
   - View article details
   - Delete articles
   - Status badges (published/draft/archived)
   - AI-generated article indicators

4. **Analytics**
   - Dashboard metrics
   - Charts and visualizations
   - Performance tracking

5. **User Management**
   - Admin users list
   - User roles (super_admin, admin, editor)
   - User status tracking

6. **Categories & Tags**
   - Category management
   - Visual category cards

7. **Comments Moderation**
   - View all comments with filters
   - Approve/delete comments
   - Status indicators

8. **Settings**
   - Site configuration
   - General settings

9. **Responsive Design**
   - Mobile-friendly sidebar
   - Responsive tables and cards
   - Touch-friendly UI

10. **Toast Notifications**
    - Success/error messages
    - User feedback for all actions

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 16+ installed
- Backend API server running (see backend setup below)
- Supabase database configured

### Step 1: Backend Setup

First, set up the database and backend API:

```bash
# Navigate to backend directory
cd "d:\old pc\auto blog v1\auto blog-appv1"

# Run the admin database setup in Supabase SQL Editor
# Open admin-database-setup.sql and execute it
```

The SQL script will create:
- `admin_users` table
- `activity_logs` table
- `site_settings` table
- `admin_sessions` table
- Default admin user (email: admin@blog.com, password: Admin@123)

**⚠️ IMPORTANT:** Change the default password after first login!

### Step 2: Backend Server

Make sure your backend server is running:

```bash
cd "d:\old pc\auto blog v1\auto blog-appv1"

# Install dependencies (if not already done)
npm install

# Start the server
npm start
```

The backend should be running on `http://localhost:3000`

### Step 3: Admin Panel Frontend

```bash
# Navigate to admin panel
cd "d:\old pc\auto blog v1\admin-panel"

# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Create environment file
# Copy .env.example to .env (or create .env with the content below)
```

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:3000/api
PORT=3001
```

### Step 4: Start Admin Panel

```bash
# Start the development server
npm start
```

The admin panel will open at `http://localhost:3001`

---

## 🔐 Login

**Default Admin Credentials:**
- **Email:** `admin@blog.com`
- **Password:** `Admin@123`

⚠️ **Change this password immediately after first login!**

---

## 📂 Project Structure

```
admin-panel/
├── src/
│   ├── components/
│   │   ├── Common/          # Reusable components
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── StatCard.tsx
│   │   ├── Layout/          # Layout components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── Dashboard/       # Dashboard components
│   │   ├── Articles/        # Article components
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Articles.tsx
│   │   ├── Analytics.tsx
│   │   ├── Users.tsx
│   │   ├── Categories.tsx
│   │   ├── Comments.tsx
│   │   ├── Media.tsx
│   │   └── Settings.tsx
│   ├── services/            # API services
│   │   └── api.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utilities
│   │   ├── AuthContext.tsx
│   │   └── helpers.ts
│   ├── App.tsx              # Main app component
│   ├── index.tsx            # Entry point
│   └── index.css            # Global styles
├── public/
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/admin/auth/login` - Login
- `GET /api/admin/auth/verify` - Verify token
- `POST /api/admin/auth/logout` - Logout
- `POST /api/admin/auth/change-password` - Change password

### Analytics
- `GET /api/admin/analytics/dashboard` - Dashboard stats
- `GET /api/admin/analytics/articles-over-time` - Articles timeline
- `GET /api/admin/analytics/top-articles` - Top articles
- `GET /api/admin/analytics/category-distribution` - Category stats
- `GET /api/admin/analytics/activity-logs` - Admin activity logs

### Articles
- `GET /api/admin/articles` - List all articles (with filters)
- `GET /api/admin/articles/:id` - Get single article
- `PUT /api/admin/articles/:id` - Update article
- `DELETE /api/admin/articles/:id` - Delete article
- `POST /api/admin/articles/bulk-action` - Bulk actions

### Users & Authors
- `GET /api/admin/users` - List admin users
- `POST /api/admin/users` - Create admin user
- `PUT /api/admin/users/:id` - Update admin user
- `DELETE /api/admin/users/:id` - Delete admin user
- `GET /api/admin/users/authors` - List authors
- `POST /api/admin/users/authors` - Create author

### Categories & Tags
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `GET /api/admin/categories/tags` - List tags

### Comments
- `GET /api/admin/comments` - List comments (with filters)
- `PATCH /api/admin/comments/:id/approve` - Approve comment
- `PATCH /api/admin/comments/:id/spam` - Mark as spam
- `DELETE /api/admin/comments/:id` - Delete comment
- `POST /api/admin/comments/bulk-action` - Bulk actions

### Settings
- `GET /api/admin/settings` - Get all settings
- `GET /api/admin/settings/:key` - Get single setting
- `PUT /api/admin/settings/:key` - Update setting
- `POST /api/admin/settings/bulk-update` - Bulk update

---

## 🎨 Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Headless UI** - Accessible components
- **Heroicons** - Icons
- **Recharts** - Data visualization
- **React Toastify** - Notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Supabase** - Database (PostgreSQL)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from CRA (irreversible!)
npm run eject
```

### Adding New Features

1. **Add new page:**
   - Create component in `src/pages/`
   - Add route in `src/App.tsx`
   - Add navigation item in `src/components/Layout/Sidebar.tsx`

2. **Add new API endpoint:**
   - Add method in `src/services/api.ts`
   - Define types in `src/types/index.ts`

3. **Add new component:**
   - Create in appropriate `src/components/` subdirectory
   - Follow existing component patterns

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"
**Solution:** Ensure backend server is running on `http://localhost:3000`

### Issue: "Invalid token" errors
**Solution:** Clear localStorage and login again:
```javascript
localStorage.clear();
```

### Issue: "Module not found" errors
**Solution:** Reinstall dependencies:
```bash
npm install --legacy-peer-deps
```

### Issue: Tailwind styles not working
**Solution:** Ensure Tailwind is properly configured and imported in `index.css`

---

## 📝 TODO / Future Enhancements

- [ ] Rich text editor for article content (TinyMCE/Quill)
- [ ] Image upload functionality
- [ ] Dark mode toggle
- [ ] Advanced analytics charts
- [ ] Bulk article operations UI
- [ ] Article scheduling
- [ ] Email notification settings
- [ ] Two-factor authentication
- [ ] Activity log viewer
- [ ] Database backup/restore UI

---

## 🔒 Security Notes

1. **Change default password** immediately after setup
2. Use strong passwords for all admin accounts
3. Keep JWT_SECRET secure (use environment variables)
4. Enable HTTPS in production
5. Implement rate limiting for login attempts
6. Regular security audits
7. Keep dependencies updated

---

## 📄 License

MIT License - Feel free to use and modify as needed

---

## 🙋 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check console logs for errors
4. Verify database setup is complete

---

**Enjoy your new admin panel! 🎉**

