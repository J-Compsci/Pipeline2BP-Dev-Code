const express = require('express')
const passport = require('passport')
const Team = require('../models/teams.js')
const router = express.Router()
const User = require('../models/users.js')

const { BadRequestError, NotFoundError } = require('../utils/errors.js')

const testPassword = (password) => {
    if (!password ||                       // Password must be given
        password.length < 8 ||             // Length must be >= 8 characters
        /\s/g.test(password) ||            // Must not contain any whitespace characters
        !/\d/g.test(password) ||           // Must contain at least one digit
        !/[!@#$%^&*]/g.test(password) ||   // Must contain at least one symbol
        !/[A-Z]/g.test(password)) {        // Must contain at least one uppercase letter
        return false
    }
    return true
}

// Create a new user
router.post('/', async (req, res, next) => {
    // Check password
    if (!testPassword(req.body.password)) {
        throw new BadRequestError('Missing or invalid field: password')
    }

    let newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        instituion: req.body.instituion,
        email: req.body.email,
        password: req.body.password
    })

    const user = await User.addUser(newUser)
    res.status(201).json(user)
})

// Get another user's info
router.get('/:id', async (req, res, next) => {
    // Make a query for the user, excluding fields that contain private info
    const user = await User.findById(req.params.id)
        .select('-password -is_verified -verification_code -verification_timeout -invites')
        .populate('invites','title')
        .populate('teams', 'title')

    if (!user) throw new NotFoundError('The requested user was not found')

    res.status(200).json(user)
})

// Get my own user info, requires token authentication
// TODO: this should probably use a different path than just /
router.get('/', passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    // Make a query for the user, excluding fields that the user should not see
    const user = await User.findById(req.user._id)
        .select('-password -verification_code -verification_timeout')
        .populate('teams', 'title')
        .populate('invites','title')

    res.status(200).json(user)
})

// Update user info
router.put('/', passport.authenticate('jwt',{session:false}), async (req, res, next) => {

    let newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        instituion: req.body.instituion
    })

    if (req.body.password) {
        // Check password
        if (!testPassword(req.body.password)) {
            throw new BadRequestError('Missing or invalid field: password')
        }
        newUser.password = await User.createPasswordHash(req.body.password)
    }

    const user = await User.updateUser(req.user._id, newUser)

    res.status(200).json(user)
})

// Accept invite
router.post('/invites', passport.authenticate('jwt',{session:false}), async (req, res, next) => {

    let user = await req.user

    for( i = 0; i < req.body.responses.length; i++){

        var response = req.body.responses[i]

        if (response.accept == true && user.invites.includes(response.team)){
            await Team.addUser(response.team,user._id)
            await User.addTeam(user._id, response.team)
        }
        await User.deleteInvite(user._id,response.team)
    }

    res.status(200).json(user)

})

module.exports = router