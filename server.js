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
  engine: {
    // The Graph Manager API key
    apiKey: process.env.APOLLO_KEY,
    // A tag for this specific environment (e.g. `development` or `production`).
    // For more information on schema tags/variants, see
    // https://www.apollographql.com/docs/platform/schema-registry/#associating-metrics-with-a-variant
    schemaTag: 'development',
  },
  engine: {    
    reportSchema: true
  },
  context: async ({ req, connection }) => {
    const contextObj = {}
    if(req) {
      await verifyUser(req)
      contextObj.email = req.email,
      contextObj.loggedInUserId = req.loggedInUserId
    }
    contextObj.loaders = {
      user: new DataLoader(keys => loaders.user.batchUsers(keys))
    }

    return contextObj
  },
  formatError: (error) => {
    return {
      message: error.message
    }
  }
})

apolloServer.applyMiddleware({app, path: '/graphql' })

const PORT = process.PORT || 3001

// app.use('/', (req, res, next) => {
//   res.send({ message: 'Hello'})
// })

const httpServer = app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`)
  console.log(`Graphql Endpoints: ${apolloServer.graphqlPath}`)
})

// to make subscription works
apolloServer.installSubscriptionHandlers(httpServer)