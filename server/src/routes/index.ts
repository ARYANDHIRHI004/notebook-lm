import { Application } from "express";
import { workSpaceRoute } from "./workspace.route.js";
import { sourceRoute } from "./source.route.js";
import { chatRoute } from "./chat.route.js";

export function registerRoute(app: Application){
    app.use("/api/v1/workspace", workSpaceRoute)
    app.use("/api/v1/source", sourceRoute)
    app.use("/api/v1/chat", chatRoute)
}