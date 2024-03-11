import { Router } from 'express'
import passport from 'passport'
import { isValidPassword } from '../utils/bcrypt.js'

const sessionsRouter = Router()

//Route register user 
sessionsRouter.post('/api/sessions/register',
    passport.authenticate('register',
        { failureRedirect: '/failregister' }),
    async (req, res) => {
        res.send({ status: 'Success', message: 'User registered' })
    })

//Route login (My metod 3) With failureRedirect
sessionsRouter.post("/api/sessions/login",
    passport.authenticate("login",
        { failureRedirect: '/faillogin' }),
    async (req, res) => {
        if (!req.user) return res.status(400).json({ message: "Invalid credentials" })

        /* req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            age: req.user.age,
            email: req.user.email
        } */

        //This is for "isAdmin" compare
        const validPassword = isValidPassword(req.user, req.body.password);
        //When is this functionality changed?
        //pass:adminCod3r123
        const sessionInfo = req.user.email === "adminCoder@coder.com" && validPassword
            ? { email: req.user.email, first_name: req.user.first_name, last_name: req.user.last_name, isAdmin: true }
            : { email: req.user.email, first_name: req.user.first_name, last_name: req.user.last_name, isAdmin: false }

        req.session.user = sessionInfo
        res.send({ status: 'Success', payload: req.user })
    })


//Route logout
sessionsRouter.post('/api/sessions/logout', async (req, res) => {
    req.session.destroy(err => {
        if (!err) res.send('logout ok')
        else res.send({ status: 'Logout ERROR', body: err })
    })
})

//Github login route
sessionsRouter.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { })

//Github callback
sessionsRouter.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), async (req, res) => {
    req.session.user = req.user
    res.redirect('/products')
})

//Fails
sessionsRouter.get('/faillogin', (req, res) => {
    res.status(401).json({ message: 'Fail login' })
})
sessionsRouter.get('/failregister', async (req, res) => {
    res.status(401).json({ message: 'User exists' })
})


export default sessionsRouter