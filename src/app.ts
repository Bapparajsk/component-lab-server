import 'dotenv/config'
import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";


const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(morgan("dev"));

app.listen(PORT, () => {
  console.log(`Server is running on port http://127.0.0.1${PORT}`);
});
