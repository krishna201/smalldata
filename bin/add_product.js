var massive = require('massive');
var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var config = require('config');

var db = massive.connectSync({connectionString : config.get("compose.postgres") }) 

console.log(argv);

var media_id = argv.media_id;
var length = argv.l;
var title = argv.t;
var media_id = argv.m;
var name = argv.n;


var batch = [];
_.range(1, length + 1).forEach(function(sec) {
  batch.push({media_id: media_id,
              second: sec,
              title: title,
              name: name,
              length_in_seconds: length,
              decile: Math.floor((sec - 1) / length * 10) + 1,
              quartile: Math.floor((sec - 1) / length * 4) + 1,
              transition: "no"});
});

function put(batch) {
  return new Promise(function(resolve, reject) {
    db.products.insert(batch, function(err,res) {
      if(err) { reject(err); }
      resolve(res.length);
    });
  });
}

put(batch).then(function(count) {
  console.log(count);
  process.exit();
});

