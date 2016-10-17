import { buildSchema } from 'graphql';


var schema = buildSchema(`

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

  type Item {
    id: ID!
    name: String
    maker: Maker
  }

  type Maker {
    id: ID!
    name: String
    basedAt: BasedAt
    items: [Item]
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
`);

let hookifyMaker = (maker, context) => {
  let makerObject = maker.toObject({ virtuals: true });
  makerObject.items = itemsForMakerResolver.bind(null, maker.id, context);
  return makerObject;
}

let hookifyItem = (item, context) => {
  let itemObject = item.toObject({ virtuals: true });
  itemObject.maker = makerLoader.bind(null, itemObject.maker, context);
  return itemObject;
}

let itemLoader = (itemId, context) => {
  console.log('item loader')
  return context.dataLoader.items.load(itemId).then(item => {
    return hookifyItem(item, context);
  })
}

let itemsForMakerResolver = (makerId, context) => {
  console.log('maker items loader')
  return context.dataLoader.makerItems.load(makerId)
  .then(items =>
    items.map(item =>
      hookifyItem(item, context)
    )
  );
}

let makerLoader = (makerId, context) => {
  console.log('maker loader')
  return context.dataLoader.makers.load(makerId).then(maker => hookifyMaker(maker, context));
}

var root = {
  getMaker: function ({id}, context) {
    return makerLoader(id, context);
  },
  getItem: function({id}, context) {
    return itemLoader(id, context);
  },
  allItems: function(args, context) {
    return context.db.Item.find({})
    .then(items => items.map(item => hookifyItem(item, context)));
  }
}

export { schema, root };
