(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('GraphController', graphController);

  function graphController($scope, $http) {
    $scope.selectedTimePeriod = "long_term";
    $scope.axisCategories = [
      { name: "Danceability", value: "danceability" },
      { name: "Energy", value: "energy" },
      { name: "Speechiness", value: "speechiness" },
      { name: "Acousticness", value: "acousticness" },
      { name: "Instrumentalness", value: "instrumentalness" },
      { name: "Liveness", value: "liveness" },
      { name: "Valence", value: "valence" },
      { name: "Date added", value: "time" }
    ];

    $scope.axisCategory = {
      x: $scope.axisCategories[7], // time
      y: $scope.axisCategories[1] // energy
    };

    $scope.xAxisIsLocked = false;
    $scope.yAxisIsLocked = false; // TODO: debug this

    // Original zoomable d3 scatterplot code adopted from here: https://github.com/bhargavavn/Scatterplot_zoom/blob/master/scatter.html

    // Set the dimensions of the svg / graph
    var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 60
    };
    var padding = 50;
    var width = 1400 - margin.left - margin.right;
    var height = 530 - margin.top - margin.bottom;

    // Parse the date / time
    // e.g. "2016-03-02T07:22:01Z"
    var parseDate = d3.time.format.iso.parse;

    // Set the ranges
    var x = d3.time.scale().range([padding, width]);
    var y = d3.scale.linear().range([height, padding/2]);

    // Define the axes
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom").ticks(5)
      .tickSize(8)
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left").ticks(5)
      .tickSize(8);

    // Adds the svg svg
    var svg = d3.select(".mydiv")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var div = d3.select(".mydiv").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Get the data
    var data;
    if ($scope.loadFromSampleData) {
      $http.get('resources/' + $scope.loadFromSampleData + '_data.json')
       .then(function(json) {
          $scope.musicTracks = json.data;
          data = $scope.musicTracks;
          drawGraph();
        });
    } else {
      data = $scope.musicTracks;
      drawGraph();
    }

    // console.log(data);
    // var json = JSON.stringify(data);
    // console.log(json);

    // var toDownload = new Blob([json], { type:'application/json' });
    // var link = window.URL.createObjectURL(toDownload);
    // window.location=link;
/*
    // process data for output
    for (let d of data) {
      delete d["album"];
      delete d["available_markets"];
      delete d["external_ids"];
      delete d["external_urls"];
    }
  */

    function drawGraph() {

      for (let d of data) {
        if ($scope.axisCategory.x.value == "time") {
          d["date"] = parseDate(d["added_at"]);
          d["x_category"] = d["date"];
          d["x_category_val"] = "time";
        } else {
          d["x_category"] = d["audio_features"][$scope.axisCategory.x.value];
          d["x_category_val"] = $scope.axisCategory.x.value;
        }
        d["y_category"] = d["audio_features"][$scope.axisCategory.y.value];
        d["y_category_val"] = $scope.axisCategory.y.value;
      }

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) { return d["x_category"]; }));
      y.domain([0, d3.max(data, function(d) { return d["y_category"]; }) + 0.1]);
      //y.domain([0, 1]);
      //y.domain([0, d3.max(data, function(d) { return d.close; })]);

      // Zoom selection
      svg.append("rect")
        .attr("width", width + margin.left + margin.right + padding)
        .attr("height", height + margin.top + margin.bottom + padding)

      // Add axis labels
      var leftLabel = svg.append("text")
          .attr("y", height/2 + 25)
          .attr("x", margin.left)
          .attr("class", "axis-label x left");

      var rightLabel = svg.append("text")
          .attr("y", height/2 + 25)
          .attr("x", width - 150)
          .attr("class", "axis-label x right");

      var topLabel = svg.append("text")
          .attr("y", margin.top)
          .attr("x", width/2-padding)
          .attr("class", "axis-label y top");

      var bottomLabel = svg.append("text")
          .attr("y", height - padding/2)
          .attr("x", width/2-padding)
          .attr("class", "axis-label y bottom");

      $scope.updateAxisLabels = function() {
        if ($scope.axisCategory.x.value == "time") {
          leftLabel.text("");
          rightLabel.text("");
        } else {
          leftLabel.text("low " + $scope.axisCategory.x.value);
          rightLabel.text("high " + $scope.axisCategory.x.value);
        }
        topLabel.text("high " + $scope.axisCategory.y.value);
        bottomLabel.text("low " + $scope.axisCategory.y.value);
      }

      $scope.updateAxisLabels();

      // Data point creation
      svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("class", function(d) {
          if (d["is_top"].length > 0) {
            return ("top " + d["is_top"].join(" "));
          }
        })
        .attr("r", 8)
        .style("opacity", 0.5)
        .attr("cx", function(d) { return x(d["x_category"]); })
        .attr("cy", function(d) { return y(d["y_category"]); })
        .on("mouseover", function(d) {
          d3.select(this)
            //.attr("r", (2 * d3.select(this).attr("r")))
            .attr("r", 16)
            .classed("selected", true);
          div.transition()
            .duration(200)
            .style("opacity", .8)
            .attr("r", 30);
          div.html(function() {
              if (d["x_category_val"] == "time") {
                var date = new Date(d["x_category"]);
                var date_str = date.toLocaleString();
                return (d.name + '<br>' + d.artists[0].name + '<br><div class="subtext">' + d["y_category"] + ' ' + d["y_category_val"] + '<br>' + 'Added ' + date_str + '<br></div>');
              } else {
                return (d.name + '<br>' + d.artists[0].name + '<br><div class="subtext">' + d["y_category"] + ' ' + d["y_category_val"] + '<br>' + d["x_category"] + ' ' + d["x_category_val"] + '<br></div>');
              }
            })
            // TODO: Fix the tooltip placement
            // .style("left", d3.select(this).attr("cx") + "px")
            // .style("top", (d3.select(this).attr("cy") - parseInt(div.node().getBoundingClientRect()["height"]) + "px"));
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - parseInt(div.node().getBoundingClientRect()["height"] + 10) + "px"));
            //.style("top", (d3.event.pageY - parseInt(getComputedStyle(div).getPropertyValue("height")) + "px"));
            //.style("top", (d3.event.pageY - parseInt(div.style("height"))) + "px");
        })
        .on("mouseout", function(d) {
          d3.select(this)
            //.attr("r", (d3.select(this).attr("r") / 2))
            .attr("r", 8)
            .classed("selected", false);
            // TODO: IDEA: Expand to be the album art!
          div.transition()
            .duration(500)
            .style("opacity", 0);
        })
        .on("click", function(d) {
          $scope.playSelectedSong(d.name, d.artists[0].name)
        });

      // Add the X Axis
      svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
        .attr("transform", "translate(0," + height + ")"); // factor in padding?

      // Add the Y Axis
      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);


      // Call funtion zoom
      svg.call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));

      $scope.changeXScaleToDate = function() {
        x = d3.time.scale().range([padding, width]);
        x.domain(d3.extent(data, function(d) { return d["x_category"]; }));
        xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom").ticks(5)
          .tickSize(8);
        svg.call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));
      }

      $scope.changeXScaleToFeature = function() {
        x = d3.scale.linear().range([padding, width]);
        x.domain([0, d3.max(data, function(d) { return d["x_category"]; }) + 0.1]);
        xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom").ticks(5)
          .tickSize(8);
        svg.call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));
      }

      $scope.toggleYAxisLock = function() {
        $scope.yAxisIsLocked = !$scope.yAxisIsLocked;
        //xAxis.scale(x);
      }

      // Zoom into data (.dot)
      function zoom() {
        // console.log(d3.event.scale);
        if ($scope.xAxisIsLocked && $scope.yAxisIsLocked) return;
        if ($scope.xAxisIsLocked) {
          svg.selectAll("circle")
            .classed("animate", false)
            .attr("cy", function(d) { return x(d["y_category"]); });
          d3.select('.y.axis').call(yAxis);
        } else if ($scope.yAxisIsLocked) {
          svg.selectAll("circle")
            .classed("animate", false)
            .attr("cx", function(d) { return x(d["x_category"]); });
          d3.select('.x.axis').call(xAxis);
        } else {
          svg.selectAll("circle")
            .classed("animate", false)
            .attr("cx", function(d) { return x(d["x_category"]); })
            .attr("cy", function(d) { return y(d["y_category"]); });
          d3.select('.x.axis').call(xAxis);
          d3.select('.y.axis').call(yAxis);
        }
      }

      $scope.updateGraph = function() {
        // x.domain(d3.extent(data, function(d) { return d["x_category"]; }));
        // y.domain([0, d3.max(data, function(d) { return d["y_category"]; }) + 0.1]);
        // d3.select('.x.axis').call(xAxis);
        // d3.select('.y.axis').call(yAxis);
        svg.selectAll("circle")
          .classed("animate", true)
          .attr("cx", function(d) { return x(d["x_category"]); })
          .attr("cy", function(d) { return y(d["y_category"]); });
        d3.select('.x.axis').call(xAxis);
        d3.select('.y.axis').call(yAxis);
      }

    }

    // TODO: Investigate why neither of these work.
    // $scope.$watch('yAxisIsLocked', function() {
    //   console.log($scope.yAxisIsLocked);
    // });
    // $scope.$watch('nonTopTracksHidden', function() {
    //   console.log($scope.nonTopTracksHidden);
    // });

  }

})();