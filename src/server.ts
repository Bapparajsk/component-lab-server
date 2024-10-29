import app from "./app";
import cluster from "cluster";
import os from "os";

const PORT: number = Number(process.env.PORT) || 3000;

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
