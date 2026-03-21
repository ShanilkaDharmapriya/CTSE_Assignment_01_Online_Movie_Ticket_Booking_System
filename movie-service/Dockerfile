# 1. Use lightweight Node.js image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy dependency files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy all source code
COPY . .

# 6. Expose the service port
EXPOSE 4001

# 7. Start the application
CMD ["npm", "start"]
