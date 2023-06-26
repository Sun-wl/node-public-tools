const { createLogger, transports, format } = require('winston')
const { combine, errors, timestamp, printf, splat } = format;
const moment = require('moment-timezone')

const logConfig = {
  Console: {
    enabled: true,
    level: 'debug',
    handleExceptions: true,
    json: true
  },
  format: {
    timezone: 'Asia/Shanghai',
    timeFormat: 'YYYY-MM-DD HH:mm:ss.Z'
  }
}

const addMDCFormat = format(info => {
  if (info.message instanceof Error) {
    info.message = Object.assign({
      message: info.message.message
    }, info.message)
  }
  if (info instanceof Error) {
    return Object.assign({
      message: info.message
    }, info)
  }
  info.trace_id = info?.trace_id || ''
  return info
})

function timestampFormat() {
  const format = logConfig.format || {}
  const timezone = format.timezone || ''
  const timeFormat = format.timeFormat || 'YYYY-MM-DD HH:mm:ss.Z'
  return moment().tz(timezone).format(timeFormat)
}

const isDevelopment = process.env.NODE_ENV === 'development'
const defaultFormats = [
  addMDCFormat(),
  errors({ stack: true }),
  timestamp({
    format: timestampFormat
  }),
  splat()
]

const printFn = ({ timestamp, trace_id, level, message, stack, ...rest }) => {
  return `[${level}]: ${timestamp}${trace_id ? ` - [traceId:${trace_id}]` : ''}: ${message} ${!!Object.keys(rest).length ? JSON.stringify(rest) : ''} ${stack ? '\n' + stack : ''}${'\n'}`
}

function loggerFactory(opts) {
  const { print } = opts || {}
  const formats = [...defaultFormats]
  if (isDevelopment) {
    formats.push(format.colorize(), printf(print || printFn))
  } else {
    formats.push(format.json())
  }
  return createLogger({
    transports: [
      new transports.Console({
        ...logConfig.Console,
        format: combine(...formats),
        handleExceptions: true
      })
    ],
    format: combine(...formats),
    exitOnError: false,
    handleExceptions: true
  })
}
const logger = loggerFactory()
logger.loggerFactory = loggerFactory
module.exports = logger