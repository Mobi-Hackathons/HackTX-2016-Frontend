var momentNow = parseInt(moment().format('x'));
var momentPrevious = parseInt(moment().subtract(1,'years').format('x'));
//create default moments

var app = new Vue({
  el: '#app',
  data: {
    show: 'map',
    message: 'Hello Vue!',
    filters: [
      {
        title: 'Surprising',
        icon: 'face_surprise',
        selected: true
      },
      {
        title: 'Haha',
        icon: 'face_laugh',
        selected: true
      },
      {
        title: 'Love',
        icon: 'face_love',
        selected: true
      },
      {
        title: 'Angry',
        icon: 'face_angry',
        selected: true
      },
      {
        title: 'Sad',
        icon: 'face_sad',
        selected: true
      }
    ],
    startDate:{
        date:'test'
    },
    endDate:{
        date:'test'
    }
  },
  created: function() {
    console.log('created!');
    setInterval(this.showEarthy, 5000);
  },
  methods: {
    toggleView: function() {
      console.log('pressed');
      if(this.show === 'map') this.show = 'graph';
      else this.show = 'map';
    },
    hideEarthy: function() {
        $("#earthy-message").hide();
    },
    showEarthy: function() {
        $("#earthy-message").show();
    }
  }
});

// Slider
var slider = document.getElementById('slider');

noUiSlider.create(slider, {
	// Create two timestamps to define a range.
    range: {
        'min': momentPrevious,
        'max': momentNow
    },
    connect: true,

    // Steps of one week
    step: 7 * 24 * 60 * 60 * 1000,

    // Two more timestamps indicate the handle starting positions.
    start: [ momentPrevious, momentNow],
});

var dateLabels=[];

// ChartJS
var radarContext = document.getElementById("radar-chart").getContext("2d");
var lineContext = document.getElementById("line-chart").getContext("2d");

var radarData = {
    labels: ["Surprising", "Haha", "Love", "Angry", "Sad"],
    datasets: [
        {
            label: "My First dataset",
            backgroundColor: "rgba(179,181,198,0)",
            borderColor: "rgba(179,181,198,1)",
            pointBackgroundColor: "rgba(179,181,198,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(179,181,198,1)",
            data: [65, 59, 90, 81, 75]
        }
    ]
};

var radarChart = new Chart(radarContext, {
    type: 'radar',
    backgroundColor:"#FFFFFF",
   // title:{text:"test"},
    data: radarData
   // options: {chartArea:{backgroundColor:'rgba(250,250,250,1)'}}
});


var lineData = {
    labels: dateLabels,
        datasets: [
            {
                label: "Mood Trends Over Time",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [1, 2, 1, 3, 5, 1, 5],
                spanGaps: false,
            }
        ]
    }

var lineChart = new Chart(lineContext,{
    type:'line',
    backgroundColor:"#FF0000",
    data:lineData
})



slider.noUiSlider.on('update', function( values, handle ) {
    // moving left bar
    if(handle==0){
        dateLabels=[];
        var tempNow = moment(parseInt(values[handle]));
        var tempThen = moment(parseInt(values[1]));
        app.startDate.date= moment(parseInt(values[handle])).format('MM-DD-YYYY');
        // push dates onto date labels
        while(tempNow.isBefore(tempThen)){
            dateLabels.push(tempNow.format('MM-DD-YYYY'));
            tempNow.add(1,'week');
        }
        
        //override date (x axis) labels
        lineData.labels = dateLabels;
        // create new line chart and override old one (kinda shitty, probably a memory leak)
        var lineChart = new Chart(lineContext,{
            type:'line',
            backgroundColor:"#FF0000",
            data:lineData
        })
    }else{
        dateLabels=[];
        var tempNow = moment(parseInt(values[0]));
        var tempThen = moment(parseInt(values[handle]));
        app.endDate.date= moment(parseInt(values[handle])).format('MM-DD-YYYY');
        // update data

        // push dates onto date labels
        while(tempThen.isAfter(tempNow)){
            dateLabels.unshift(tempThen.format('MM-DD-YYYY'));
            tempThen.subtract(1,'week');
        }

        
        //override date (x axis) labels
        lineData.labels = dateLabels;
        // create new line chart and override old one (kinda shitty, probably a memory leak)
        var lineChart = new Chart(lineContext,{
            type:'line',
            backgroundColor:"#FF0000",
            data:lineData
        })
        
    }
    

});



// Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoidXRhLW1vYmkiLCJhIjoiNTU0N2FiOWM2NjEyMzUyNjc4NTg5M2I1MGM0YjM2N2IifQ.S4guINAIENtuxT6KVlId-g';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-103.59179687498357, 40.66995747013945],
    zoom: 3
});


map.on('load', function() {

    // Add a new source from our GeoJSON data and set the
    // 'cluster' option to true.
    map.addSource("earthquakes", {
        type: "geojson",
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: "earthquakes.geojson",
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    // Use the earthquakes source to create five layers:
    // One for unclustered points, three for each cluster category,
    // and one for cluster labels.
    map.addLayer({
        "id": "unclustered-points",
        "type": "symbol",
        "source": "earthquakes",
        "filter": ["!has", "point_count"],
        "layout": {
            "icon-image": "marker-15"
        }
    });

    // 5 layers per emotion
    // sad = 000080 = navy
    // surprising = DFF51D = yellow
    // love = EE1DF5 = pink
    // angry = F51D1D = red
    // haha = FF7700 = orange
    var layers = [
        [200, '#000080'],
        [150, '#ee1df5'],
        [100, '#f51d1d'],
        [70, '#DFF51D'],
        [0, '#ff7700']
    ];

    layers.forEach(function (layer, i) {
        console.log(i);
        map.addLayer({
            "id": "cluster-" + i,
            "type": "circle",
            "source": "earthquakes",
            "paint": {
                "circle-color": layer[1],
                "circle-radius": 18
            },
            "filter": i === 0 ?
                [">=", "point_count", layer[0]] :
                ["all",
                    [">=", "point_count", layer[0]],
                    ["<", "point_count", layers[i - 1][0]]]
        });
    });

    // Add a layer for the clusters' count labels
    map.addLayer({
        "id": "cluster-count",
        "type": "symbol",
        "source": "earthquakes",
        "layout": {
            "text-field": "{point_count}",
            "text-font": [
                "DIN Offc Pro Medium",
                "Arial Unicode MS Bold"
            ],
            "text-size": 12
        }
    });
});

map.on('click', function (e) {
    console.log('clicked');
    console.log(e);
    // Use queryRenderedFeatures to get features at a click event's point
    // Use layer option to avoid getting results from other layers
    var features = map.queryRenderedFeatures(e.point, { layers: ['earthquakes'] });
    // if there are features within the given radius of the click event,
    // fly to the location of the click event
    if(features.length) {
      console.log(features[0]);
    }
});