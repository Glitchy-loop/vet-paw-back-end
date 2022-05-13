const express = require('express')
const mysql = require('mysql2/promise')
const { mysqlConfig } = require('../../config')
const {
  addPrescriptionSchema,
  prescriptionsByIdSchema
} = require('../../middleware/prescriptionSchema')
const isLoggedIn = require('../../middleware/auth')
const validation = require('../../middleware/validation')
const router = express.Router()

// Create table
// router.get('/table', async (req, res) => {
//   const connection = await mysql.createConnection(mysqlConfig)
//   const data = await connection.execute(`
//   CREATE TABLE prescriptions (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   medication_id INT NOT NULL,
//   pet_id INT NOT NULL,
//   comment varchar(255) NOT NULL,
//   timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
//   )
//   `)
//   return res.send(data)
// })

// Get all logs
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM prescriptions
    `)
    return res.send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue...' })
  }
})

// Get prescriptions by pet ID
router.get(
  '/prescription/:id',
  isLoggedIn,
  validation(prescriptionsByIdSchema),
  async (req, res) => {
    try {
      const connection = await mysql.createConnection(mysqlConfig)
      const [data] = await connection.execute(`
      SELECT *
      FROM pets
      INNER JOIN prescriptions
      ON ${mysql.escape(req.params.id)} = pet_id
      WHERE pets.id = ${mysql.escape(req.params.id)}
      `)
      // console.log(data)

      if (data.length < 1) {
        await connection.end()
        return res.send({ err: 'No logs found.' })
      }
      await connection.end()
      return res.status(200).send(data)
    } catch (err) {
      return res.status(500).send({ err: 'Server issue...' })
    }
  }
)

// Add log
router.post(
  '/add_prescription',
  isLoggedIn,
  validation(addPrescriptionSchema),
  async (req, res) => {
    try {
      const connection = await mysql.createConnection(mysqlConfig)
      const [data] = await connection.execute(`
    INSERT INTO prescriptions (medication_id, pet_id, comment)
    VALUES (${mysql.escape(req.body.medication_id)},${mysql.escape(
        req.body.pet_id
      )}, ${mysql.escape(req.body.comment)} )
    `)

      await connection.end()

      if (!data.insertId || data.affectedRows !== 1) {
        connection.end()
        return res.status(500).send({ err: 'Server issue...' })
      }

      return res.status(200).send({ msg: 'Successfully added a prescription.' })
    } catch (err) {
      return res.status(500).send({ err: 'Server issue...' })
    }
  }
)

module.exports = router
