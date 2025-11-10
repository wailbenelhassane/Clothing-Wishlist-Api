# Single Docker image with all clothing handlers + shared logic
FROM public.ecr.aws/lambda/nodejs:20

# AWS Lambda expects /var/task as working directory
WORKDIR /var/task

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy full source (Lambda handlers + shared code)
COPY src/ ./src/

# Lambda entrypoint (dispatcher)
# The runtime will invoke: exports.handler from src/lambdaDispatcher.js
CMD ["src/lambdaDispatcher.handler"]
