import mongoose, { Schema } from 'mongoose';

var basedAtSchema = Schema({
  address: {
    street1: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  location: {
    type: { type: String },
    coordinates: [Number]
  }
}, { _id : false });

var makerSchema = Schema({
  name: String,
  slug: { type: String, index: true },
  descriptionHtml: String,
  logoImage: String,
  titleImage: String,
  externalUrl: String,
  makerBasedAt: basedAtSchema
});
makerSchema.virtual('basedAt').get(function () {
  return this.makerBasedAt;
});


var itemSchema = Schema({
  name: String,
  titleImage: String,
  //pops: [{ type: Schema.Types.ObjectId, ref: 'Pop' }],
  maker: { type: Schema.Types.ObjectId, ref: 'Maker'}
})

const Maker = mongoose.model('Maker', makerSchema);
const Item = mongoose.model('Item', itemSchema);

export {
  Maker,
  Item
};
