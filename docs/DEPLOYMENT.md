# UtsukushiiAI Deployment Guide

This document provides comprehensive deployment instructions for the UtsukushiiAI platform.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Development](#local-development)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Hardware Requirements

| Component | Minimum | Recommended              |
| --------- | ------- | ------------------------ |
| CPU       | 4 cores | 8+ cores                 |
| RAM       | 8 GB    | 16 GB                    |
| GPU       | None    | NVIDIA GPU with 8GB VRAM |
| Storage   | 50 GB   | 100+ GB SSD              |

### Software Requirements

| Software       | Version  |
| -------------- | -------- |
| Node.js        | 20.x LTS |
| Python         | 3.11+    |
| Docker         | 24.x     |
| Docker Compose | 2.x      |
| MongoDB        | 6.x      |
| Redis          | 7.x      |

---

## Environment Configuration

### Required Environment Variables

#### API Service (.env)

```bash
# Server
NODE_ENV=production
PORT=4000

# Database
MONGODB_URI=mongodb://mongodb:27017/utsukushii
MONGODB_USER=admin
MONGODB_PASSWORD=changeme

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret

STORAGE_PATH=./uploads
STORAGE_BUCKET=utsukushii-prod

# Frontend URL
FRONTEND_URL=https://app.utsukushii.ai

# Third-Party API Keys (Required)
YOUTUBE_API_KEY=AIza...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

#### Worker Service (.env)

```bash
# Python
PYTHONUNBUFFERED=1

# Database
MONGODB_URI=mongodb://mongodb:27017/utsukushii

# Redis
REDIS_URL=redis://redis:6379

# Model Paths
MODEL_PATH=/app/models
YOLO_MODEL_PATH=/app/models/yolov12-manga.pt
SAM_MODEL_PATH=/app/models/sam2.pt
MIDAS_MODEL_PATH=/app/models/midas-v3.pt

# GPU
CUDA_VISIBLE_DEVICES=0
```

---

---

## Local Development

### Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/utsukushii/utsukushii-ai.git
cd utsukushii-ai

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup

```bash
# Frontend
cd apps/web
npm install
npm run dev

# API
cd apps/api
npm install
npm run dev

# Worker
cd apps/worker
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

---

## Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production Build

```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Run production containers
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Compose Production File

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    restart: always
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_PASSWORD}
    networks:
      - utsukushii-network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - utsukushii-network

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    restart: always
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/utsukushii
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis
    networks:
      - utsukushii-network

  worker:
    build:
      context: ./apps/worker
      dockerfile: Dockerfile
    restart: always
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/utsukushii
      - REDIS_URL=redis://redis:6379
    volumes:
      - model_cache:/app/models
    deploy:
      replicas: 2
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    depends_on:
      - mongodb
      - redis
    networks:
      - utsukushii-network
    deploy:
      replicas: 2

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.utsukushii.ai
    networks:
      - utsukushii-network

volumes:
  mongodb_data:
  redis_data:
  model_cache:

networks:
  utsukushii-network:
    driver: bridge
```

---

## MongoDB (Local)

```bash
# Connection string format:
mongodb://<username>:<password>@mongodb:27017/utsukushii
```

### Local Storage Setup

Create the necessary directories for storage:

```bash
mkdir -p ./uploads/raw
mkdir -p ./uploads/exports
chmod -R 775 ./uploads
```

---

## Monitoring

Proper monitoring ensures the health of your local services.

### Health Checks

```bash
# API Health
curl http://localhost:4000/v1/health

# Worker Health
curl http://localhost:8000/health
```

### Logging

For local development and self-hosting, logs are managed via Docker:

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f worker
```

---

## Troubleshooting

### Common Issues

#### Database Connection Issues

Verify your MongoDB and Redis instances are running:

```bash
docker-compose ps
```

If using a remote MongoDB URI, ensure it is accessible from your network and the credentials provided in the `.env` file are correct.

#### GPU Not Available

If the ML worker is not utilizing the GPU:

1. Ensure NVIDIA Drivers are installed on the host.
2. Verify `nvidia-container-toolkit` is installed.
3. Check worker logs for CUDA initialization errors.

#### Port Conflicts

If ports 3000, 4000, or 8000 are already in use, you can modify the `PORT` or `NEXT_PUBLIC_API_URL` in your `.env` files.

---

## Security

### Local Security

- **Authentication**: Ensure strong passwords for your local MongoDB instance.
- **JWT Secrets**: Use a unique, long string for `JWT_SECRET` in `.env`.
- **API Keys**: Keys must be provided in the `.env` file. Do not commit these keys to version control.

### API Access

By default, the API binds to `localhost`. If you need to access it from other machines on your local network, update the `PORT` and `HOST` settings, but ensure your firewall is configured correctly.

---

<p align="center">
  End of Deployment Guide
</p>
