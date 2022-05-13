require('dotenv').config()

module.exports = {
  mysqlConfig: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
  },
  serverPort: process.env.SERVER_PORT || 8080,
  jwtSecret: process.env.JWT_SECRET,
  mailServer: process.env.MAIL_SERVER,
  mailPassword: process.env.MAIL_PASSWORD,

  strapiUser: process.env.STRAPI_LOGIN,
  strapiPass: process.env.STRAPI_PASSWORD,
  strapiServer: process.env.STRAPI_SERVER
}
