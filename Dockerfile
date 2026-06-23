# =========================
# FRONTEND BUILD
# =========================
FROM node:22 AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend .

RUN npm run build


# =========================
# BACKEND
# =========================
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