# Mini CRM — Client Lead Management System

A full-stack mini CRM: leads come in from a website contact form, admins log in
to view, filter, update status, and add follow-up notes.
Live demo: https://future-fs-02-gray-eight.vercel.app
Login: Username: future_fs_02
Password: future_fs_02


Admin credentials available on request, or use the seed script (npm run seed) to create your own.
GitHub repo: https://github.com/thontipraneethkumar/FUTURE_FS_02

**Stack:** React (Vite) · Node.js + Express · MySQL · JWT auth

```
mini-crm/
├── backend/        Express API + MySQL
├── frontend/        React admin dashboard
└── sample-contact-form.html   Example public form that posts a lead
```

## 1. Database setup

Create the database and tables:

```bash
mysql -u root -p < backend/sql/schema.sql
```

This also inserts 3 sample leads so the dashboard isn't empty on first run.

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set DB_PASSWORD to your MySQL password, set JWT_SECRET to a random string
```

Create your admin login (defaults to `admin` / `admin123` if you don't pass args):

```bash
npm run seed
# or: node sql/seedAdmin.js myusername mypassword
```

Start the API:

```bash
npm run dev      # with nodemon, auto-restarts on changes
# or
npm start
```

API runs at `http://localhost:5000`. Health check: `GET /api/health`.

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev
```

Dashboard runs at `http://localhost:5173`. Log in with the admin account you seeded.

## 4. Connecting a real contact form

Any website's contact form can create a lead by POSTing to the **public** endpoint
(no login required, since visitors aren't admins):

```
POST http://localhost:5000/api/public/leads
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "message": "Interested in your services",
  "source": "company-website"
}
```

See `sample-contact-form.html` for a working example — open it directly in a
browser while the backend is running.

## API reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/public/leads` | none | Create a lead (used by website forms) |
| POST | `/api/auth/login` | none | Admin login, returns a JWT |
| GET | `/api/auth/me` | admin | Get current logged-in admin |
| GET | `/api/leads` | admin | List leads (`?status=`, `?search=`, `?page=`, `?limit=`) |
| GET | `/api/leads/:id` | admin | Lead detail + its notes |
| PUT | `/api/leads/:id` | admin | Update status / contact details |
| DELETE | `/api/leads/:id` | admin | Delete a lead |
| POST | `/api/leads/:id/notes` | admin | Add a follow-up note |
| GET | `/api/leads/analytics` | admin | Total leads, counts by status, conversion rate |

Admin routes require `Authorization: Bearer <token>` from the login response.

## Features implemented

- Lead listing with name, email, source, status, received date
- Status pipeline: new → contacted → converted
- Follow-up notes per lead, timestamped
- JWT-protected admin dashboard (only logged-in admins see lead data)
- Search by name/email + filter by status
- Simple analytics bar: total leads, counts per status, conversion rate
- Sample public contact form showing real-world integration

## Notes for grading / demo

- The 3 seeded sample leads in `schema.sql` let you demo status changes and
  notes immediately without needing a live contact form.
- To show the "form → CRM" flow live: open `sample-contact-form.html` in a
  browser, submit it, then refresh the dashboard — the new lead appears as
  status `new`.
