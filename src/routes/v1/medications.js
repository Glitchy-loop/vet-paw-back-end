const express = require('express')
const mysql = require('mysql2/promise')
const { mysqlConfig } = require('../../config')

const router = express.Router()

// Get all medications
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM medications
    `)
    await connection.end()
    return res.send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue...' })
  }
})

// Add medication
router.post('/add_medication', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    INSERT INTO medications (title, description, price)
    VALUES (${mysql.escape(req.body.title)}, ${mysql.escape(
      req.body.description
    )}, ${mysql.escape(req.body.price)})
    `)
    await connection.end()

    if (data.affectedRows !== 1) {
      await connection.end()
      return res.status(500).send({ err: 'Server issue' })
    }

    return res.status(200).send({ msg: 'Successfully added a medication.' })
  } catch (err) {
    return res.status(500).send({ err: 'Server issue...' })
  }
})

// router.post(
//   '/add_medication',
//   isLoggedIn,
//   validation(addMedSchema),
//   async (req, res) => {
//     try {
//       const response = await fetch(`${strapiServer}/api/auth/local/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           identifier: strapiUser,
//           password: strapiPass
//         })
//       })
//       const data = await response.json()

//       const response2 = await fetch(`${strapiServer}/api/medications`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           authorization: `Bearer ${data.jwt}`
//         },
//         body: JSON.stringify({
//           data: {
//             title: req.body.title,
//             description: req.body.description,
//             price: req.body.price
//           }
//         })
//       })
//       const data2 = await response2.json()

//       return res.status(200).send(data2)
//     } catch (err) {
//       console.log(err)
//       return res.status(500).send({ msg: 'Server issue.' })
//     }
//   }
// )

module.exports = router
