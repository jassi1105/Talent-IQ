import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();
console.log("NODE_ENV =", ENV.NODE_ENV);

console.log("PORT =", ENV.PORT);

// ES Module __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// CORS only needed in development
if (ENV.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: ENV.CLIENT_URL,
      credentials: true,
    })
  );
}

app.use(clerkMiddleware());

// Routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

// Serve React Frontend in Production
if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../frontend/dist");

  console.log("Frontend Path =", frontendPath);

  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}
// Start Server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || ENV.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
    });
  } catch (error) {
    console.error("💥 Error starting server:", error);
    process.exit(1);
  }
};

startServer();