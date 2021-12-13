require('dotenv').config();

const { ApolloServer } = require('apollo-server');
const { createStore } = require('./utils');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const LaunchAPI = require('./datasources/launch');
const userAPI = require('./datasources/user');

// function to set up our SQLite database
const store = createStore();

async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({
    // cors: true,
    typeDefs,
    resolvers,

    // connect instances of LaunchAPI and UserAPI to our graph
    dataSources: () => {
      return {
        launchAPI: new LaunchAPI(),
        userAPI: new userAPI({ store }),
      };
    },
  });

  const { url, port } = await server.listen({ port: process.env.PORT || 4000 });
  console.log(`
      🚀  Server is running
      🔉  Listening on port ${port}
      📭  Query at ${url}
      ✨  Explore at https://studio.apollographql.com/sandbox
    `);
}

startApolloServer(typeDefs, resolvers);
