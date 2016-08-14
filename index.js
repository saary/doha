var co = require('co');
var wait = require('co-wait');
var request = require('co-request');
var digitalocean = require('digitalocean');
var parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2));

var mainUrl = argv.main || process.env.MAIN_URL;
var localUrl = argv.local || process.env.LOCAL_URL;
var doToken = argv.token || process.env.DO_TOKEN;
var dropletId = argv.droplet || process.env.DROPLET_ID;
var floatingIp = argv.floatingIp || process.env.FLOATING_IP;
var rate = argv.rate || 1000;

var client = digitalocean.client(doToken); 

co(function*() {
  while (true) {
    // ping the main service
    let res = yield request.get(mainUrl);
    if (res.statusCode === 200) {
      // all is fine, wait a second and recheck
      wait(rate);
      continue;
    }

    console.error('Failed to get 200 answer from %s got [%s]', mainUrl, res.statusCode, res.body);

    // -- something is wrong
    // ping local service to make sure we are ready to switch to this instance
    let localRes = yield request.get(localUrl);
    if (localRes.statusCode !== 200) {
      // local instance is not ready, retry from the top
      console.error('Failed to get 200 answer from %s got [%s]', localUrl, localRes.statusCode, localRes.body);
      wait(10000);
      continue;
    }

    try {
      console.log('Assigning floating ip %s to droplet %s', floatingIp, dropletId);

      let assign = yield client.floatingIps.assign(floatingIp, dropletId);
      console.log('Assign result: ', assign);
      wait(rate);
    }
    catch(err) {
      console.error('Faile to assign floating ip to %s', dropletId, err);
    }  
  }
});