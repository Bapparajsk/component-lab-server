import express from "express";

export interface updateEnv {
    env: "password" | "displayName" | "gender" | "description" | "links" | "language";
    body: express.Request.body;
    id: string;
}
