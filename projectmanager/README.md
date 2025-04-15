# Project Manager

A comprehensive web platform for visual project management with tasks, subtasks, and Gantt chart visualization.

## Features

- **User Authentication**: Register, login, and user profile management
- **Project Management**: Create, edit, and delete projects with team members
- **Task Management**: Organize tasks and subtasks with priorities and deadlines
- **Visual Timeline**: Gantt chart visualization of project schedules
- **Customizable UI**: Color coding and interface preferences
- **Admin Dashboard**: System statistics and user management
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Next.js, Tailwind CSS
- **Backend**: Node.js with Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **State Management**: React Context API
- **Styling**: Tailwind CSS with custom components

## Project Structure

```
projectmanager/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API endpoints
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── projects/     # Project related pages
│   │   ├── tasks/        # Task related pages
│   │   └── admin/        # Admin panel pages
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI components
│   │   └── layout/       # Layout components
│   ├── lib/              # Utility libraries
│   ├── models/           # MongoDB models
│   └── utils/            # Helper functions
├── public/               # Static assets
├── DEPLOYMENT.md         # Deployment instructions
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB running locally or a MongoDB Atlas account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/projectmanager.git
   cd projectmanager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Database Schema

- **User**: Authentication and profile information
- **Project**: Project details with start/end dates and team members
- **Task**: Tasks and subtasks with priorities and statuses
- **Settings**: User preferences and interface settings

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user info

### Projects
- `GET /api/projects` - Get all projects for the current user
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get a specific project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering options)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Admin
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Get all users with statistics
- `POST /api/admin/users` - Create a new user (admin only)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## License

This project is licensed under the MIT License.
