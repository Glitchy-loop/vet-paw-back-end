const express = require('express')
const fetch = require('node-fetch')
const mysql = require('mysql2/promise')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const {
  mysqlConfig,
  jwtSecret,
  mailServer,
  mailPassword
} = require('../../config')
const validation = require('../../middleware/validation')
const {
  registrationSchema,
  loginSchema,
  changePassSchema,
  resetPassSchema
} = require('../../middleware/schemas/userSchemas')
const passGenerator = require('generate-password')
const isLoggedIn = require('../../middleware/auth')

const router = express.Router()

// Get all user
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM users
    `)
    await connection.end()
    res.send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue...' })
  }
})

// Register user
router.post('/register', validation(registrationSchema), async (req, res) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 10)

    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
        INSERT INTO users (name, email, password)
        VALUES (${mysql.escape(req.body.name)}, ${mysql.escape(
      req.body.email
    )}, '${hash}')
      `)
    await connection.end()

    if (!data.insertId || data.affectedRows !== 1) {
      await connection.end()
      return res.status(500).send({ err: 'Server issue...' })
    }

    return res.send({
      msg: 'Successfully created account',
      accountId: data.insertId
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ err: 'Server issue...' })
  }
})

// Login user
router.post('/login', validation(loginSchema), async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
      SELECT id, name, email, password
      FROM users
      WHERE email = ${mysql.escape(req.body.email)}
      LIMIT 1
      `)
    await connection.end()

    if (data.length === 0) {
      await connection.end()
      return res.status(400).send({ msg: 'User not found.' })
    }

    if (!bcrypt.compareSync(req.body.password, data[0].password)) {
      await connection.end()
      return res.status(400).send({ msg: 'Incorrect password.' })
    }

    const token = jsonwebtoken.sign({ accountId: data[0].id }, jwtSecret)
    res.status(200).send({ msg: 'User successfully logged in', token, data })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ err: 'Server issue...' })
  }
})

// Change user password
router.post(
  '/changepass',
  isLoggedIn,
  validation(changePassSchema),
  async (req, res) => {
    try {
      const connection = await mysql.createConnection(mysqlConfig)
      const [data] = await connection.execute(`
    SELECT * FROM users
    WHERE email = ${mysql.escape(req.body.email)}
    LIMIT 1
    `)

      const checkHash = bcrypt.compareSync(req.body.oldpass, data[0].password)

      if (!checkHash) {
        await connection.end()
        return res.status(400).send({ err: 'Incorrect old password.' })
      }

      const newHashPassword = bcrypt.hashSync(req.body.newpass, 10)
      connection.execute(`
    UPDATE users 
    SET password = ${mysql.escape(newHashPassword)}
    WHERE email = ${mysql.escape(req.body.email)}
    `)
      await connection.end()

      return res.status(200).send({ msg: 'Successfully changed password.' })
    } catch (err) {
      console.log(err)
      return res.status(500).send({ err: 'Server issue...' })
    }
  }
)

// Reset user password
router.post('/resetpass', validation(resetPassSchema), async (req, res) => {
  try {
    let password = passGenerator.generate({
      length: 10,
      number: true
    })

    const hashedPass = bcrypt.hashSync(password, 10)
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    UPDATE users
    SET password = ${mysql.escape(hashedPass)}
    WHERE email = ${mysql.escape(req.body.email)}
    `)
    await connection.end()

    if (data.affectedRows !== 1) {
      await connection.end()
      return res.status(500).send({ err: 'Server issue...' })
    }

    const response = await fetch(mailServer, {
      method: 'POST',
      body: JSON.stringify({
        password: mailPassword,
        email: req.body.email,
        message: `Your new password is ${password}`
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const json = await response.json()
    console.log(json.info)

    return res
      .status(200)
      .send({ msg: `Your new password has been sent to ${req.body.email}` })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ err: 'Server issue...' })
  }
})

module.exports = router
