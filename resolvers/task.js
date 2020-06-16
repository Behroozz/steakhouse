const { combineResolvers } = require('graphql-resolvers')
const Task = require('../database/models/task')
const User = require('../database/models/user')
const { isAuthenticated, isTaskOwner } = require('./middleware')
const { stringToBase64, base64ToString } = require('../helper')

module.exports = {
  /**
   * Query resolver
   */
  Query: {
    // tasks: combineResolvers(isAuthenticated, async (_, { skip=0, limit=10}, { loggedInUserId }) => {
    //   try {
    //     // sort in desc order
    //     // offset limit pagination --->
    //     // disadvantage --> Duplicate records when there are frequent list update, performance
    //     // alternative 
    //     // cursor pagination
    //     const tasks = await Task.find({ user: loggedInUserId })
    //       .sort({ _id: -1 })
    //       .skip(skip)
    //       .limit(limit)
    //     return tasks
    //   } catch(ex) {
    //     console.log(ex)
    //     throw ex
    //   }
    // }),
    tasks: combineResolvers(isAuthenticated, async (_, { cursor, limit=10}, { loggedInUserId }) => {
      try {
        const query = { user: loggedInUserId }
        if(cursor) {
          query['_id'] = {
            '$lt': base64ToString(cursor) 
          }
        }
        // sort in desc order
        // offset limit pagination --->
        // disadvantage --> Duplicate records when there are frequent list update, performance
        // alternative 
        // cursor pagination
        let tasks = await Task.find(query)
          .sort({ _id: -1 })
          .limit(limit + 1)

        const hasNextPage = tasks.length > limit
        tasks = hasNextPage ? tasks.slice(0, -1) : tasks

        return {
          taskFeed: tasks,
          pageInfo: {
            nextPageCursor: hasNextPage? stringToBase64(tasks[tasks.length -1].id): null,
            hasNextPage
          }
        }
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