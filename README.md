# doha
Digital Ocean High Availability Monitor (Via floating IPs)

# Description
A basic monitors that pings a given URL every second, when it detects a problem it makes sure that the local node is ready to be switched and it uses DigitalOcean API in order to point the float IP to the secondary droplet

# Usage
```
node index.js --main https://<main url>/ping --local http://127.0.0.1/ping --token <DO token> --floatingIp <DO floating ip> --droplet <droplet id>
```


