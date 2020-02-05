import express from 'express'
import createError from 'http-errors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import passport from 'passport'
import passportLocal from 'passport-local'
import session from 'express-session'
import connectMongo from 'connect-mongo'

import './components/users/users'
import userModel from './components/users/userModel'

//----------------------------------------------------------------------
// NEW EXPRESS APP
//----------------------------------------------------------------------

const app = express()

//----------------------------------------------------------------------
// MONGODB CONNECTION WITH MONGOOSE
//----------------------------------------------------------------------

// Nota bene! If this was a "real" application, I would NOT display the username
// and the password of the database in GitHub! And the username would be more
// complex.
const mongoDB =
  'mongodb+srv://sini:neJoBwArxhXT3t8K@simba-bionq.mongodb.net/pollidb'
// Local mongoDB: 'mongodb://127.0.0.1:27017/pollidb'

mongoose.connect(mongoDB, {useNewUrlParser: true})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error: '))

//----------------------------------------------------------------------
// SESSION MANAGEMENT
//----------------------------------------------------------------------

// Session length in milliseconds
const ttl_diff = 1000 * 60 * 60

const mongoStore = connectMongo(session)

app.use(
  session({
    name: 'polli-id',
    resave: false,
    secret: 'MySuperSecret',
    saveUninitialized: false,
    cookie: {maxAge: ttl_diff},
    store: new mongoStore({
      collection: 'session',
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60,
    }),
  })
)

//----------------------------------------------------------------------
// PASSPORT MANAGEMENT
//----------------------------------------------------------------------

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((_id, done) => {
  userModel.findById(_id, (err, user) => {
    if (err) {
      return done(err)
    } else if (!user) {
      return done(null, false)
    } else {
      return done(null, user)
    }
  })
})

const localStrategy = passportLocal.Strategy

passport.use(
  'local-login',
  new localStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      if (!username || !password) {
        return done(null, false, {message: 'The credentials did not match.'})
      }

      if (username.length === 0 || password.length === 0) {
        return done(null, false, {message: 'The credentials did not match.'})
      }

      userModel.findOne({username: username}, (err, user) => {
        if (err) {
          return done(err)
        }

        if (!user) {
          return done(null, false, {message: 'The credentials did not match.'})
        }

        // TODO: crypted and salted passwords
        if (bcrypt.compareSync(password, user.password)) {
          let token = createToken()
          req.session.token = token
          req.session.username = user.username

          return done(null, user)
        } else {
          return done(null, false, {message: 'The credentials did not match.'})
        }
      })
    }
  )
)

//----------------------------------------------------------------------
// MIDDLEWARE
//----------------------------------------------------------------------

// Log with Morgan
app.use(morgan('dev'))

// Parse incoming requests with body-parser
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// cookie-parser
app.use(cookieParser())

// Create token
// TODO: Etsi kirjasto, jolla saa tehtyä tokeneita!
const createToken = () => {
  let token = ''
  let letters = 'abcdefghijABCDEFGHIJ0123456789'

  for (let i = 0; i < 1024; i++) {
    let temp = Math.floor(Math.random() * 30)
    token += letters[temp]
  }
  return token
}

//----------------------------------------------------------------------
// ROUTERS
//----------------------------------------------------------------------

import indexRouter from './index'
app.use('/', indexRouter)

import pollsRouter from './components/polls/polls'
app.use('/polls', pollsRouter)

import usersRouter from './components/users/users'
app.use('/users', usersRouter)

//----------------------------------------------------------------------
// ERRORS
//----------------------------------------------------------------------

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  if (req.url.startsWith('/sockjs-node/')) {
    return
  } else {
    next(createError(404))
  }
})

// Error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  return res
    .status(err.status || 500)
    .send('Server responded with status: ' + err.message)
})

export default app
