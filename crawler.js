var cheerio = require('cheerio'),
    q = require('q'),
    request = require('request');

var startUrl = 'http://www.ektoplazm.com/style/psy-dub';

function delayIterate (list, fn, pause) {
  var defer = q.defer();
  var run = function () {
    if (list.length > 0) {
      var next = list.pop();
      q.when(fn(next)).then(function () {
        setTimeout(function () {
          run();
        }, pause);
      });
    } else {
      defer.resolve();
    }
  }
  run();
  return defer;
}

function downloadZip (info) {
  var defer = q.defer();
  request(info.url).pipe(fs.createWriteStream(info.title)).on('close', function () {
    console.log('Finished download of zip: ' + info.title);
    defer.resolve();
  }).on('error', defer.reject);
  return defer;
}

function debug (info) {
  var defer = q.defer();
  setTimeout(function () {
    console.log('Finished download of zip: ' + info.title);
    defer.resolve();
  }, 100);
  return defer;
}

function scanPage (err, response, html) {
  if (err) {
    throw err;
    return;
  }
  if (response === 200) {
    console.log("We're golden");
  }
  var $ = cheerio.load(html);

  var posts = $('.post');
  console.log(posts.length);
  var queue = [];
  posts.each(function () {
    var title = $(this).find('h1').text();
    var url = $(this).find('.dll a').filter(function () {
      return /mp3/ig.test($(this).text());
    }).attr('href');
    console.log('title', title, url);
    queue.push({title: title, url: url});
  });
  console.log('queue', queue);
  q.when(delayIterate(queue, debug, 1000)).then(function () {
    console.log('Fin');
  });
}

request(startUrl, scanPage);
