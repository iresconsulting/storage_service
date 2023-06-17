import fs from "node:fs/promises";
import Logger from "../utils/logger";

export default async function clearPublicDir() {
  let dir = `${process.cwd()}/src/public/`
  try {
    for (const file of await fs.readdir(dir)) {
      await fs.unlink(`${dir}${file}`);
    }
  } catch (e) {
    Logger.generateTimeLog({ label: Logger.Labels.JOB, message: String(e) })
  }

 dir = `${process.cwd()}/src/uploads/`
  try {
    for (const file of await fs.readdir(dir)) {
      await fs.unlink(`${dir}${file}`);
    }
  } catch (e) {
    Logger.generateTimeLog({ label: Logger.Labels.JOB, message: String(e) })
  }
}
