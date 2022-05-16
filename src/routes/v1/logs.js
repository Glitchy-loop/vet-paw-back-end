const express = require('express')
const mysql = require('mysql2/promise')
const { mysqlConfig } = require('../../config')
const isLoggedIn = require('../../middleware/auth')
const {
  logByIdSchema,
  addLogSchema
} = require('../../middleware/schemas/logSchema')
const validation = require('../../middleware/validation')
const router = express.Router()

// Get all logs
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM logs
    `)
    await connection.end()

    return res.send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue...' })
  }
})

// Get logs by pet ID
router.get(
  '/log/:id',
  isLoggedIn,
  validation(logByIdSchema),
  async (req, res) => {
    try {
      const connection = await mysql.createConnection(mysqlConfig)
      const [data] = await connection.execute(`
      SELECT *
      FROM pets
      INNER JOIN logs
      ON ${mysql.escape(req.params.id)} = pet_id
      WHERE pets.id = ${mysql.escape(req.params.id)}
      `)
      await connection.end()

      if (data.length < 1) {
        await connection.end()
        return res.send({ err: 'No logs found.' })
      }

      return res.status(200).send(data)
    } catch (err) {
      return res.status(500).send({ err: 'Server issue...' })
    }
  }
)

// Add log
router.post(
  '/add_log',
  isLoggedIn,
  validation(addLogSchema),
  async (req, res) => {
    try {
      const connection = await mysql.createConnection(mysqlConfig)
      const [data] = await connection.execute(`
    INSERT INTO logs (pet_id, description, status)
    VALUES (${mysql.escape(req.body.pet_id)},${mysql.escape(
        req.body.description
      )}, ${mysql.escape(req.body.status)} )
    `)
      await connection.end()

      if (!data.insertId || data.affectedRows !== 1) {
        await connection.end()
        return res.status(500).send({ err: 'Server issue...' })
      }

      return res.status(200).send({ msg: 'Successfully added a log.' })
    } catch (err) {
      return res.status(500).send({ err: 'Server issue...' })
    }
  }
)

module.exports = router
