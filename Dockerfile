# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies (production only) ----
FROM base AS deps
COPY package*.json ./
# bcrypt requires native compilation tools
RUN apk add --no-cache python3 make g++ \
    && npm ci --omit=dev \
    && apk del python3 make g++

# ---- Development ----
FROM base AS development

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
# bcrypt requires native compilation tools
RUN apk add --no-cache python3 make g++ && npm install

COPY . .

# Change ownership of the app directory
RUN chown -R appuser:appgroup /app

USER appuser
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- Production ----
FROM base AS production

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create logs directory and change ownership of the app directory
RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser
EXPOSE 3000
CMD ["npm", "start"]
