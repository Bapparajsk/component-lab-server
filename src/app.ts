import 'dotenv/config';
import './config/db.config';
import "./lib/bullmqWorker";
import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import {admin , auth, user, post}  from "./route";
import { sendOtpQueue } from "./lib/bullmqProducer";


const app: Express = express();
const PORT: number = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/admin", admin);
app.use("/auth", auth);
app.use("/user", user);
app.use("/post", post);

app.get("/", (req, res) => {
    sendOtpQueue({ email: "bapparajsk97@gmail.com", otp: "1234" });
    res.send("Hello World!");
});

/*
if (cluster.isPrimary) {  // this is the primary instance of the cluster
    console.log(`Primary ${process.pid} is running`);
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
} else {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://127.0.0.1:${PORT}`);
  });
}
*/

app.listen(PORT, () => {
    console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});

export default app;
