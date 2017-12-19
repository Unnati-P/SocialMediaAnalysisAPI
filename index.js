var express = require("express");
var _ = require("lodash");
const MongoClient = require('mongodb').MongoClient;

var app = express();

var PORT = 5000;

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

  app.get("/getmentionsnodes", function (req, res) {
    var query = db.collection("ockhidump").find({}, {"user.screen_name": 1, "entities.user_mentions": 1});

    query.toArray(function(err, docs){
      var count=1;
      const nodes = [];
     _.forEach(docs, function(value1, key1){
          var data = {
            id : value1.user.screen_name,
            group : count
          };
          nodes.push(data);

          _.forEach(value1.entities, function(value2, key2) {
            var c =0;
            if(!_.isEmpty(value2)) {

            var data = {
              id : value2[c].screen_name,
              //group : count
            };
            c++;
            //console.log(value2);
            nodes.push(data);
            }
          })
        count++;
        })



      //console.log(count);
      return res.send(nodes);

  })
 });

 app.get("/getmentionslinks", function (req, res) {
   var query = db.collection("ockhidump").find({}, {"user.screen_name": 1, "entities.user_mentions": 1});

   query.toArray(function(err, docs){

     var links = [];
     var count=1;
     var nodes = [];
    _.forEach(docs, function(value1, key1){
         var data = {
           id : value1.user.screen_name,
           //group : count
         };
         nodes.push(data);

         _.forEach(value1.entities, function(value2, key2) {
           var c =0;
           if(!_.isEmpty(value2)) {

           var data = {
             id : value2[c].screen_name,
             //group : count
           };
           c++;
           //console.log(value2);
           nodes.push(data);
           }
         })
       count++;
       })
       var newNodes = _.uniqWith(nodes, _.isEqual);

    _.forEach(docs, function(value1, key1){
         _.forEach(value1.entities, function(value2, key2) {
           var c =0;
           if(!_.isEmpty(value2)) {

           var data = {
             source : value1.user.screen_name,
             target : value2[c].screen_name,
             //value : 1
           };
           c++;
           //console.log(value2);
           links.push(data);
           }
         })
       count++;
       })
       var newLinks = _.uniqWith(links, _.isEqual);

       const parent = {
         "nodes" : newNodes,
         "links" : newLinks
       };


     console.log(count);
     return res.send( parent);

 })
 });

  app.get("/getgraph", function (req, res) {
    var query = db.collection("pollutiondump").find({}, {"user.screen_name": 1, "entities.user_mentions": 1});

    query.toArray(function(err, docs){

      const parent = {};
      _.forEach(docs, function(value1, key1){
          _.forEach(value1.entities.user_mentions, function(value2, key2){
            var arr = [];
            parent[value2.screen_name] = arr;
          })

          _.forEach(value1.entities.user_mentions, function(value4, key4){
            var name = value1.user.screen_name;
              console.log(parent[value4.screen_name]);
          //  console.log(value1.user.screen_name, "-->", value4.screen_name);
            parent[value4.screen_name].push(name);

          })
      })
      //console.log(count);
      return res.send({"results": parent});

  })
});

app.get("/getnodes", function (req, res) {
  var query = db.collection("ockhidump").find({}, {"user.screen_name": 1});

  query.toArray(function(err, docs){

    const nodes = [];
    _.forEach(docs, function(value, key) {
      var data = {
          label :  value.user.screen_name
      }
      nodes.push(data);
      //console.log(value.user.screen_name);
    })
    //console.log(resu);
      return res.send(nodes);
  });


});

app.get("/getotherreply", function (req, res) {
  var query = db.collection("ockhidump").find({}, {"user.screen_name": 1, "in_reply_to_screen_name": 1});

  query.toArray(function(err, docs){

    const nodes = [];
    _.forEach(docs, function(value, key) {
      var data = {
          label :  value.user.screen_name
      }
      nodes.push({ node : data});
      //console.log(value.user.screen_name);
    })
    //console.log(resu);
      return res.send(nodes);
  });


});

app.get("/getlinksreply", function (req, res) {
  var query = db.collection("ockhidump").find({}, {"user.screen_name": 1, "in_reply_to_screen_name": 1 });

  query.toArray(function(err, docs){

    const links = [];
    _.forEach(docs, function(value, key) {
      if(!_.isEmpty(value.in_reply_to_screen_name)) {
      var data = {
          source :  value.user.screen_name,
          target : value.in_reply_to_screen_name,
          weight : 1
      };
      links.push(data);
    }
      //console.log(value.user.screen_name);
    })
    //console.log(resu);
      return res.send(links);
  });


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
