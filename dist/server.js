"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const PORT = Number(process.env.PORT) || 3000;
if (cluster_1.default.isPrimary) { // this is the primary instance of the cluster
    console.log(`Primary ${process.pid} is running`);
    for (let i = 0; i < os_1.default.cpus().length; i++) {
        cluster_1.default.fork();
    }
}
else {
    app_1.default.listen(PORT, () => {
        console.log(`Server is running on port http://127.0.0.1:${PORT}`);
    });
}
