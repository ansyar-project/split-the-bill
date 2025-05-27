# Use official Node.js LTS image
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

ARG DATABASE_URL NEXTAUTH_SECRET NEXTAUTH_URL NEXT_PUBLIC_BASE_URL

ENV DATABASE_URL=${DATABASE_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
  elif [ -f yarn.lock ]; then yarn install; \
  else npm install; fi

# Copy the rest of the app
COPY . .

RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files for production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma

# If you use Prisma, generate client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]