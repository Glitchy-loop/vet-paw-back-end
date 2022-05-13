const express = require('express')
const cors = require('cors')
const UserRoutes = require('./routes/v1/users')
const petRoutes = require('./routes/v1/pets')
const logRoutes = require('./routes/v1/logs')
const medRoutes = require('./routes/v1/medications')
const prescriptionsRoutes = require('./routes/v1/prescriptions')

const { serverPort } = require('./config')

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send({ msg: `Server is running` })
})

app.use('/v1/users', UserRoutes)
app.use('/v1/pets', petRoutes)
app.use('/v1/logs', logRoutes)
app.use('/v1/medications', medRoutes)
app.use('/v1/prescriptions', prescriptionsRoutes)

app.all('*', (req, res) => {
  res.status(404).send('Page not found...')
})

app.listen(serverPort, () =>
  console.log(`Server is running on port ${serverPort}...`)
)
