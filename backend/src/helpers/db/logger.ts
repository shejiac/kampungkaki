import chalk from "chalk"

type LogLevel = "success" | "warning" | "error" | "info" | "debug"

const LOG_LEVEL = process.env.LOG_LEVEL || "info"
const LEVELS: LogLevel[] = ["error", "warning", "info", "success", "debug"]

// Utility to check if a level should be logged
function shouldLog(level: LogLevel): boolean {
  if (LOG_LEVEL === "debug") return true
  if (LOG_LEVEL === "info") return level !== "debug"
  if (LOG_LEVEL === "warning") return level === "warning" || level === "error"
  if (LOG_LEVEL === "error") return level === "error"
  return true
}

const logger = {
  success: (msg: string) =>
    shouldLog("success") && console.log(chalk.green("✓ ") + msg),

  warning: (msg: string) =>
    shouldLog("warning") && console.log(chalk.yellow("⚠ ") + msg),

  error: (msg: string) =>
    shouldLog("error") && console.log(chalk.red("✗ ") + msg),

  info: (msg: string) =>
    shouldLog("info") && console.log(chalk.cyan("ℹ ") + msg),

  debug: (msg: string) =>
    shouldLog("debug") && console.log(chalk.gray("… " + msg)),

  divider: () =>
    console.log(chalk.gray("─".repeat(40))),

  log: (msg: string) => console.log(msg) // raw console.log passthrough
}

export default logger
