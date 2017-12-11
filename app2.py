from flask import Flask
import tweepy
from tweepy import OAuthHandler
import json
import time
from flask_cors import CORS
from flask_pymongo import PyMongo

app = Flask(__name__)
CORS(app)

app.config['MONGO_DBNAME'] = 'tweets'
app.config['MONGO_URI'] = 'mongodb://ajay:123456@ds135186.mlab.com:35186/tweets'

mongo = PyMongo(app)


def load_api():
    consumer_key = "bC1TasFS1FLvKMhvrDpzs0Ocb"
    consumer_secret = "PknWLz7MqnLmz3zBYpZ55s4N6MOWKYzlI4XtKRWyjyY5v1Dg0e"
    access_key = "938804144252391424-3QNUg9rnvLS2Ku60oJNssye8bXw98iI"
    access_secret = "6f1BvYdj7fwesgUqIqqvn10ag9bVD8qJXrXZh1cq0eZZh"

    auth = OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_key, access_secret)
    return tweepy.API(auth)


def tweet_search(api, query, max_tweets):  # , max_id):
    searched_tweets = []
    while len(searched_tweets) < max_tweets:
        remaining_tweets = max_tweets - len(searched_tweets)
        try:
            new_tweets = api.search(q=query, count=remaining_tweets)
            if not new_tweets:
                print('no tweets found')
                break
            searched_tweets.extend(new_tweets)
        except tweepy.TweepError:
            print('Error')
            time.sleep(1 * 60)
            break
    return searched_tweets


# This API will give tweets of pollution tweets by hashtags, used this for retweet ratio (Total number of tweets present: 10048)
@app.route('/fetchTweetsPollution')
def get_tweets_from_local_pollution():
    search_phrases = ['#CropBurning', '#Smog', '#MyRightToBreathe', '#Delhipollution', '#DelhiSmog', '#smog',
                      '#delhismog']

    max_tweets = 5

    returned_tweets = []
    pollution_tweets = mongo.db.pollutiontweetsDump

    for search_phrase in search_phrases:
        api = load_api()
        tweets = tweet_search(api, search_phrase, max_tweets)
        for t in tweets:
            pollution_tweets.insert_one(t._json)
            returned_tweets.append(t._json)

    print(len(returned_tweets))
    return json.dumps(returned_tweets)


# This API will give tweets of ockhi tweets by hashtags, used this for retweet ratio (Total number of tweets present: 4830)
@app.route('/fetchTweetsOckhi')
def get_tweets_from_local_ockhi():
    search_phrases = ['#MumbaiRains', '#CycloneOckhi', '#OckhiCyclone', 'Ockhi']

    max_tweets = 2500

    returned_tweets = []
    ockhi_tweets = mongo.db.ockhitweets

    for search_phrase in search_phrases:
        api = load_api()
        tweets = tweet_search(api, search_phrase, max_tweets)
        for t in tweets:
            ockhi_tweets.insert_one({json.dumps(t._json['id']): t._json})
            returned_tweets.append(t._json)

    print(len(returned_tweets))
    return json.dumps(returned_tweets)


@app.route('/getData')
def get_stats():
    search_phrases = ['#CropBurning', '#Smog', '#MyRightToBreathe', '#Delhipollution', '#DelhiSmog']

    max_tweets = 2

    returned_tweets = []
    pollution_tweets = mongo.db.PollutionDelhiDump

    for search_phrase in search_phrases:
        api = load_api()
        tweets = tweet_search(api, search_phrase + 'point_radius:[77.216721 28.644800 25mi] OR place:Delhi',
                              max_tweets, )
        for t in tweets:
            pollution_tweets.insert_one(t._json)
            returned_tweets.append(t._json)

    print(len(returned_tweets))
    return json.dumps(returned_tweets)


@app.route('/', methods=['GET', 'OPTIONS'])
def appStart():
    return "hello world"


if __name__ == '__main__':
    app.run()
