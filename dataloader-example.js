/* A batch loading function accepts an array of keys, 
and returns a promise which resolves to an array of values. */

/* DataLoader will coalesce all individual loads 
which occur within a single tick of an event loop 
and then call your batch loading function */

const DataLoader = require('dataloader');

const batchUsers = async (ids) => {
  console.log('batchuser called===', ids);
  return ids;
};
// dataloader batch load should resolve and return a promise, async always resolve as promise
const batchUserLoader = new DataLoader(keys => batchUsers(keys));

batchUserLoader.load(1);
batchUserLoader.load(2);
batchUserLoader.load(3);

// batchuser called=== [ 1 ]
// batchuser called=== [ 4, 5, 6 ]
// batchuser called=== [ 7, 8, 9 ]
// batchUserLoader.load(1);
// batchUserLoader.load(1);
// batchUserLoader.load(1);

// Force next-tick
setTimeout(() => {
  batchUserLoader.load(4);
  batchUserLoader.load(5);
  batchUserLoader.load(6);
}, 100);

// Force next-tick
setTimeout(() => {
  batchUserLoader.load(7);
  batchUserLoader.load(8);
  batchUserLoader.load(9);
}, 200); 
