"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const client = new ioredis_1.default({
    port: Number.parseInt(process.env.REDIS_PORT || "6379"), // Redis port
    host: process.env.REDIS_HOST || "127.0.0.1", // Redis host
});
client.on("error", () => {
    console.log('Redis connection failed');
});
client.on("connect", () => {
    console.log('Redis connection connected');
});
exports.default = client;
