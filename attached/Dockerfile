FROM node:20-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files and install dependencies
COPY package*.json ./
RUN npm i

# Copy application code
COPY --chown=appuser:appgroup . .

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose API port
EXPOSE 8080

# Switch to non-root user
USER appuser

# Default command
CMD ["node", "src/app.js"]
