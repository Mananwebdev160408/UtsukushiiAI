FROM node:22-alpine

# Set working directory
WORKDIR /app

# Ensure we have python/build tools for child processes like yt-dlp if needed
RUN apk add --no-cache python3 ffmpeg curl
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Expose API port
EXPOSE 4000

# Start server
CMD ["npm", "start"]
