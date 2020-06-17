const { gql } = require('apollo-server-express')
const userTypeDefs = require('./user')
const taskTypeDefs = require('./task')

// Schema Stiching with extend
// _:String is only place holder since we can not have empty
const typeDefs = gql`
  scalar Date
  type Query {
    _: String
  }
  type Mutation {
    _: String
  }
  type Subscription {
    _: String
  }
`

module.exports = [
  typeDefs,
  userTypeDefs,
  taskTypeDefs
]