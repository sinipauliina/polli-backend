import express from 'express'
const router = express.Router()

/* GET home page. */
router.get('/', (req, res) => {
  return res.status(200).json({message: 'Polli backend INDEX'})
})

export default router
