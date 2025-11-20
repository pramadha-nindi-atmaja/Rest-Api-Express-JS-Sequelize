import express from "express";
import logger, { logHttpRequest } from "./winston.js";
import route from "../routes/index.js";
const appMiddleware = express();

appMiddleware.use(express.json());
appMiddleware.use(logHttpRequest);
appMiddleware.use(route);

export default appMiddleware;
