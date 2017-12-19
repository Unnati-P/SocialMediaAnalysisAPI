var express = require("express");
var _ = require("lodash");
const MongoClient = require('mongodb').MongoClient;
const Twitter = require('twitter');

var app = express();

var PORT = 5000;

const twitterClient = new Twitter({
  consumer_key: 'bC1TasFS1FLvKMhvrDpzs0Ocb',
  consumer_secret: 'PknWLz7MqnLmz3zBYpZ55s4N6MOWKYzlI4XtKRWyjyY5v1Dg0e',
  access_token_key: '938804144252391424-3QNUg9rnvLS2Ku60oJNssye8bXw98iI',
  access_token_secret: '6f1BvYdj7fwesgUqIqqvn10ag9bVD8qJXrXZh1cq0eZZh',
});

var db;

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-ACCESS_TOKEN, Access-Control-Allow-Origin, Authorization, Origin, x-requested-with, Content-Type, Content-Range, Content-Disposition, Content-Description");
    next();
});

app.get('/hashtags', function(req, res){
  twitterClient.get('trends/place', {id: 2295402}, function(errors, tweets, response){
    return res.send({response: JSON.parse(response.body)});
  });
});

MongoClient.connect('mongodb://ajay:123456@ds135186.mlab.com:35186/tweets', function(err, db) {
  console.log("Connected successfully to server");

  app.get("/fetchtweets", function (req, res) {
    console.log("fetching tweets");
    db.collection("ockhitweets").find({}, {retweeted: 1}).limit(100).toArray(function(err, docs){
      return res.send({results: docs});
    })
  });

  //This endpoint will give the number of tweets retweeted in case of smog in Delhi
  app.get("/getpollutionretweets", function (req, res) {
    var query = db.collection("pollutiondump").find({}, {retweet_count: 1});

    query.toArray(function(err, docs){
      var retweeted = 0,
        not_retweeted = 0;

      _.forEach(docs, function(doc){
        if(doc.retweet_count > 0){
          retweeted++;
        } else {
          not_retweeted++;
        }
      })

      return res.send({retweeted: retweeted, not_retweeted: not_retweeted});
    })
  });

  //This endpoint will give the number of tweets retweeted in case of ockhi cyclone
  app.get("/getockhiretweets", function (req, res) {
    var query = db.collection("ockhidump").find({}, {retweet_count: 1});

    query.toArray(function(err, docs){
      var retweeted = 0,
        not_retweeted = 0;

      _.forEach(docs, function(doc){
        if(doc.retweet_count > 0){
          retweeted++;
        } else {
          not_retweeted++;
        }
      })

      return res.send({retweeted: retweeted, not_retweeted: not_retweeted});
    })
  });

  //This endpoint will give the locations of users
  app.get("/getpollutiontweetslocations", function (req, res) {
    var query = db.collection("pollutiondump").find({}, {"user.location": 1});

    query.toArray(function(err, docs){
      const results = _.groupBy(docs, function(doc){
        return doc.user.location;
      });

      const resu = {};
      _.forEach(results, function(value, key){
        if(!key){
          key = "others";
        }
        if(value.length >= 80){
          resu[key] = value.length;
        }
      })

      return res.send({"results": resu});
    })
  });

  //This endpoint will give the locations of users
  app.get("/getockhitweetslocations", function (req, res) {
    var query = db.collection("ockhidump").find({}, {"user.location": 1});

    query.toArray(function(err, docs){
      const results = _.groupBy(docs, function(doc){
        return doc.user.location;
      });

      const resu = {};
      _.forEach(results, function(value, key){
        if(!key){
          key = "others";
        }
        if(value.length >= 80){
          resu[key] = value.length;
        }
      })

      return res.send({"results": resu});
    })
  });

  //This endpoint will give the favorites of tweets
  app.get("/getpollutiontweetsfavorites", function (req, res) {
    var query = db.collection("pollutiondump").find({}, {"favorite_count": 1});

    query.toArray(function(err, docs){
      const results = _.groupBy(docs, function(doc){
        return doc.favorite_count;
      });

      const resu = {};
      _.forEach(results, function(value, key){
        if(key > 0){
          resu[key] = value.length;
        }
      })
      //key: 0-5, 5-10, values: numbers
      return res.send({"results": resu});
    })
  });

  app.get("/getockhitweetsfavorites", function (req, res) {
    var query = db.collection("ockhidump").find({}, {"favorite_count": 1});

    query.toArray(function(err, docs){
      const results = _.groupBy(docs, function(doc){
        return doc.favorite_count;
      });

      const resu = {};
      _.forEach(results, function(value, key){
        if(key > 0){
          resu[key] = value.length;
        }
      })
      //key: 0-5, 5-10, values: numbers
      return res.send({"results": resu});
    })
  });

  //This endpoint will give number of tweets contains media, media+text and just text
  app.get("/getpollutiontweetsmedia", function (req, res) {
    var query = db.collection("pollutiondump").find({}, {"entities.media": 1, "text": 1});

    query.toArray(function(err, docs){
      const resu = {
        "Text": 0,
        "Image And Text": 0,
      };

      _.forEach(docs, function(value, key){
        if(_.isEmpty(value.entities)){
          resu["Text"]++;
        } else if(!_.isEmpty(value.text) && !_.isEmpty(value.entities.media)){
          resu["Image And Text"]++;
        }
      })
      //key: 0-5, 5-10, values: numbers
      return res.send({"results": resu});
    })
  });

  app.get("/getockhitweetsmedia", function (req, res) {
    var query = db.collection("ockhidump").find({}, {"entities.media": 1, "text": 1});

    query.toArray(function(err, docs){
      const resu = {
        "Text": 0,
        "Image And Text": 0,
      };

      _.forEach(docs, function(value, key){
        if(_.isEmpty(value.entities)){
          resu["Text"]++;
        } else if(!_.isEmpty(value.text) && !_.isEmpty(value.entities.media)){
          resu["Image And Text"]++;
        }
      })
      //key: 0-5, 5-10, values: numbers
      return res.send({"results": resu});
    })
  });

  app.get("/getockhiretweets", function (req, res) {
    var query = db.collection("ockhidump").find({}, {retweet_count: 1});

    query.toArray(function(err, docs){
      var retweeted = 0,
        not_retweeted = 0;

      _.forEach(docs, function(doc){
        if(doc.retweet_count > 0){
          retweeted++;
        } else {
          not_retweeted++;
        }
      })

      return res.send({retweeted: retweeted, not_retweeted: not_retweeted});
    })
  });

  app.get("/", function(req, res){
    return res.send("hello world");
  });

  app.get("/makeNewOckhiCollection", function (req, res) {
    console.log("fetching tweets");

    var kk = 0;
    for(var i=0;i<40;i++){
      db.collection("ockhitweets").find().skip(i > 0 ? ((i-1)*500) : 0).limit(500).toArray(function(err, docs){
        const newDocs = _.map(docs, function(doc, index){
          // console.log(doc[_.keys(doc)[1]]);
          return doc[_.keys(doc)[1]] || doc;
        });

        _.forEach(newDocs, function(doc){
          if(!_.isEmpty(doc)) {
            db.collection("ockhidump").insert(doc);
            console.log(kk++);
          }
        })
      })
    }
  });
});

app.listen(PORT, function() {
	console.log("server is listening to port 5000");
});
