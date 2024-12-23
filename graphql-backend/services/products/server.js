const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { gql } = require('graphql-tag');

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external", "@shareable"])

  type Product @key(fields: "id") {
    id: ID!
    name: String!
    price: Float!
    categoryId: ID! @shareable
    category: Category
  }

  extend type Category @key(fields: "id") {
    id: ID! @external
  }

  type Query {
    products(search: String, minPrice: Float, maxPrice: Float, categoryId: ID): [Product!]! @shareable
  }

  type Mutation {
    updateProductName(id: ID!, name: String!): Product!
  }
`;

// Mock data
const products = [
  { id: '1', name: 'Laptop', price: 999.99, categoryId: '1' },
  { id: '2', name: 'Smartphone', price: 599.50, categoryId: '1' },
  { id: '3', name: 'Headphones', price: 149.99, categoryId: '2' },
];

// Mock categories data for search
const categories = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Audio' },
];

const resolvers = {
  Query: {
    products: (_, { search, minPrice, maxPrice, categoryId }) => {
      let filteredProducts = products;

      // Apply category filter
      if (categoryId) {
        filteredProducts = filteredProducts.filter(product => product.categoryId === categoryId);
      }

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => {
          // Search by product name
          const nameMatch = product.name.toLowerCase().includes(searchLower);
          
          // Search by category name
          const category = categories.find(c => c.id === product.categoryId);
          const categoryMatch = category && category.name.toLowerCase().includes(searchLower);
          
          return nameMatch || categoryMatch;
        });
      }

      // Apply price range filters
      if (minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.price >= minPrice);
      }
      if (maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
      }

      return filteredProducts;
    },
  },
  Product: {
    __resolveReference(reference) {
      return products.find(product => product.id === reference.id);
    },
    category(product) {
      return { __typename: 'Category', id: product.categoryId };
    }
  },
  Mutation: {
    updateProductName: (_, { id, name }, { userRole }) => {
      if (userRole !== 'admin') {
        throw new Error('Unauthorized: Only admins can update product names');
      }

      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      
      product.name = name;
      return product;
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers })
});

startStandaloneServer(server, {
  context: async ({ req }) => {
    const userRole = req.headers['user-role'] || 'user';
    return { userRole };
  },
  listen: { port: 4001 }
}).then(({ url }) => {
  console.log(`Products service ready at ${url}`);
}); 