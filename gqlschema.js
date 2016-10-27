export default `
  type Address {
    street1: String
    city: String
    state: String
    zip: String
    country: String
  }

  type Location {
    type: String
    coordinates: [Float]
  }

  type BasedAt {
    address: Address
    location: Location
  }

  type Item implements Node {
    id: ID!
    name: String
    maker: Maker
  }

  type ItemEdge {
    cursor: String!
    node: Item
  }

  type ItemConnection {
    edges: [ItemEdge]
    pageInfo: PageInfo!
  }

  type Maker implements Node {
    id: ID!
    name: String
    basedAt: BasedAt
    items: ItemConnection
  }

  type Query {
    getMaker(id: ID!): Maker
    getItem(id: ID!): Item
    allItems: [Item]
  }

  input MakerInput {
    name: String
  }

  type Mutation {
    createMaker(input: MakerInput): Maker
    updateMaker(id: ID!, input: MakerInput): Maker
  }
`
