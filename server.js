const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const cors = require('cors') // Because it can be access by multiple domain, you can get cross origin error
const dotEnv = require('dotenv')
const DataLoader = require('dataloader');

const resolvers = require('./resolvers')
const typeDefs =  require('./typeDefs')
const { connection } = require('./database/util')
const { verifyUser } = require('./helper/context')
const loaders = require('./loaders')

dotEnv.config()

const app = express()
connection()

app.use(express.json())
app.use(cors())

// the format user send the token
// {
//   "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
// }

// if we move dataloder here out of context, we will get caching with dataloder
// since when it is in context in every request it will get call and re instantiated 
// const userLoader = new DataLoader(keys => loaders.user.batchUsers(keys))

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    await verifyUser(req)
    return {
      email: req.email,
      loggedInUserId: req.loggedInUserId,
      loaders: {
        user: new DataLoader(keys => loaders.user.batchUsers(keys))
      }
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