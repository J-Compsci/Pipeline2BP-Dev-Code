const express = require('express')
const router = express.Router()
const Team = require('../models/teams.js')
const Project = require('../models/projects.js')
const Stationary_Map = require('../models/stationary_maps.js')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const { json } = require('express')



router.post('', passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    user = await req.user
    let newTeam = new Team({
        title: req.body.title,
        description: req.body.description,
        users: [{user:user._id, role:'owner'}],
        public: req.body.public
    })

    const team = await Team.addTeam(newTeam)

    // Add the new team to the user's teams
    user.teams.push(team._id)
    user.save()

    res.status(201).json(team)
})

router.get('/:id', passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    res.json(await Team.findById(req.params.id).populate('projects', 'title'))
})

router.put('/:id', passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    user = await req.user
    let newTeam = new Team({
        title: req.body.title,
        description: req.body.description,
        public: req.body.public
    })

    if (await Team.isAdmin(req.params.id,user._id)){
        res.status(201).json(await Team.updateTeam(req.params.id,newTeam))
    }

    else{
        res.json({
            msg: unauthorized
        })
    }
    
})

router.delete('/:id', passport.authenticate('jwt',{session:false}), async (req, res, next) => {
    user = await req.user
    team = await Team.findById(req.params.id)
    if(await Team.isOwner(team._id,user._id)){
    
        for(var i = 0; i < team.projects.length; i++ ){
            proj = team.projects[0]
            await Stationary_Map.projectCleanup(proj)
        }
        await Project.teamCleanup(team._id)
        res.json(await Team.deleteTeam(team._id))

    }
    else{
        res.json({
            msg: 'unauthorized'
        })
    }

})

module.exports = router