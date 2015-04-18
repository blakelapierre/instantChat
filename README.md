Live Server: https://instaChat.io

To Run:
```
    cd site
    npm install
    grunt serve
```

Hashtag-based party chat via WebRTC


Broadcast

  We should track every 'event' that occurs so that the broadcast can be recreated at peers and so that it can be recorded and played back later.

  -time broadcast started

{
  start: dateTime,
  events: [
    {t: time_of_event, d: eventData}
  ]
}

eventData: {
  type: 'type of event',
  d: typeData
}

function BroadcastData(time) {
  var data {
    start: time,
    events: []
  };

  return data;
}

function BroadcastController(broadcastData, clock) {
  function injectEvent(event) {
    broadcastData.events.push({t: clock.tick(), e: [event]});
  }

  function injectEvents(events) {
    broadcastData.events.push({t: clock.tick(), e: events});
  }

  return {
    injectEvent,
    injectEvents
  }
}

function startBroadcast() {
  var data = new BroadcastData(new Date().getTime()),
      controller = new BroadcastController(data);

  return {
    data,
    controller
  };
}