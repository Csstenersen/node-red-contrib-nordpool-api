
## Node Red Nordpool API

A Node-Red Node for collecting "day ahead" prices from NorpoolGroup.

## Installation

Go to your Node-RED user folder (e.g. ~/.node-red) and run:

```
sudo npm i node-red-contrib-nordpool-api
```

## Usage

The area, currency and time span can be changed by selecting from the drop down menu in the properties:

![alt text](https://github.com/Csstenersen/2019/blob/master/png/example.png?raw=true "Example")

### example:
Use a inject node to trigger a request to nordpool

If the current time has passed 15:00 it returns an array of 48 objects. one pr.hour for this day and the day ahead.

If the current time is before 15:00 it returns an array of 24 objects. one pr.hour for current day. This i because the "day ahead" prices may not be published at this time. 

Objects contains this properties: `Area`, `Valuta`, `Price` `StartTime`, `EndTime` and `Timestamp`.


![alt text](https://github.com/Csstenersen/2019/blob/master/png/example3.png?raw=true "Example")

### Example with UI chart:

Use a function node to convert `msg` to values readable for UI chart node:
![alt text](https://github.com/Csstenersen/2019/blob/master/png/example5.png?raw=true "Example")

the function node in this example contains:

````
var msg1 = {}
for (var i = 0; i<msg.payload.length;i++){
    msg1 = {
        topic:msg.payload[i].Area + " " + msg.payload[i].Valuta, 
        payload:msg.payload[i].Price, 
        timestamp:msg.payload[i].Timestamp,
        }
    node.send(msg1)
    }
return;
````

the result is that the function node pushes a payload for every object in `msg`:

![alt text](https://github.com/Csstenersen/2019/blob/master/png/example7.png?raw=true "Example")

result in UI:

![alt text](https://github.com/Csstenersen/2019/blob/master/png/example6.png?raw=true "Example")

v3.0.6:
Added "StartTime" and "EndTime" properties to payload. 
Added timespan to properties. 
Added topic to msg to be either "hourly", "daily", "weekly" or "monthly" based on the configuration of the node
Added areas AT, BE, DE-LU, FR, NL Some bugging appears on those areas with weekly and monthly prices. 

v3.0.5: 
Bugfix with price values above 1000 

