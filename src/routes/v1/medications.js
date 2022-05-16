const express = require('express')
const fetch = require('node-fetch')
const isLoggedIn = require('../../middleware/auth')
const { addMedSchema } = require('../../middleware/schemas/medicationSchema')
const validation = require('../../middleware/validation')
const { strapiUser, strapiPass, strapiServer } = require('../../config')

const router = express.Router()

router.post(
  '/add_medication',
  isLoggedIn,
  validation(addMedSchema),
  async (req, res) => {
    try {
      const response = await fetch(`${strapiServer}/api/auth/local/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: strapiUser,
          password: strapiPass
        })
      })
      const data = await response.json()

      const response2 = await fetch(`${strapiServer}/api/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${data.jwt}`
        },
        body: JSON.stringify({
          data: {
            title: req.body.title,
            description: req.body.description,
            price: req.body.price
          }
        })
      })
      const data2 = await response2.json()

      return res.status(200).send(data2)
    } catch (err) {
      console.log(err)
      return res.status(500).send({ msg: 'Server issue.' })
    }
  }
)

module.exports = router
