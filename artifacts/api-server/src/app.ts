import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { rbacMiddleware } from "./middleware/rbac";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", rbacMiddleware, router);

export default app;
