const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.route')
const postRoutes = require('./routes/post.route')
require('dotenv').config({ path: './config/.env' });
const connectDb = require('./config/db')
const { checkUser, requireAuth } = require('./middlewares/auth.middleware')
const morgan = require('morgan')
const mongoose = require('mongoose')
const port = process.env.PORT
const app = express()
const cors = require('cors');





//Database
connectDb()

//les cors
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200
}
app.use(cors(corsOptions));

// Midleware qui permet de traiter les données de la requete
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

//Middleware jwt
app.get('*', checkUser)
app.get('/jwtid', requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id)
})

//Routes
app.use('/api/user', userRoutes)
app.use('/api/post', postRoutes)



//Lancer le serveur
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})