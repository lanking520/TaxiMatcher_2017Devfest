var timeFactor = 0.005; //number of minutes in real life to a second in the viz
$('.timeFactor').html(timeFactor); //Displays the timeFactor in the UI.
var tweenToggle = 0;

// var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
//   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
// });
var tiles = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

var topLeft,bottomRight;

var time = moment();
var map = L.map('map',{ zoomControl:false })
.addLayer(tiles)
.setView([40.7127, -74.0059], 14);


var running = {
    "fare":0,
    "surcharge":0,
    "mtatax":0,
    "tolls":0,
    "tip":0,
    "total":0,
    "passengers":0
} ;



var svg = d3.select(map.getPanes().overlayPane).append("svg"),
g = svg.append("g").attr("class", "leaflet-zoom-hide");

//listeners

$('.slower').click(function(){
    if(timeFactor > 1){
        timeFactor -= 1;
    };

    $('.timeFactor').html(timeFactor);

});

$('.faster').click(function(){
    timeFactor += 1;
    $('.timeFactor').html(timeFactor);

});

$('.reload').click(function(){
    location.reload();
});

var transform = d3.geo.transform({
    point: projectPoint
}),
d3path = d3.geo.path().projection(transform);

var timer;

function updateTimer() {
    time.add('minutes',1);
    $('.readableTime').text(time.format('h:mm a'));
    $('.date').text(time.format('dddd, MMMM Do YYYY'));
    timer = setTimeout(function(){updateTimer()},(1000/timeFactor));
}

//get a random number between 0 and 11
var number = Math.floor(Math.random() * 15)

$.get("/data", loadData);

function loadData(data) {
  var routes = [], data = JSON.parse(data);
  $.each(data, function(i, prev) {
    if (i < data.length - 1) {
      next = data[i + 1];
      routes.push({
        "type": "Feature",
        "properties": {
            "passengers": "1",
            "total": "0",
            "pickuptime": parseInt(prev.drop_time * 1000),
            "dropofftime": parseInt(next.start_time * 1000),
            "hasfare": false
        },
        sour: {lat: parseFloat(prev.dropLat.toFixed(6)), lon: parseFloat(next.dropLgn.toFixed(6))},
        dest: {lat: parseFloat(next.pickLat.toFixed(6)), lon: parseFloat(next.pickLgn.toFixed(6))}
      });
      routes.push({
        "type": "Feature",
        "properties": {
            "passengers": "1",
            "total": next.total,
            "pickuptime": parseInt(next.start_time),
            "dropofftime": parseInt(next.drop_time),
            "hasfare": true
        },
        sour: {lat: parseFloat(next.pickLat.toFixed(6)), lon: parseFloat(next.pickLgn.toFixed(6))},
        dest: {lat: parseFloat(next.dropLat.toFixed(6)), lon: parseFloat(next.dropLgn.toFixed(6))}
      });
    }
  });
  // routes = [
  //   {
  //     "type": "Feature",
  //     "properties": {
  //         "passengers": "1",
  //         "total": "12",
  //         "pickuptime": "4/17/13 0:19",
  //         "dropofftime": "4/17/13 0:32",
  //         "hasfare": true
  //     },
  //     sour: {lat: 40.64857, lon: -73.78299},
  //     dest: {lat: 40.7635, lon: -73.96539}
  //   }, {
  //     "type": "Feature",
  //     "properties": {
  //         "pickuptime": "4/17/13 0:32",
  //         "dropofftime": "4/17/13 1:01",
  //         "hasfare": false
  //     },
  //     sour: {lat: 40.7635, lon: -73.96539},
  //     dest: {lat: 40.76418, lon: -73.96676}
  //   }, {
  //     "type": "Feature",
  //     "properties": {
  //         "passengers": "1",
  //         "total": "7.5",
  //         "pickuptime": "4/17/13 5:38",
  //         "dropofftime": "4/17/13 5:42",
  //         "hasfare": true
  //     },
  //     sour: {lat: 40.76418, lon: -73.96676},
  //     dest: {lat: 40.76641, lon: -73.89462}
  //   }
  // ];

  var emptyKey = 0, fullKey = 0, ajaxPool = [];
  $.each(routes, function(i, d){
    if (d.properties.hasfare) {
      d.properties.key = fullKey++;
    } else {
      d.properties.key = emptyKey++;
    }
    ajaxPool.push(
      $.post(
        "/api/google",
        {
          url: "https://maps.googleapis.com/maps/api/directions/json?origin="
          + d.sour.lat + "," + d.sour.lon + "&destination=" + d.dest.lat + "," + d.dest.lon + "&key=AIzaSyDstiaVLSaOW2DjrNVoF3scNsk-yzSMoZY"
        },
        function (result){
          result = JSON.parse(result);
          var points = [];
          $.each(result.routes[0].legs, function(i, leg) {
            $.each(leg.steps, function(i, step){
              $.each(google.maps.geometry.encoding.decodePath(step.polyline.points), function(i, p) {
                points.push([p.lng(), p.lat()]);
              });

            });
          });
          d.geometry = {
              "type": "LineString",
              "coordinates": points
          }
        }
      )
    );
  });

  // Intialize
  // routes.shift();
  $.when.apply(this, ajaxPool).done(function() {
    intialization({
      "type": "FeatureCollection",
      "features": routes
    });
  });
}

