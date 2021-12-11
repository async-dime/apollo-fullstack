require('dotenv').config();

const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');

// async function startApolloServer(typeDefs, resolvers) {
async function startApolloServer(typeDefs) {
  const server = new ApolloServer({
    // cors: true,
    typeDefs,
    // resolvers,
    // dataSources: () => {
    //   return {
    //     trackAPI: new TrackAPI(),
    //   };
    // },
  });

  const { url, port } = await server.listen({ port: process.env.PORT || 4000 });
  console.log(`
      🚀  Server is running
      🔉  Listening on port ${port}
      📭  Query at ${url}
      ✨  Explore at https://studio.apollographql.com/sandbox
    `);
}

// startApolloServer(typeDefs, resolvers);
startApolloServer(typeDefs);
