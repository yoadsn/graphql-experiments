import { buildSchema } from 'graphql';
import gqlschema from './gqlschema.js';
import relayschema from './relayschema.js';

var schema = buildSchema(gqlschema + relayschema);
console.dir(schema);

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

let makerLoader = (makerId, context) => {
  console.log('maker loader')
  return context.dataLoader.makers.load(makerId).then(maker => hookifyMaker(maker, context));
}

let itemsForMakerResolver = (makerId, context) => {
  console.log('maker items loader')
  return context.dataLoader.makerItems.load(makerId)
  .then(items =>
    connectionMaker(items.map(item =>
      hookifyItem(item, context)
    ))
  );
}

let connectionMaker = (items) => {
  return {
    edges: items.map(createEdge),
    pageInfo: createPageInfo()
  }
}

let createEdge = (item) => {
  return {
    cursor: "acursor",
    node: item
  }
}

let createPageInfo = () => {
  return {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: "startc",
    endCursor: "endc"
  }
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
