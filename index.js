var co = require('co');
var wait = require('co-wait');
var request = require('co-request');
var digitalocean = require('digitalocean');
var parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2));

var primaryUrl = argv.primary || process.env.PRIMARY_URL; // The primary url to monitor
var secondaryUrl = argv.secondary || process.env.SECONDARY_URL; // The secondary url to which we fallback
var doToken = argv.token || process.env.DO_TOKEN; // DigitalOcean API token
var dropletId = argv.droplet || process.env.DROPLET_ID; // The droplet id to whcih we fallback in case of an error
var floatingIp = argv.floatingIp || process.env.FLOATING_IP; // The floating ip which we direct to the droplet
var heartbeatRate = argv.rate || process.env.HEARTBEAT_RAT || 1000; // The rate in which we check the primary url (ms)

var client = digitalocean.client(doToken); 

co(function*() {
  while (true) {
    // ping the main service
    let res = yield request.get(primaryUrl);
    if (res.statusCode === 200) {
      // all is fine, wait a second and recheck
      wait(heartbeatRate);
      continue;
    }

    console.error('Failed to get 200 answer from %s got [%s]', primaryUrl, res.statusCode, res.body);

    // -- something is wrong
    // ping local service to make sure we are ready to switch to this instance
    let secondaryRes = yield request.get(secondaryUrl);
    if (secondaryRes.statusCode !== 200) {
      // local instance is not ready, retry from the top
      console.error('Failed to get 200 answer from %s got [%s]', secondaryUrl, secondaryRes.statusCode, secondaryRes.body);
      wait(10000);
      continue;
    }

    try {
      console.log('Assigning floating ip %s to droplet %s', floatingIp, dropletId);

      let assign = yield client.floatingIps.assign(floatingIp, dropletId);
      console.log('Assign result: ', assign);
      wait(heartbeatRate);
    }
    catch(err) {
      console.error('Faile to assign floating ip to %s', dropletId, err);
    }  
  }
});