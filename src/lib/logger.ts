import * as winston from "winston";

const { json, timestamp, colorize, combine, simple } = winston.format;

/**
 * Level Order from top/high to bottom/low:
 * emerg, alert, crit, error, warning, notice, info, debug, silly
 *
 */

export const logger = winston.createLogger({
  level: "info", // and higher
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: `logs/combined.log`,
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== "production" || process.env.DEBUG_LOG === "1") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), simple()),
      level: "silly",
    })
  );
}
