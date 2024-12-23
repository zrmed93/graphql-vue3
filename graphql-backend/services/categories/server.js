const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { gql } = require('graphql-tag');

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external", "@shareable","@provides"])

  type Category @key(fields: "id") {
    id: ID!
    name: String!
    products: [Product] @provides(fields: "categoryId")
  }

  extend type Product @key(fields: "id") {
    id: ID! @external
    categoryId: ID! @external
  }

  extend type Query {
    products(search: String, minPrice: Float, maxPrice: Float, categoryId: ID): [Product!]! @shareable
    categories: [Category!]!
  }
`;

// Mock data
const categories = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Audio' },
];

const resolvers = {
  Query: {
    categories: () => categories,
    searchProducts: (_, { search }) => {
      const searchLower = search.toLowerCase();
      const matchingCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchLower)
      );
      
      // Return references to products in matching categories
      return matchingCategories.map(category => ({
        __typename: 'Product',
        id: category.id
      }));
    }
  },
  Category: {
    __resolveReference(reference) {
      return categories.find(category => category.id === reference.id);
    }
  }
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers })
});

startStandaloneServer(server, {
  listen: { port: 4002 }
}).then(({ url }) => {
  console.log(`Categories service ready at ${url}`);
}); 