
# React Reddit Clone - Frontend

This is the frontend for a full-stack Reddit clone application, built with modern web technologies.

## Features

- **Modern Tech Stack**: React 18, TypeScript, and Tailwind CSS.
- **Component-Based**: Structured with reusable and well-organized components.
- **Routing**: Client-side routing with `react-router-dom`.
- **Responsive Design**: Mobile-first design that works on all screen sizes.
- **Mock API**: Includes a mock API service to simulate backend interactions, making the frontend fully runnable standalone.
- **Dockerized**: Comes with a `Dockerfile` for easy containerization and deployment.

## Project Structure

```
/
├── Dockerfile
├── index.html
├── metadata.json
├── package.json
├── README.md
├── tsconfig.json
├── App.tsx
├── index.tsx
├── types.ts
├── components/
│   ├── Comment.tsx
│   ├── Header.tsx
│   ├── ...
│   └── icons/
├── pages/
│   ├── HomePage.tsx
│   ├── PostDetailPage.tsx
│   └── NotFoundPage.tsx
└── services/
    └── api.ts
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation & Running Locally

1.  **Clone the repository** (or set up the files provided).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    This project is set up to work with a development server like Vite. To run it, you would typically use:
    ```bash
    npm run dev 
    ```
    *(Note: A `package.json` with dev dependencies like Vite and React scripts would be required for this step).*

### Running with Docker

1.  **Build the Docker image**:
    ```bash
    docker build -t reddit-clone-frontend .
    ```
2.  **Run the Docker container**:
    ```bash
    docker run -p 8080:80 reddit-clone-frontend
    ```
    The application will be available at `http://localhost:8080`.

## Full-Stack Architecture

This frontend is designed to work with a separate backend service.

-   **Backend**: A Node.js server using a framework like Express.js.
-   **Database**: MongoDB for storing posts, users, comments, and votes.
-   **API**: The backend should expose a RESTful or GraphQL API that the frontend `services/api.ts` can consume. The mock API currently simulates these endpoints:
    -   `GET /api/posts`
    -   `GET /api/posts/:postId`
    -   `GET /api/posts/:postId/comments`
-   **Orchestration**: A `docker-compose.yml` file in the project root would manage the frontend, backend, and database services together.
-   **Automation**: A `Makefile` would provide simple commands (`make up`, `make down`, `make build`) to manage the entire stack.

