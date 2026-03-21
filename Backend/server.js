const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const routes = require('./routes')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '5mb' }))

app.use('/api', routes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
