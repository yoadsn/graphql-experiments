import express from 'express'
import mongoose from 'mongoose';
import * as db from './mongoSchema.js';
import createLoaders from './dataLoaders.js';
import expressGraphql from 'express-graphql';
import { schema, root } from './gqlschema.js';
let app = express()


app.use((req, res, next) => {
  req.db = db;
  next()
});
app.use((req, res, next) => {
  req.dataLoader = createLoaders();
  next()
});
app.use((req, res, next) => {
  console.log(`request from ip: ${req.ip}`)
  next();
})

app.use('/graphql', expressGraphql({
  schema: schema,
  rootValue: root,
  //context: { db },
  graphiql: true
}));


//
// Launch the server
// -----------------------------------------------------------------------------

let dbConnStr = 'mongodb://localhost/wescoveraround';
let dbConnOptions = {
  server: {},
  replset: {}
};
mongoose.set('debug', process.env.NODE_ENV !== 'production')
dbConnOptions.server.socketOptions = dbConnOptions.replset.socketOptions = { keepAlive: 120 };
dbConnOptions.server.reconnectTries = Number.MAX_VALUE;

mongoose.connect(dbConnStr, dbConnOptions);

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + dbConnStr);
  app.listen(3000, () => {
    console.log('http server listening on port 3000')
  })
});
