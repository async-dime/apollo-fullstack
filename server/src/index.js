require('dotenv').config();

const isEmail = require('isemail');
const { ApolloServer } = require('apollo-server');
const { createStore } = require('./utils');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const LaunchAPI = require('./datasources/launch');
const userAPI = require('./datasources/user');

const store = createStore(); // function to set up our SQLite database

async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({
    /**
     * The context function defined below is called once for every GraphQL operation
     * that clients send to our server.
     * The return value of this function becomes the context argument
     * that's passed to every resolver that runs as part of that operation.
     */
    context: async ({ req }) => {
      /**
       * Simple auth check on every request
       * The authentication method used in this example application is not at all secure and should not be used by production applications.
       * However, you can apply the principles demonstrated below to a token-based authentication method that is secure.
       */
      const auth = (req.headers && req.headers.authorization) || ''; // get the auth header (if present)
      const email = Buffer.from(auth, 'base64').toString('ascii'); // decode the value of the authorization header from base64
      if (!isEmail.validate(email)) return { user: null }; // if not a valid email, return null for user
      // find a user by their email
      const users = await store.users.findOrCreate({ where: { email } }); // find or create a user with that email
      const user = (users && users[0]) || null; // get the user (if one was found)
      return { user: { ...user.dataValues } }; // add the user to the context
    },
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
