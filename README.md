# visualization-snapshot
A state management system for implicit and explicit re-visitation in state based visualizations and dashboards.

Install the package 

```npm install @kiranbandi/snapshot```

Import the required functions

```import { initializeSnapshot, updateSnapshot } from '@kiranbandi/snapshot';```

Set the class 'snapshot' on the canvas or svg element that you want to be stored as a thumbnail in each snapshot.

Then initialize snapshot by setting the automatic timer mode and interval (milliseconds), thumbnail options such as its class name, size and type and finally a callback that gets called with the data in the snapshot, that needs to be handled by you to update the visualization 

``` 
  initializeSnapshot(true, 1000,
    {
    'class': '.snapshot',
    'type': 'svg',
    'size': { 'width': 100, 'height': 100 }
    },
    (data) => { // update visualization with new data });
```

Finally call update snapshot everytime data to the chart is being updated so that snapshot module can access the latest available data 

```updateSnapshot(data);```
