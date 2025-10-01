# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Expose port (default Vite preview port)
EXPOSE 4173

# Start the app using Vite preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
