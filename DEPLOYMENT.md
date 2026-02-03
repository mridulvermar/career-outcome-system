# Deployment Guide

This guide covers deploying the Career Outcome Analysis System to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup (MongoDB Atlas)](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [ML Service Deployment](#ml-service-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Docker Deployment](#docker-deployment)
8. [Post-Deployment](#post-deployment)

---

## Prerequisites

- MongoDB Atlas account (or self-hosted MongoDB)
- Hosting platform account (Heroku, AWS, DigitalOcean, etc.)
- Domain name (optional)
- SSL certificate (recommended)

---

## Environment Setup

### Production Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/career_db
JWT_SECRET=your_very_secure_random_secret_key_here
JWT_EXPIRE=7d
ML_SERVICE_URL=https://your-ml-service.com
CORS_ORIGIN=https://your-frontend.com
```

#### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-backend.com/api
```

---

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Click "Build a Cluster"
   - Choose free tier (M0)
   - Select region closest to your backend

3. **Configure Access**
   - Database Access → Add Database User
   - Network Access → Add IP Address (0.0.0.0/0 for all, or specific IPs)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` and `<dbname>`

5. **Update Backend .env**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/career_db?retryWrites=true&w=majority
   ```

### Option 2: Self-Hosted MongoDB

If running your own MongoDB server:
```env
MONGODB_URI=mongodb://your-server-ip:27017/career_db
```

---

## Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd backend
   heroku create career-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="your_mongodb_uri"
   heroku config:set JWT_SECRET="your_secret"
   heroku config:set ML_SERVICE_URL="https://your-ml-service.com"
   heroku config:set CORS_ORIGIN="https://your-frontend.com"
   ```

5. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

6. **Verify Deployment**
   ```bash
   heroku logs --tail
   heroku open
   ```

### Option 2: AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu 22.04 LTS
   - t2.micro for free tier
   - Configure security group (ports 22, 5000)

2. **Connect and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone your-repo-url
   cd career-outcome-system/backend
   
   # Install dependencies
   npm install --production
   
   # Create .env file
   nano .env
   # (paste your production environment variables)
   
   # Start with PM2
   pm2 start server.js --name career-backend
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx (Optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/career-backend
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/career-backend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Option 3: DigitalOcean App Platform

1. **Create Account** at digitalocean.com

2. **Create New App**
   - Choose GitHub/GitLab repository
   - Select backend folder
   - Choose Basic plan ($5/month)

3. **Configure App**
   - Environment: Node.js
   - Build Command: `npm install`
   - Run Command: `node server.js`

4. **Add Environment Variables**
   - Add all production env vars in settings

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

---

## ML Service Deployment

### Option 1: Heroku

```bash
cd ml-service

# Create Heroku app
heroku create career-ml-service

# Set buildpack for Python
heroku buildpacks:set heroku/python

# Deploy
git init
git add .
git commit -m "ML service"
git push heroku main

# Scale dyno
heroku ps:scale web=1
```

### Option 2: AWS Lambda + API Gateway

1. **Package ML Service**
   ```bash
   cd ml-service
   pip install -t package -r requirements.txt
   cd package
   zip -r ../deployment-package.zip .
   cd ..
   zip -g deployment-package.zip app.py train_model.py
   ```

2. **Create Lambda Function**
   - Runtime: Python 3.11
   - Upload deployment-package.zip
   - Set timeout to 30 seconds
   - Set memory to 1024 MB

3. **Create API Gateway**
   - REST API
   - Create resources and methods
   - Deploy to stage

### Option 3: Google Cloud Run

```bash
# Build and push container
gcloud builds submit --tag gcr.io/PROJECT-ID/ml-service

# Deploy to Cloud Run
gcloud run deploy ml-service \
  --image gcr.io/PROJECT-ID/ml-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Settings → Environment Variables
   - Add `REACT_APP_API_URL`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=build
   ```

4. **Configure Environment**
   - Site settings → Environment
   - Add `REACT_APP_API_URL`

### Option 3: AWS S3 + CloudFront

1. **Build Application**
   ```bash
   cd frontend
   REACT_APP_API_URL=https://your-backend.com/api npm run build
   ```

2. **Create S3 Bucket**
   - Enable static website hosting
   - Set bucket policy for public read

3. **Upload Files**
   ```bash
   aws s3 sync build/ s3://your-bucket-name --delete
   ```

4. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Default root object: index.html
   - Custom error response: 403 → /index.html (for React Router)

---

## Docker Deployment

### Using Docker Compose

1. **Clone Repository**
   ```bash
   git clone your-repo-url
   cd career-outcome-system
   ```

2. **Configure Environment**
   - Update docker-compose.yml with production URLs
   - Create .env files for each service

3. **Build and Run**
   ```bash
   docker-compose up -d --build
   ```

4. **Verify**
   ```bash
   docker-compose ps
   docker-compose logs
   ```

### Docker Swarm (for scaling)

```bash
docker swarm init
docker stack deploy -c docker-compose.yml career-stack
docker service ls
```

---

## Post-Deployment

### 1. SSL Certificate (HTTPS)

#### Using Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Using Cloudflare
- Add your domain to Cloudflare
- Set DNS records
- Enable "Full" SSL mode

### 2. Domain Configuration

Point your domain to:
- Backend: api.yourdomain.com
- Frontend: yourdomain.com or www.yourdomain.com

### 3. Monitoring

#### Backend Monitoring
```bash
# Using PM2
pm2 monit

# Using Heroku
heroku logs --tail --app career-backend
```

#### Application Performance Monitoring
- Set up New Relic or Datadog
- Configure error tracking (Sentry)

### 4. Backups

#### MongoDB Atlas
- Enable automated backups in Atlas dashboard
- Schedule: Daily backups with 7-day retention

#### Manual Backup
```bash
mongodump --uri="your-mongodb-uri" --out=backup/
```

### 5. Security Checklist

- ✅ All environment variables secured
- ✅ HTTPS enabled
- ✅ CORS properly configured
- ✅ Rate limiting active
- ✅ MongoDB authentication enabled
- ✅ Security headers configured (Helmet.js)
- ✅ No sensitive data in logs
- ✅ Regular security updates

### 6. Performance Optimization

#### Backend
- Enable gzip compression
- Implement caching (Redis)
- Use CDN for static assets
- Optimize database queries

#### Frontend
- Enable code splitting
- Lazy load components
- Optimize images
- Use CDN for assets

### 7. Scaling

#### Horizontal Scaling
```bash
# Heroku
heroku ps:scale web=3 --app career-backend

# Docker Swarm
docker service scale career-stack_backend=3
```

#### Database Scaling
- MongoDB Atlas: Upgrade to M10+ for auto-scaling
- Add read replicas for read-heavy workloads

---

## Maintenance

### Regular Tasks

1. **Weekly**
   - Review logs for errors
   - Check application performance
   - Monitor database size

2. **Monthly**
   - Update dependencies
   - Review and rotate secrets
   - Analyze usage patterns

3. **Quarterly**
   - Security audit
   - Performance testing
   - Backup restoration test

### Update Procedures

```bash
# Backend update
cd backend
git pull
npm install
pm2 restart career-backend

# Frontend update
cd frontend
git pull
npm install
npm run build
# Re-deploy to hosting platform
```

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify CORS_ORIGIN in backend .env
   - Check that frontend URL matches exactly

2. **Database Connection Failed**
   - Verify MongoDB URI
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **ML Service Timeout**
   - Increase timeout in backend (axios config)
   - Check ML service logs
   - Verify model files are loaded

4. **502 Bad Gateway**
   - Check backend is running
   - Verify proxy configuration
   - Check firewall rules

---

## Support

For deployment issues:
- Check logs: `heroku logs --tail` or `pm2 logs`
- Review documentation: README.md
- Contact support: support@careeranalysis.com

---

## Cost Estimation

### Free Tier Option
- MongoDB Atlas: Free (M0)
- Heroku: Free dyno (backend + ML service)
- Vercel: Free (frontend)
- **Total: $0/month**

### Production Option
- MongoDB Atlas: $25/month (M10)
- DigitalOcean: $12/month (backend + ML)
- Vercel Pro: $20/month (frontend)
- **Total: ~$57/month**

### Enterprise Option
- MongoDB Atlas: $100+/month
- AWS EC2: $50+/month
- CloudFront + S3: $20+/month
- Load Balancer: $20/month
- **Total: $190+/month**
