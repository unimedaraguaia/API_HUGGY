const pino = require("pino") (
    {
        transport: {
           target: 'pino-pretty',
           options: {
             colorize: true,
             translateTime: 'HH:MM:ss',
             ignore: 'pid, hostname'
           } 
        }
    }
)
module.exports = pino