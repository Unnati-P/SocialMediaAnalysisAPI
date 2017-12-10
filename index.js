var express = require("express");
var _ = require("lodash");
const MongoClient = require('mongodb').MongoClient;

var app = express();

var PORT = 3045;

var db;

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-ACCESS_TOKEN, Access-Control-Allow-Origin, Authorization, Origin, x-requested-with, Content-Type, Content-Range, Content-Disposition, Content-Description");
    next();
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
    var query = db.collection("ockhitweets").find({}, {retweet_count: 1});

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

  // app.get("/makeNewOckhiCollection", function (req, res) {
  //   console.log("fetching tweets");
  //
  //   for(var i=0;i<20;i++){
  //     db.collection("ockhitweets").find().skip(i > 0 ? ((i-1)*500) : 0).limit(500).toArray(function(err, docs){
  //       const newDocs = _.map(docs, function(doc, index){
  //         console.log(doc[_.keys(doc)[1]]);
  //         return doc[_.keys(doc)[1]];
  //       });
  //       _.forEach(newDocs, function(doc){
  //           db.collection("ockhidump").insert(doc);
  //       })
  //     })
  //   }
  // });
});

app.listen(PORT, function() {
	console.log("server is listening to port 3045");
});
