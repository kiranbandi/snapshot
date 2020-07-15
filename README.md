# visualization-snapshot
A state management system for implicit and explicit re-visitation in state based visualizations and dashboards.


```import { initializeSnapshot, updateSnapshot } from '@kiranbandi/snapshot';```

Initialize snapshot by settting the automatic to true or false and the timer in milliseconds and a callback that gets called with the data in the snapshot, that needs to be handled by you to update the visualization 

```initializeSnapshot(true, 1000, (data) => { updateChart(data) });```

Call update snapshot everytime data to the chart is being updated so that snapshot module can access the latest available data 

```updateSnapshot(configuration);```
