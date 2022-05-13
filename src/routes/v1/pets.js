const express = require('express')
const mysql = require('mysql2/promise')
const { mysqlConfig } = require('../../config')
const validation = require('../../middleware/validation')
const router = express.Router()
const { addPetSchema, deletePetSchema } = require('../../middleware/petSchemas')

// Create table
// router.get('/table', async (req, res) => {
//   const connection = await mysql.createConnection(mysqlConfig)
//   const data = await connection.execute(`
//   CREATE TABLE pets (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   name varchar(30) NOT NULL,
//   clientEmail varchar(50) NOT NULL,
//   age INT,
//   archived BOOLEAN DEFAULT false
//   )
//   `)
//   return res.send(data)
// })

// Get all pets
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM pets
    `)
    return res.send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue...' })
  }
})

// Add pet
router.post('/add_pet', validation(addPetSchema), async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    INSERT INTO pets (name, age, clientEmail)
    VALUES (${mysql.escape(req.body.name)},${mysql.escape(
      req.body.age
    )}, ${mysql.escape(req.body.clientEmail)} )
    `)

    await connection.end()

    if (!data.insertId || data.affectedRows !== 1) {
      return res.status(500).send({ err: 'Server issue...' })
    }

    return res.status(200).send({ msg: 'Successfully added a pet.' })
  } catch (err) {
    return res.status(500).send({ err: 'Server issue...' })
  }
})

// Delete pet
router.delete('/delete_pet', validation(deletePetSchema), async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
        UPDATE pets
        SET archived = 1
        WHERE name = ${mysql.escape(
          req.body.name
        )} AND clientEmail = ${mysql.escape(
      req.body.clientEmail
    )} AND id = ${mysql.escape(req.body.id)}
        `)

    await connection.end()

    if (data.affectedRows !== 1) {
      return res.status(500).send({ err: 'Server issue...' })
    }

    return res.status(200).send({ msg: 'Successfully deleted a pet.' })
  } catch (err) {
    return res.status(500).send({ err: 'Server issue...' })
  }
})

module.exports = router
