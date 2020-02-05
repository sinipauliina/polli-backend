import express from 'express'
import mongoose from 'mongoose'
import pollModel from './pollModel'
import {isUserLogged} from '../users/users'

const router = express.Router()

//----------------------------------------------------------------------
// GET polls
//----------------------------------------------------------------------

router.get('/', (req, res) => {
  pollModel.find({}, {_id: 1, title: 1}, (err, results) => {
    if (err) {
      return res
        .status(404)
        .json({message: 'I did not find any polls. :(', polls: []})
    } else if (!results) {
      return res
        .status(404)
        .json({message: 'I did not find any polls. :(', polls: []})
    } else {
      return res.status(200).json({polls: results})
    }
  })
})

//----------------------------------------------------------------------
// GET a poll with id
//----------------------------------------------------------------------

router.get('/:id', (req, res) => {
  pollModel.findById(req.params.id, (err, result) => {
    if (err) {
      return res.status(404).json({
        message: 'I did not find the poll you were looking for. :(',
        polls: [],
      })
    } else if (!result) {
      return res.status(404).json({
        message: 'I did not find the poll you were looking for. :(',
        polls: [],
      })
    } else {
      return res.status(200).json(result)
    }
  })
})

//----------------------------------------------------------------------
// POST - Create a new poll
//----------------------------------------------------------------------

router.post('/add', (req, res) => {
  let options = []

  for (let i = 0; i < req.body.options.length; i++) {
    let option = {title: req.body.options[i], votes: 0}
    options.push(option)
  }

  let poll = new pollModel({
    title: req.body.title,
    options: options,
  })

  poll.save((err, poll) => {
    if (err) {
      return res.status(409).json({message: 'I could not save the poll. :('})
    } else if (!poll) {
      return res.status(409).json({message: 'I could not save the poll. :('})
    } else {
      return res.status(200).json(poll)
    }
  })
})

//----------------------------------------------------------------------
// DELETE - Remove a poll with id
//----------------------------------------------------------------------

router.delete('/:id', isUserLogged, (req, res) => {
  pollModel.findById(req.params.id, (err, poll) => {
    if (err) {
      return res
        .status(404)
        .json({message: 'I did not find the poll you tried to remove. :('})
    }

    if (!poll) {
      return res
        .status(404)
        .json({message: 'I did not find the poll you tried to remove. :('})
    }

    pollModel.deleteOne({_id: req.params.id}, err => {
      if (err) {
        return res
          .status(404)
          .json({message: 'I did not find the poll you tried to remove. :('})
      } else {
        console.log('Succesfully removed! :)')
        return res.status(204).json({message: 'Succesfully removed! :)'})
      }
    })
  })
})

//----------------------------------------------------------------------
// VOTE
//----------------------------------------------------------------------

router.put('/:id/vote/:option', (req, res) => {
  pollModel.findById(req.params.id, (err, result) => {
    if (err) {
      return res.status(404).json({
        message: 'I did not find the poll you were looking for. :(',
      })
    }

    if (!result) {
      return res.status(404).json({
        message: 'I did not find the poll you were looking for. :(',
      })
    }

    let foundOption = result.options.find(option => {
      return option._id == req.params.option
    })

    if (!foundOption) {
      return res.status(404).json({
        message: 'I did not find the option you were looking for. :(',
      })
    }

    let newOptions = []

    for (let i = 0; i < result.options.length; i++) {
      if (result.options[i]._id == req.params.option) {
        let newOption = {
          _id: result.options[i]._id,
          title: result.options[i].title,
          votes: result.options[i].votes + 1,
        }

        newOptions.push(newOption)
      } else {
        let newOption = {
          _id: result.options[i]._id,
          title: result.options[i].title,
          votes: result.options[i].votes,
        }

        newOptions.push(newOption)
      }
    }

    let updatedPoll = {
      _id: result._id,
      title: result.title,
      options: newOptions,
    }

    pollModel.replaceOne({_id: req.params.id}, updatedPoll, err => {
      if (err) {
        return res.status(409).json({message: err})
      } else {
        return res.status(200).json(updatedPoll)
      }
    })
  })
})

export default router
