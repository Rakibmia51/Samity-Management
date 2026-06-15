const express = require('express')
require('dotenv').config()
const cors = require('cors')

// ডাটাবেজ কানেকশন এবং সিড স্ক্রিপ্ট ইমপোর্ট
const dbConnection = require('./db/connection') // 'connectin' বানানটি ঠিক করা হয়েছে
const seedAdmin = require('./seed') 

// রাউট ইমপোর্ট
const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')
const projectsRoutes = require('./routes/projects')
const sharesRoutes = require('./routes/ShareIssue')
const shareSalesRoutes = require('./routes/shareSales')
const endpointsRoutes = require('./routes/endPoint')
const profitRoutes = require('./routes/profitRoutes')
const payoutRoutes = require('./routes/payoutRoutes')
const memberSideRoutes = require('./routes/memberSide')

const app = express()
const port = process.env.PORT || 5000

// মিডলওয়্যার
app.use(cors())
app.use(express.json())

// এপিআই রাউটস
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/shares', sharesRoutes)
app.use('/api/share-sales', shareSalesRoutes)
app.use('/api/endpoints', endpointsRoutes)
app.use('/api/profit', profitRoutes)
app.use('/api/payouts', payoutRoutes)
app.use('/api/memberSide', memberSideRoutes)

// বেস রাউট
app.get('/', (req, res) => {
  res.send('Samity Management app server is running') // 'runing' বানান ঠিক করা হয়েছে
})

// ডাটাবেজ কানেক্ট করে সার্ভার চালু করার ফাংশন
const startServer = async () => {
  try {
    // ডাটাবেজ কানেকশনের জন্য অপেক্ষা করবে
    await dbConnection()
    console.log('Database connected successfully.')

    // ডাটাবেজ কানেক্ট হলে এডমিন সিড রান করবে
    await seedAdmin() 

    app.listen(port, () => {
      console.log(`App listening on port http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Failed to start the server:', error)
    process.exit(1)
  }
}

startServer()
