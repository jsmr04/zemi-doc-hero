import winston from 'winston'
import expressWinston from 'express-winston'

const loggerConfig = {
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.label({
      label: `INFO `,
    }),
    winston.format.timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    winston.format.printf(
      (info) => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`
    )
  ),
}

const expressConfig = {
  ...loggerConfig,
  meta: false, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function () {
    return false;
  }, // optional: allows to skip some log messages based on request and/or response
}

const errorLoggerConfig = {
  ...loggerConfig,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.label({
      label: `ERROR: `,
    }),
    winston.format.timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    winston.format.printf(
      (info) => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}: ${ JSON.stringify(info.meta)}`
    )
  )
}

//Logger instance
export const logger = winston.createLogger(loggerConfig) 

//Global loggers
export const expressLogger = expressWinston.logger(expressConfig);
export const expressErrorLogger = expressWinston.errorLogger(errorLoggerConfig);
