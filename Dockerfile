# =====================
# Frontend Build
# =====================
FROM node:22 AS frontend-builder

WORKDIR /app/frontend

ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_STREAM_API_KEY

ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_STREAM_API_KEY=$VITE_STREAM_API_KEY

COPY frontend/package*.json ./

RUN npm install

COPY frontend .

RUN npm run build


# =====================
# Backend
# =====================
FROM node:22

WORKDIR /app

COPY backend/package*.json ./backend/

WORKDIR /app/backend

RUN npm install

COPY backend .

WORKDIR /app

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 10000

CMD ["node", "backend/src/server.js"]