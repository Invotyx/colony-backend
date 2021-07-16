/* eslint-disable @typescript-eslint/no-var-requires */
const winston = require('winston');
const winstonDailyRotateFile = require('winston-daily-rotate-file');

export const logger = new winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile({
      name: 'access-file',
      level: 'info',
      filename: './logs/access.log',
      json: true,
      datePattern: 'DD-MM-YYYY',
      prepend: true,
      maxFiles: 10,
    }),
    new winston.transports.DailyRotateFile({
      name: 'error-file',
      level: 'error',
      filename: './logs/error.log',
      json: true,
      datePattern: 'DD-MM-YYYY',
      prepend: true,
      maxFiles: 10,
    }),
  ],
});
