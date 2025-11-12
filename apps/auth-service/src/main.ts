import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "@eshop/middlewares";
import { mongoConnect, setupSwagger } from "@eshop/utils";
import authRoutes from "./routes/auth.route";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Smash my face if I sleep" });
});

// Swagger setup
setupSwagger(app, "auth-service");

// Routes
app.use("/api", authRoutes);

app.use(errorMiddleware);

const server = app.listen(port, host, async () => {

  await mongoConnect();

  console.log(`[ ready ] Auth Service is running in http://${host}:${port}`);
  console.log(`Swagger docs available at http://${host}:${port}/docs`);
});

server.on("error", (err) => {
  console.log("Server Error:", err);
});
