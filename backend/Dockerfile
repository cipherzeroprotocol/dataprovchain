# Use Node.js LTS as base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Install dependencies for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the code
COPY . .

# Create upload and temp directories
RUN mkdir -p uploads
RUN mkdir -p temp
RUN mkdir -p logs

# Create a non-root user and switch to it
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001 -G nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose the app port
EXPOSE 3001

# Start the app
CMD ["node", "src/server.js"]
