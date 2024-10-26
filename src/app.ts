import 'dotenv/config';
import './config/db.config';
import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";

import {admin , auth, user}  from "./route";

const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/admin", admin);
app.use("/auth", auth);
app.use("/user", user);

app.listen(PORT, () => {
  console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});
