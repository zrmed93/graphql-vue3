import gql from 'graphql-tag'



export const PRODUCTS_QUERY = gql`
  query GetProducts($search: String, $categoryId: ID, $minPrice: Float, $maxPrice: Float) {
    products(
      search: $search
      categoryId: $categoryId
      minPrice: $minPrice
      maxPrice: $maxPrice
    ) {
      id
      name
      price
      category {
        id
        name
      }
    }
  }
`

export const CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`

export const UPDATE_PRODUCT_NAME = gql`
  mutation UpdateProductName($id: ID!, $name: String!) {
    updateProductName(id: $id, name: $name) {
      id
      name
    }
  }
`