import DataLoader from 'dataLoader';
import * as db from './mongoSchema.js';

const cacheKeyFn = key => key.toString();

function loadMakersAsync(ids) {
  console.log('*');
  return db.Maker.find({ _id : { $in : ids }});
}

function loadItemsAsync(ids) {
  console.log('%');
  return db.Item.find({ _id : { $in : ids }});
}

function loadItemsForMakerAsync(makerIds, context) {
  console.log('^');
  return Promise.all(makerIds.map(maker  => {
    return db.Item.find({ maker }, '_id')
    .then(itemsForMaker => context.items.loadMany(itemsForMaker.map(item => item.id)))
  }))
}

export default function createLoaders() {
  let context = {};
  context.makers = new DataLoader(ids => loadMakersAsync(ids), { cacheKeyFn });
  context.items = new DataLoader(ids => loadItemsAsync(ids), { cacheKeyFn });
  context.makerItems = new DataLoader(ids => loadItemsForMakerAsync(ids, context), { cacheKeyFn });

  return context;
}
