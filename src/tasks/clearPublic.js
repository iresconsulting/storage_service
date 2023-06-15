import fs from "node:fs/promises";
import Logger from "../utils/logger";

export default async function clearPublicDir() {
  const dir = `${process.cwd()}/src/public/`
  try {
    for (const file of await fs.readdir(dir)) {
      await fs.unlink(`${dir}${file}`);
    }
  } catch (e) {
    Logger.generateTimeLog({ label: Logger.Labels.JOB, message: String(e) })
  }
}
