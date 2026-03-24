# Use official Node.js LTS alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy rest of the source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server (--host exposes to Docker network)
CMD ["npm", "run", "dev"]
