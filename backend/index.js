const dotenv = require("dotenv");
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ debug: true });
}
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");


const cors = require("cors");
const flash = require("connect-flash");
const passport = require("./config/passport");
const reminderScheduler = require("./jobs/reminderScheduler");

const app = express();
const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const isProd = process.env.NODE_ENV === "production";
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.CLIENT_URL, 
        "http://localhost:5173", 
        "http://localhost:3000"  
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProd,           
      sameSite: isProd ? "none" : "lax", 
      path: "/",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


const authRoutes = require("./routes/authRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const {requireLogin} = require("./middleware/authMiddleware");
const therapistRoutes = require("./routes/therapistRoutes");
const therapistAdminRoutes = require("./routes/therapistAdminRoutes");
app.use("/auth", authRoutes);
app.use("/api/chatbot", requireLogin, chatbotRoutes);
app.use("/api/dashboard", requireLogin, dashboardRoutes);
app.use("/api/reminders", requireLogin, reminderRoutes);
app.use("/api/therapists", requireLogin,therapistRoutes);
app.use("/api/admin/therapists", therapistAdminRoutes);
reminderScheduler.init();
app.get("/api/session-check", (req, res) => {
  const userId = req.session?.userId;
  const isAdmin = req.session?.isAdmin || false;

  if (!userId) {
    return res.json({ success: false, user: null });
  }

  const user = req.user || { _id: userId, isAdmin };
  res.json({
    success: true,
    user,
  });
});




app.get("/", (req, res) => {
  res.json({ message: "API is running", user: req.user || null });
});
app.use((req, res) => res.status(404).json({ error: "API route not found" }));
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});
console.log("===== ENVIRONMENT VARIABLES CHECK =====");
console.log("NODE_ENV:", process.env.NODE_ENV || "NOT SET");
console.log("PORT:", process.env.PORT || "NOT SET");
console.log("MONGO_URI:", process.env.MONGO_URI ? "LOADED ✅" : "MISSING ❌");
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "LOADED ✅" : "MISSING ❌");
console.log("CLIENT_URL:", process.env.CLIENT_URL ? "LOADED ✅" : "MISSING ❌");
console.log("GEMINI_API_KEYS:", process.env.GEMINI_API_KEYS ? "LOADED ✅" : "MISSING ❌");
console.log("========================================\n");
app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
