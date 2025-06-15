# 1. Base image
FROM node:20-alpine AS builder

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy source code
COPY . .

# 5. Build TypeScript
RUN npm run build

# 6. Start from a clean image for production
FROM node:20-alpine

WORKDIR /app

# 7. Copy only necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --omit=dev

# 8. Expose port
EXPOSE 3000

# 9. Start app
CMD ["node", "dist/src/index.js"]
