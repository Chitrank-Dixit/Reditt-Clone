# React Reddit Clone - Frontend

This is the frontend for a full-stack Reddit clone application, built with modern web technologies.

## Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, and Tailwind CSS.
- **Component-Based**: Structured with reusable and well-organized components.
- **Routing**: Client-side routing with `react-router-dom`.
- **Responsive Design**: Mobile-first design that works on all screen sizes.
- **Live API**: Connects to a real backend service for data fetching and persistence.
- **Dockerized**: Comes with a `Dockerfile` for easy containerization and deployment.

## Project Structure

```
/frontend
├── Dockerfile
├── nginx.conf
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── App.tsx
    ├── index.tsx
    ├── types.ts
    ├── components/
    ├── pages/
    └── services/
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation & Running Locally (Frontend Only)

1.  **Navigate to the `frontend` directory**.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev 
    ```
    The application will be available at `http://localhost:3000` (or another port if 3000 is busy). The Vite dev server will proxy API requests to the backend running on port 5000.

### Running the Full Stack with Docker

For the best experience, run this frontend as part of the full application stack using Docker Compose.

1.  **Navigate to the root directory** of the entire project (the one containing `docker-compose.yml`).
2.  **Run the application**:
    ```bash
    make up
    ```
    The frontend will be available at `http://localhost:3000`.
