import passport from "passport"
import local from 'passport-local'
import { usersModel } from '../models/users.models.js'
import { createHash, isValidPassword } from "../utils/bcrypt.js"
import GitHubStrategy from 'passport-github2'

const LocalStrategy = local.Strategy

//Register Strategy
const initializePassport = () => {
    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: 'email' }, async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body

            try {
                let user = await usersModel.findOne({ email: username })
                if (user) {
                    return done(null, false)
                }

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password)
                }
                let result = await usersModel.create(newUser)
                return done(null, result)
            } catch (error) {
                return done('Error al obtener el usuario: ' + error)
            }
        }
    ))

    //Login Strategy
    passport.use('login',
        new LocalStrategy({ usernameField: 'email' },
            async (username, password, done) => {
                try {
                    const user = await usersModel.findOne({ email: username })

                    if (!user) {
                        return done(null, false)
                    }

                    if (!isValidPassword(user, password)) {
                        return done(null, false)
                    }

                    return done(null, user)

                } catch (error) {
                    return done(error)
                }
            }))

    //Github login
    passport.use('github', new GitHubStrategy({
        clientID: '8a844afc2ec671ec7229',
        clientSecret: 'e4a2f1d430515074ca323273bef1c328409598ed',
        callbackURL: 'http://localhost:8080/auth/github/callback',
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await usersModel.findOne({ email: profile._json.email })
                if (!user) {
                    let newUser = {
                        first_name: profile._json.name,
                        last_name: ' ',
                        age: 18,
                        email: profile._json.email,
                        password: ' '
                    }
                    let result = await usersModel.create(newUser)
                    done(null, result)
                } else {
                    done(null, user)
                }
            } catch (error) {
                return done(error)
            }
        }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await usersModel.findById(id)
        done(null, user)
    })
}

export default initializePassport