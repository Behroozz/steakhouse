const uuid = require('uuid')
const { combineResolvers } = require('graphql-resolvers')
const { tasks, users } = require('../constants')
const Task = require('../database/models/task')
const User = require('../database/models/user')
const { isAuthenticated, isTaskOwner } = require('./middleware')

module.exports = {
  /**
   * Query resolver
   */
  Query: {
    tasks: combineResolvers(isAuthenticated, async (_, { skip=0, limit=10}, { loggedInUserId }) => {
      try {
        // sort in desc order
        // offset limit pagination --->
        // disadvantage --> Duplicate records when there are frequent list update, performance
        // alternative 
        // cursor pagination
        const tasks = await Task.find({ user: loggedInUserId })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(limit)
        return tasks
      } catch(ex) {
        console.log(ex)
        throw ex
      }
    }),
    // id is always serialize as string
    task: combineResolvers(isAuthenticated, isTaskOwner, async (_, { id }) => {
      try {
        const task = await Task.findById(id)
        return task
      } catch(ex) {
        console.log(ex)
        throw ex
      }
    })
  },
  Mutation: {
    createTask: combineResolvers(isAuthenticated, async (_, { input }, {email}) => {
      try {
        const user = await User.findOne({ email })
        const task = new Task({...input, user: user.id })
        const result = await task.save()
        user.tasks.push(result.id)
        await user.save()
        return result
      } catch(ex) {
        console.log(ex)
        throw ex
      }
    }),
    updateTask: combineResolvers(isAuthenticated, isTaskOwner, async (_, {id, input })=> {
      try {
        const task = await Task.findByIdAndUpdate(id , { ...input }, { new : true })
        return task
      } catch(ex) {
        console.log(ex)
        throw ex
      }
    }),
    deleteTask: combineResolvers(isAuthenticated, isTaskOwner, async (_, { id }, { loggedInUserId }) => {
      try {
        const task = await Task.findByIdAndDelete(id)
        // first search for the user and the pull out the task array base on task id
        // The $pull operator removes from an existing array all instances of a value 
        // or values that match a specified condition.
        const user = await User.updateOne( { _id: loggedInUserId}, { $pull: {
          tasks: task.id
        }})
        console.log('user', user)
        return task
      } catch(ex) {
        console.log(ex)
        throw ex
      }
    })
  },
  // We need field level resolver for user
  Task: {
    /**
     * Field level resolver
     * user: (parent) => users.find(user => user.id === parent.userId)
     * Graphql first resolve query resolver then go to field level resolver
     */
    user: async (parent) => {
      try {
        const user = await User.findById(parent.user)
        return user
      } catch(ex) {
        console.log(ex)
        throw ex
      }
    },
  },
}