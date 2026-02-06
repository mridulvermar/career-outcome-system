# Cloud Deployment Guide

Follow these steps to deploy your application to the cloud.

## 1. Frontend (Vercel)

1.  **Push to GitHub**: Ensure your code is pushed to your GitHub repository.
2.  **Login to Vercel**: Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3.  **Add New Project**:
    *   Import from GitHub.
    *   Select your repository.
4.  **Configure Project**:
    *   **Root Directory**: Click "Edit" and select `frontend`.
    *   **Framework Preset**: Select "Create React App".
    *   **Environment Variables**:
        *   `REACT_APP_API_URL`: `https://your-backend-app-name.onrender.com/api` (You will update this AFTER deploying the backend).
5.  **Deploy**: Click "Deploy".

## 2. Backend & ML Service (Render)

1.  **Login to Render**: Go to [render.com](https://render.com) and sign in with GitHub.
2.  **Create Backend Service**:
    *   Click "New +" -> "Web Service".
    *   Connect your repository.
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Environment Variables**:
        *   `NODE_ENV`: `production`
        *   `MONGODB_URI`: (Your MongoDB Atlas connection string)
        *   `JWT_SECRET`: (A random secret string)
        *   `JWT_EXPIRE`: `7d`
        *   `CORS_ORIGIN`: (Your Vercel Frontend URL, e.g., `https://your-app.vercel.app`)
        *   `ML_SERVICE_URL`: (Your ML Service URL, set this AFTER deploying ML service)

3.  **Create ML Service**:
    *   Click "New +" -> "Web Service".
    *   Connect your repository.
    *   **Root Directory**: `ml-service`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn app:app` (Render reads the Procfile automatically if present, but this is the manual command).
    *   **Environment Variables**: 
        *   `PYTHON_VERSION`: `3.11.0` (Optional)

## 3. Final Wiring

1.  **Update Backend**: Go to your Backend service dashboard in Render -> Environment -> Add/Edit `ML_SERVICE_URL` with the URL of your deployed ML Service.
2.  **Update Frontend**: Go to your Frontend project in Vercel -> Settings -> Environment Variables -> Edit `REACT_APP_API_URL` with the URL of your deployed Backend Service. Redeploy the frontend for changes to take effect.

## Troubleshooting

- **CORS Issues**: Ensure the backend `CORS_ORIGIN` matches your Vercel URL exactly (no trailing slash).
- **ML Service**: If it fails to build, check that `requirements.txt` processes successfully locally.
