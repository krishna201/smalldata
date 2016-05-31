var request = require('request');
var massive = require('massive');
var cheerio = require('cheerio');
var config = require('config');
var _ = require('lodash');
var moment = require('moment');

var url = config.get("wistia.events_url");                    // "https://api.wistia.com/v1/stats/events.json"
var visitor_url_stem = config.get("wistia.visitor_url_stem"); // "https://api.wistia.com/v1/stats/visitors/"
var api_password = config.get("wistia.api_password");         
var timezone_key = config.get("google.timezone_key");
var per_page = config.get("wistia.per_page");                 // 10
var connString = config.get("compose.postgres");              //  "postgres://<user>:<passwd>@sl-us-dal-9-portal.2.dblayer.com:10369/<db>"

var db = massive.connectSync({connectionString : connString}); 

function pull_timeline(ev) {
  return new Promise(function(resolve, reject) {
    var tData = [];
    var Heatmap = class { 
      constructor(id, vals) {
        this.id = id;
        this.vals = vals
      }
    };

    request(ev.iframe_heatmap_url, function(err, res, html) {
      if(!err) {
        var $ = cheerio.load(html);
        var script = $('body script').text();
        var heatmaps = {};
        eval(script);
        tData = heatmaps[_.keys(heatmaps)[0]].vals;
        resolve({timeline: tData});
      } else {
        reject(err);
      }
    });
  });
}

function key_visitor(e) {
  return new Promise(function(resolve, reject) {
    db.visitors.find({visitor_key: e.visitor_key}, function(err,res) {
      if(res.length === 0) {
        var visitor_url = visitor_url_stem + e.visitor_key + ".json?api_password=" + api_password;  

        request(visitor_url, function(err, res, json) {
          if(err) { reject(err);}
          console.log(json);
          var wistia_visitor = JSON.parse(json);

          //flatten and pick out attributes for dimension
          var visitor = _.pick(wistia_visitor, ["visitor_key", "created_at", "load_count", "play_count"]);
          visitor.browser = wistia_visitor.user_agent_details.browser;
          visitor.browser_version = wistia_visitor.user_agent_details.browser_version;
          visitor.platform = wistia_visitor.user_agent_details.platform;
          visitor.mobile = wistia_visitor.user_agent_details.mobile;

          db.visitors.insert(visitor, function(err, res) {
            if(err) { reject(err); }
            resolve({visitor_id: res.id});
          });
        });
      } else {
        resolve({visitor_id: res[0].id});
      }
    });
  });
}

function key_date_time_utc(e) {
  return new Promise(function(resolve, reject) {
    var curr_date = moment(e.received_at);
    resolve({date_utc: curr_date.format("YYYY-MM-DD"),
             time_utc: curr_date.format("HH:MM:SS")});
  });
}

function key_date_time_user(e) {
  return new Promise(function(resolve, reject) {
    var utc_dt = moment(e.received_at);
    var timestamp = utc_dt.unix();

    var url = "https://maps.googleapis.com/maps/api/timezone/json?location=" + 
              e.lat + "," + e.lon + "&key=" +
              timezone_key + "&timestamp=" + timestamp; 

    request(url, function(err, res, json) {
      if(err) { reject(err);}

      console.log(json);
      var timezone = JSON.parse(json);
      var offset = timezone.dstOffset + timezone.rawOffset;
      var local_dt = utc_dt.add(offset, "seconds");
      resolve({date_user: local_dt.format("YYYY-MM-DD"),
               time_user: local_dt.format("HH:MM:SS")});
    });
  });
}

function get_product_id(e) {
  return new Promise(function(resolve, reject) {
    db.products.findOne({media_id: e.media_id}, function(err, res) {
      if(err || res === undefined) {reject(err);};
      resolve({first_product_id: res.id});
    });
  });
}

function key_location(e) {
  return new Promise(function(resolve, reject) {
    var location_data = _.pick(e, ['ip', 'country', 'region', 'city', 'lat', 'lon', 'org']);
    db.locations.find(location_data, function(err,res) {
                         if(err) { reject(err);}
                         if(res.length === 0) {
                           db.locations.insert(location_data, function(err, inserted) {
                             if(err) { reject(err);}
                             resolve({location_id: inserted.id});
                           });
                         } else {
                           resolve({location_id: res[0].id});
                         }
    });
  });
}

function put_fact(ev) {
    var fact = _.pick(ev, ["date_utc", "time_utc",
                           "date_user", "time_user",
                           "visitor_id", "location_id",
                           "session_key"]);

    var tData = ev.timeline;
    var product_length = _.floor(tData.duration) + 1;
    var state = 0;
    var list = tData.timelineData;

    //ensure that there is always a begin and end with no viewing
    list.unshift([0,0]);
    list.push([product_length, 0]);

    _.each(_.range(0,product_length), function(second) {
      while(second >= _.head(list)[0]) {
        state = _.head(list)[1];
        list = _.tail(list);
      }

      fact.product_id = ev.first_product_id + second;
      fact.viewing_seconds = state;

      console.log(fact.product_id + " : " + fact.viewing_seconds);

      if(fact.viewing_seconds > 0) {
        db.viewing_facts.insert(fact, function(err, res) {
          console.log(err);
          console.log(res);
        });
      }
    });
}

function handle_event(session) {
  Promise.all([
    key_date_time_utc(session),
    key_date_time_user(session),
    key_visitor(session),
    key_location(session),
    get_product_id(session),
    pull_timeline(session)
  ])
  .then(function(resolutions) {
    var fact = _.assign({},{session_key: session.event_key}, ...resolutions);
    put_fact(fact);
  })
  .catch(console.log.bind(console));
};

function process_page(url, func, page_number, per_page) {
  var page_number = typeof page_number !== 'undefined' ? page_number : 1;
  var per_page = typeof per_page !== 'undefined' ? per_page : 100;
  var final_url = url + "?api_password=" +
                  api_password + "&per_page=" +
                  per_page + "&page=" + page_number;

  request(final_url, function(err, res, json) {
    if(!err) {
      var sessions = JSON.parse(json);
      var counter = sessions.length;
      console.log("Count: " + sessions.length);

      _.each(sessions, function(session) {
        func(session);
      });

      if(counter == per_page) {
        process_page(url, func, page_number + 1, per_page);
      } 
    }
  });
}

process_page(url, handle_event, 1);
