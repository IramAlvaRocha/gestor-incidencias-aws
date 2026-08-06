import 'dotenv/config';
import ServerlessHttp from "serverless-http";
import { buildApp } from "./buildApp.js";


const app = buildApp();
export const handler = ServerlessHttp(app);
