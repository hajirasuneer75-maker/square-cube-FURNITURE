import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
    path.resolve(__dirname, "../../../../.env"), // monorepo root
    path.resolve(__dirname, "../../.env"), // apps/api/.env
    path.resolve(__dirname, "../../../../apps/web/.env.local"),
];
for (const file of candidates) {
    if (!fs.existsSync(file))
        continue;
    const content = fs.readFileSync(file, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#"))
            continue;
        const eqIdx = line.indexOf("=");
        if (eqIdx <= 0)
            continue;
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        if (process.env[key] === undefined) {
            process.env[key] = val;
        }
    }
}
//# sourceMappingURL=env.js.map