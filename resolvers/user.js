const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {combineResolvers } = require('graphql-resolvers')

const User = require('../database/models/user')
const { isAuthenticated } = require('./middleware')
const Task = require('../database/models/task')

module.exports = {
  /**
   * Query resolver
   */
  Query: {
    user:combineResolvers(isAuthenticated, async (_, __, { email }) => {
      try {
        const user = await User.findOne({ email })
        if(!user) {
          throw new Error('User not found!')
        }
        return user
      } catch(ex) {
        console.log(ex)
        throw ex
      }
    })
  },
  Mutation: {
    signup: async (_, {input}) => {
      try {
        const user = await User.findOne({email: input.email})
        if(user) {
          throw new Error('Email already in use.')
        }
        const hashedPassword =  await bcrypt.hash(input.password, 12)
        const newUser = new User({...input, password: hashedPassword})
        const result = await newUser.save()
        return result
      } catch(ex) {
        console.log(ex)
        throw ex
      }
    },
    login: async (_, { input }) => {
      try {
        const user = await User.findOne({ email: input.email })
        if(!user) {
          throw new Error('User not found')
        }
        const isPasswordValid = await bcrypt.compare(input.password, user.password)
        if(!isPasswordValid) {
          throw new Error('Incorrect credential')
        }
        const secret = process.env.JWT_SECRET_KEY || 'mysecretkey'
        // json web token will be use to authenticate this user from now on for other calls
        const token = jwt.sign({ email: user.email }, secret, { expiresIn: '1d'} )
        return { token }
      } catch(ex) {
        console.log(ex)
        throw ex
      }
    } 
  },
  User: {
    tasks: async ({ id }) => {
      try {
        const tasks = await Task.find({ user: id })
        return tasks
      } catch(ex) {
        console.log(ex)
        throw ex
      }
    }
  }
}