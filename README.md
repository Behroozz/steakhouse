# Steakhouse

A simple single page application using:

* Express
* GraphQL API Server with Apollo
* MongoDB
* Mongoose
* Jwt Authentication
* Cursor Pagination, DB Query Batching & Caching

## Running

## Local
Install nodemon package
Install, configure and run default mongodb

On Terminal:
`npm run dev`

Navigate to:
`http://localhost:3001/graphql`

User Api:
```
# Write your query or mutation here
query getUserById {
  user {
    name
    email
    tasks {
      id
      name
    }
  }
}

mutation createUser {
  signup(
    input: { name: "Behrooz", email: "Behrooz@gmail.com", password: "12345" }
  ) {
    id
    name
    email
    createdAt
    updatedAt
  }
}

mutation login ($email: String!, $password: String!){
  login(input: { email: $email, password: $password }) {
    token
  }
}

mutation signup {
  signup(input: {
    email: "Poori@gmail.com", password: "12345", name: "Poori"
  }) {
    id
    name
  }
}
```

USER VARIABLES
```
{
  "email": "behrooztabesh@gmail.com",
  "password" : "12345"
}
```

HTTP HEADERS
```
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
}
```

Task Api:
```
mutation createTask {
  createTask(input: { name: "Task1", completed: false }) {
    id
    name
    completed
  }
}

# query getAllTask {
#   tasks {
#     id
#     name
#     completed
#     user {
#       id
#       email
#     }
#   }
# }

query getAllTaskCursor {
  tasks(limit: 5, cursor: "NWVlNzAzMGYxMzE4NTExODkyMDhlNThl") {
    taskFeed {
      id
      name
    }
  	pageInfo {
      nextPageCursor
      hasNextPage
    }
  }
}

query getTaskById {
  task(id: "5ee7030f131851189208e58e") {
    name
    completed
    createdAt
    updatedAt
  }
}

mutation updateTask {
  updateTask(
    id: "5ee6eaed49e25d1889e14445"
    input: { completed: true }
  ) {
    id
    completed
    name
  }
}

mutation deleteTask {
  deleteTask(id: "5ee6eae149e25d1889e14444") {
    id
    name
    completed
  }
}
```

User Subscription
```
subscription {
  userCreated {
    id
    name
    email
  }
}
```






