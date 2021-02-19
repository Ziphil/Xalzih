//

import dotenv from "dotenv";


dotenv.config({path: "./variable.env"});

export const VERSION = process.env["npm_package_version"] || "?";
export const PORT = process.env["PORT"] || 3000;
export const DISCORD_KEY = process.env["DISCORD_KEY"] || "dummy";