const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const cors = require('cors') // Because it can be access by multiple domain, you can get cross origin error
const dotEnv = require('dotenv')
const resolvers = require('./resolvers')
const typeDefs =  require('./typeDefs')
const { connection } = require('./database/util')
const { verifyUser } = require('./helper/context')

dotEnv.config()

const app = express()
connection()

app.use(express.json())
app.use(cors())

// the format user send the token
// {
//   "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
// }

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    await verifyUser(req)
    return {
      email: req.email,
      loggedInUserId: req.loggedInUserId
    }
  }
})

apolloServer.applyMiddleware({app, path: '/graphql' })

const PORT = process.PORT || 3001

app.use('/', (req, res, next) => {
  res.send({ message: 'Hello'})
})

app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`)
  console.log(`Graphql Endpoints: ${apolloServer.graphqlPath}`)
})