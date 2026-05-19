const express = require('express')
const dbConnection = require('./db/connectin')
require('dotenv').config()
const cors = require('cors')
const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')
const projectsRoutes = require('./routes/projects')
const sharesRoutes = require('./routes/ShareIssue')
const shareSalesRoutes = require('./routes/shareSales')
const endpointsRoutes = require('./routes/endPoint')
const profitRoutes = require('./routes/profitRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const memberSideRoutes = require('./routes/memberSide');

const app = express()
const port = process.env.PORT || 5000
dbConnection()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/shares', sharesRoutes)
app.use('/api/share-sales', shareSalesRoutes)
app.use('/api/endpoints', endpointsRoutes)
app.use('/api/profit', profitRoutes);
app.use('/api/payouts', payoutRoutes);

// For Member Frontend
app.use('/api/memberSide', memberSideRoutes);




app.get('/', (req, res) => {
  res.send('Inventory Management app server is runing')
})

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`)
})
