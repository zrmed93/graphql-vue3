const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const cors = require('cors');

// Custom price transformer
const transformPrice = (price, userRole) => {
  if (userRole === 'user') {
    return Math.round(price);
  }
  return price;
};

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'products', url: 'http://localhost:4001/graphql' },
      { name: 'categories', url: 'http://localhost:4002/graphql' }
    ],
  }),
  buildService: ({ url }) => {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        request.http.headers.set('user-role', context.userRole);
      },
      async didReceiveResponse({ response, context }) {
        // Transform prices based on user role
        if (response.data?.products) {
          response.data.products = response.data.products.map(product => ({
            ...product,
            price: transformPrice(product.price, context.userRole)
          }));
        }

        return response;
      }
    });
  }
});

const server = new ApolloServer({
  gateway,
  formatError: (error) => {
    if (error.message.startsWith('Unauthorized')) {
      return {
        message: error.message,
        code: 'UNAUTHORIZED',
        statusCode: 401
      };
    }
    return error;
  }
});

const app = express();

async function startServer() {
  await server.start();

  app.use(cors());
  app.use(express.json());
  
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.split(' ')[1] || '';
      let userRole;
      
      switch (token) {
        case 'admin':
          userRole = 'admin';
          break;
        case 'user':
          userRole = 'user';
          break;
        default:
          throw new Error('Invalid or missing authentication token');
      }

      return { userRole };
    },
  }));

  app.listen(4000, () => {
    console.log('Gateway ready at http://localhost:4000/graphql');
  });
}

startServer().catch(console.error);