function intialization(data) {

    var feature = g.selectAll("path")
                    .data(data.features)
                    .enter().append("path")
                    .attr("class", function (d) {

                        if (d.properties.hasfare == true) {
                            return "trip" + (d.properties.key * 2) + " " + d.properties.hasfare;
                        } else {
                            return "trip" + ((d.properties.key * 2) + 1) + " " + d.properties.hasfare;
                        }
                    })
                    .attr("style", "opacity:0");

    var pointsArray = [];
    var points = g.selectAll(".point")
                  .data(pointsArray);

    var marker = g.append("circle");
    marker.attr("r", 5)
    .attr("id", "marker");
    //.attr("transform", "translate(" + startPoint + ")");

    //Get path start point for placing marker



    //var string = JSON.stringify(j);


    map.on("viewreset", reset);
    map.on("zoomend", reset);
    reset();

    var i = 0;

  function iterate() {
      var chartInterval = 0;
      var emptyData = [];
      // var emptyPath = areaChartSvg.append("path")
      //                             .datum(emptyData)
      //                             .attr("class", "empty");

      var path = svg.select("path.trip" + i)
                    .attr("style", "opacity:.7")
                    .call(transition);

      function pathStartPoint(path) {
          var d = path.attr('d');

          dsplitted = d.split("L")[0].slice(1).split(",");
          var point = []
          point[0]=parseInt(dsplitted[0]);
          point[1]=parseInt(dsplitted[1]);

          return point;
      }

      var startPoint = pathStartPoint(path);
      marker.attr("transform", "translate(" + startPoint[0] + "," + startPoint[1] + ")");


      path.each(function(d){
        //add the translation of the map's g element
        startPoint[0] = startPoint[0]; //+ topLeft[0];
        startPoint[1] = startPoint[1]; //+ topLeft[1];
        var newLatLon = coordToLatLon(startPoint);
        pointsArray.push([newLatLon.lng,newLatLon.lat,d.properties.hasfare]);

        points = g.selectAll(".point")
                  .data(pointsArray)
                  .enter()
                  .append('circle')
                  .attr("r",5)
                  .attr("class",function(d){
                      if(d[2]) {
                          return "startPoint point";
                      } else {
                          return "endPoint point";
                      }
                  })
                  .attr("transform",function(d){
                      return translatePoint(d);
                  });

        if(d.properties.hasfare) { //transition marker to show full taxi
            marker.transition()
                  .duration(500)
                  .attr("r",5)
                  .attr('style','opacity:1');
        } else { //Transition marker to show empty taxi
            marker.transition()
                  .duration(500)
                  .attr("r",40)
                  .attr('style','opacity:.3');
        }
      });

      function transition(path) {
          g.selectAll

          path.transition()
          .duration(function(d){
              //calculate seconds
              var start = d.properties.pickuptime,
              finish = d.properties.dropofftime,
              duration = (finish - start);

              duration = duration/60000; //convert to minutes

              duration = duration * (1/timeFactor) * 1000;


              time = moment(d.properties.pickuptime);



              $('.readableTime').text(time.format('h:mm a'));


              return (duration);
      })
          .attrTween("stroke-dasharray", tweenDash)
          .each("end", function (d) {

              if(d.properties.hasfare) {

                  // running.total += parseFloat(d.properties.total);
                  // running.surcharge += parseFloat(d.properties.surcharge);
                  // running.mtatax += parseFloat(d.properties.mtatax);
                  // running.tip += parseFloat(d.properties.tip);
                  // running.tolls += parseFloat(d.properties.tolls);
                  running.total += parseFloat(d.properties.total);
                  running.passengers += parseFloat(d.properties.passengers);



                  for(var p = 0;p<d.properties.passengers;p++){
                      $('.passengerGlyphs').append('<span class="glyphicon glyphicon-user"></span>');
                  }

                  updateRunning();



              };
              i++;

              var nextPath = svg.select("path.trip" + i);
              if (nextPath[0][0]==null){
                  clearTimeout(timer);
              } else {
                  iterate();
              }


          });

      }

      function tweenDash(d) {
          var l = path.node().getTotalLength();
          var i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr
      return function (t) {
          var marker = d3.select("#marker");
          var p = path.node().getPointAtLength(t * l);
          marker.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker

          if (tweenToggle == 0) {
              tweenToggle = 1;
              var newCenter = map.layerPointToLatLng(new L.Point(p.x,p.y));
              map.panTo(newCenter, 14);
          } else {
              tweenToggle = 0;
          }
          return i(t);
      }
      }
  }

  updateRunning();

  $('#begin').click(function(){
      $('.overlay').fadeOut(250);
      $('.box').fadeIn(250);
      setTimeout(function(){
          updateTimer();
          iterate();
      },500);

  });

  function updateRunning() {
      // $('.runningFare').text('$'+running.total.toFixed(2));
      // $('.runningSurcharge').text('$'+running.surcharge.toFixed(2));
      // $('.runningTax').text('$'+running.mtatax.toFixed(2));
      // $('.runningTip').text('$'+running.tip.toFixed(2));
      // $('.runningTolls').text('$'+running.tolls.toFixed(2));
      $('.runningTotal').text('$'+running.total.toFixed(2));
      $('.runningPassengers').text(running.passengers);
  }

  // Reposition the SVG to cover the features.
  function reset() {
      var bounds = d3path.bounds(data);
      topLeft = bounds[0],
      bottomRight = bounds[1];

      svg.attr("width", bottomRight[0] - topLeft[0] + 100)
      .attr("height", bottomRight[1] - topLeft[1] + 100)
      .style("left", topLeft[0]-50 + "px")
      .style("top", topLeft[1]-50 + "px");

      g.attr("transform", "translate(" + (-topLeft[0]+50) + "," + (-topLeft[1]+50)+ ")");

      feature.attr("d", d3path);

      //TODO: Figure out why this doesn't work as points.attr...
      g.selectAll(".point")
      .attr("transform",function(d){
          return translatePoint(d);
      });
  }
}

// Use Leaflet to implement a D3 geometric transformation.
function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

function translatePoint(d) {
    var point = map.latLngToLayerPoint(new L.LatLng(d[1],d[0]));

    return "translate(" + point.x + "," + point.y + ")";
}

function coordToLatLon(coord) {
var point = map.layerPointToLatLng(new L.Point(coord[0],coord[1]));
return point;
}


// loadData();
