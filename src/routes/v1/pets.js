const express = require('express')
const mysql = require('mysql2/promise')
const { mysqlConfig } = require('../../config')
const validation = require('../../middleware/validation')
const router = express.Router()
const {
  // addPetSchema,
  deletePetSchema
} = require('../../middleware/schemas/petSchemas')
const isLoggedIn = require('../../middleware/auth')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './images'),
  filename: (req, file, cb) => cb(null, `${new Date().getTime()}.jpg`)
})
const path = require('path')

const upload = multer({ storage })

// Get all pets
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM pets
    `)
    await connection.end()
    return res.send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue...' })
  }
})

// Add pet
router.post(
  '/add_pet',
  isLoggedIn,
  // validation(addPetSchema),
  upload.single('img'),
  async (req, res) => {
    try {
      const connection = await mysql.createConnection(mysqlConfig)
      const [data] = await connection.execute(`
    INSERT INTO pets (name, age, clientEmail, img)
    VALUES (${mysql.escape(req.body.name)},${mysql.escape(
        req.body.age
      )}, ${mysql.escape(req.body.clientEmail)}, '${req.file.filename}' )
    `)
      await connection.end()

      if (!data.insertId || data.affectedRows !== 1) {
        await connection.end()
        return res.status(500).send({ err: 'Server issue' })
      }

      return res.status(200).send({ msg: 'Successfully added a pet.' })
    } catch (err) {
      return res.status(500).send({ err: 'Server issue...' })
    }
  }
)
// Get pet image by img id
router.get('/img/:id', (req, res) => {
  try {
    let reqPath = path.join(__dirname, '../../../images')
    const image = `${reqPath}/${req.params.id}`
    res.sendFile(image)
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
      await connection.end()
      return res.status(500).send({ err: 'Server issue...' })
    }

    return res.status(200).send({ msg: 'Successfully deleted a pet.' })
  } catch (err) {
    return res.status(500).send({ err: 'Server issue...' })
  }
})

// Search pets by name
router.get('/search/:searchQuery', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM pets
    WHERE name LIKE '%${req.params.searchQuery}%'
    AND archived LIKE 0
    `)
    connection.end()

    return res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue...' })
  }
})

module.exports = router
