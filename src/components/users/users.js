import express from 'express'
import bcrypt from 'bcrypt'
import passport from 'passport'
import userModel from './userModel'

const router = express.Router()

//----------------------------------------------------------------------
// HELPERS
//----------------------------------------------------------------------

const isUserLogged = (req, res, next) => {
  let token = req.headers.token

  if (!token) {
    return res
      .status(403)
      .json({message: 'You are not allowed to see this content.'})
  }

  if (req.isAuthenticated()) {
    if (token === req.session.token) {
      return next() // Toimiiko tämä kohta?
    }
  }

  return res
    .status(403)
    .json({message: 'You are not allowed to see this content.'})
}

//----------------------------------------------------------------------
// REGISTER a new user
//----------------------------------------------------------------------

router.post('/register', (req, res) => {
  if (!req.body) {
    return res.status(422).json({message: 'Please provide the credentials.'})
  }

  if (!req.body.username || !req.body.password) {
    return res
      .status(422)
      .json({message: 'Please provide both a username and a password.'})
  }

  if (req.body.username.length < 4 || req.body.password.length < 8) {
    return res.status(422).json({message: 'Please provide longer credentials.'})
  }

  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(422).json({message: 'Hashing the password failed. :('})
    }

    let user = new userModel({
      username: req.body.username,
      password: hash,
    })

    user.save((err, user) => {
      if (err) {
        console.log('Registration failed. Reason: ' + err)
        return res
          .status(422)
          .json({message: 'This username is already in use.'})
      } else {
        console.log('Registered succesfully: ' + user.username)
        return res.status(200).json({message: 'Successfully registered!'})
      }
    })
  })
})

//----------------------------------------------------------------------
// LOGIN
//----------------------------------------------------------------------

router.post('/login', (req, res) => {
  passport.authenticate('local-login', (err, user) => {
    console.log('Nyt ollaan backendissä. LOGIN')
    if (err || !user) {
      return res.status(422).json({message: 'Please provide the credentials.'})
    }

    req.login(user, err => {
      if (err) {
        return res
          .status(422)
          .json({message: 'Please provide the credentials.'})
      } else {
        return res.status(200).json({
          message: 'Successfully logged in! :D',
          token: req.session.token,
          username: req.body.username,
        })
      }
    })
  })(req, res)
})

//----------------------------------------------------------------------
// LOGOUT
//----------------------------------------------------------------------

router.post('/logout', (req, res) => {
  req.logout()

  if (req.session) {
    req.session.destroy()
  }

  console.log('Nyt ollaan backendissä. LOGOUT')
  return res.status(200).json({message: 'Succesfully logged out!'})
})

export default router
export {isUserLogged}
