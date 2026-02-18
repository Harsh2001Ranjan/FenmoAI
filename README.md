# FenmoAI

Full-stack MERN application built with Vite + React (client) and Express (server).

## Project Structure

```
FenmoAI/
├── client/          # React frontend (Vite)
├── server/          # Express backend API
├── render.yaml      # Render deployment blueprint
└── package.json     # Root scripts
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
npm run install-all
```

### Development

Start the server:

```bash
npm run dev:server
```

Start the client (in a separate terminal):

```bash
npm run dev:client
```

### API Endpoints

| Method | Endpoint       | Description          |
| ------ | -------------- | -------------------- |
| GET    | `/api/health`  | System health status |

## Deployment (Render)

This project includes a `render.yaml` blueprint. Connect the repo to [Render](https://render.com) and it will auto-detect the services.

## Tech Stack

- **Frontend:** React, Vite, JavaScript
- **Backend:** Node.js, Express
- **Deployment:** Render
