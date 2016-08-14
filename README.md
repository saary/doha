# doha (DigitalOcean HA)
DigitalOcean High Availability Monitor (via floating IPs)

# Description
A basic monitors that pings a given primary URL (every second by default).
When it detects a problem it makes sure that the secondary node is ready to be switched to and uses DigitalOcean API in order to point the float IP to the secondary droplet.

# Usage
```
var primaryUrl = argv.primary || process.env.PRIMARY_URL; // The primary url to monitor
var secondaryUrl = argv.secondary || process.env.SECONDARY_URL; // The secondary url to which we fallback
var doToken = argv.token || process.env.DO_TOKEN; // DigitalOcean API token
var dropletId = argv.droplet || process.env.DROPLET_ID; // The droplet id to whcih we fallback in case of an error
var floatingIp = argv.floatingIp || process.env.FLOATING_IP; // The floating ip which we direct to the droplet
var heartbeatRate = argv.rate || process.env.HEARTBEAT_RAT || 1000; // The rate in which we check the primary url (ms)
```


# Example
```
node index.js --primary https://<main url>/ping --secondary http://127.0.0.1/ping --token <DO token> --floatingIp <DO floating ip> --droplet <droplet id>
```


