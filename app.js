const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const passport = require('passport')
const config = require('./utils/config')
const errorHandler = require('./middlewares/error_handler')
const log = require('./utils/log')
require('express-async-errors')


log.info('Connecting to ', config.DB_URI)
const connect = async () => {
    try {
        await mongoose.connect(config.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        log.info('Connected to database')
    } catch (err) {
        log.info('Error connecting to database: ', error.message)
    }
}
connect()



const app = express();

app.use(cors())


app.use(bodyParser.json())

const loginApi      = require('./routes/login.js')
const teamApi       = require('./routes/teams.js')
const projectApi    = require('./routes/projects.js')
const userApi       = require('./routes/users.js')
const verifyApi     = require('./routes/verify.js')
const stationApi    = require('./routes/stationary_maps.js')
const movingApi     = require('./routes/moving_maps.js')
const soundApi      = require('./routes/sound_maps.js')
const natureApi     = require('./routes/nature_maps.js') 
const lightApi      = require('./routes/light_maps.js')
const orderApi      = require('./routes/order_maps.js')      
const boundApi      = require('./routes/boundaries_maps.js')
const surveyApi     = require('./routes/surveys.js')
const collectionApi = require('./routes/collections.js')
const resetApi      = require('./routes/password_reset.js')

//first parameter will be the directory name used from front end to access these routes
app.use('/api/login',           loginApi)
app.use('/api/teams',           teamApi)
app.use('/api/projects',        projectApi)
app.use('/api/users',           userApi)
app.use('/api/verify',          verifyApi)
app.use('/api/stationary_maps', stationApi)
app.use('/api/moving_maps',     movingApi)
app.use('/api/sound_maps',      soundApi)
app.use('/api/nature_maps',     natureApi)
app.use('/api/light_maps',      lightApi)
app.use('/api/order_maps',      orderApi)
app.use('/api/boundaries_maps',      boundApi)
app.use('/api/surveys',         surveyApi)
app.use('/api/collections',     collectionApi)
app.use('/api/password_reset',  resetApi)

app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.js')(passport)

const expressSession = require('express-session')({
    secret: config.PRIVATE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000}
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);

// Handles errors. express-async-errors ensures this is invoked automatically
// by any errors thrown anywhere in previous routes or middlewares.
app.use(errorHandler)

//build is used instead of public because website is made with create-react-app which uses build.
app.use(express.static(path.join(__dirname, 'frontend_web/build')));

//* allows a dynamic build of all files in frontend_web
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'frontend_web','build', 'index.html'));
});

const server = app.listen(config.PORT, () => {
    log.info(`Server is running on port ${config.PORT}`)
})

module.exports = server
