(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('GraphController', graphController);

  function graphController($scope) {
    $scope.selectedTimePeriod = "long_term";
    $scope.xAxisCategory = "time";
    $scope.yAxisCategory = "energy";
    // Adopted from here: https://github.com/bhargavavn/Scatterplot_zoom/blob/master/scatter.html

    // Set the dimensions of the svg / graph
    var margin = {
      top: 50,
      right: 20,
      bottom: 30,
      left: 60
    };
    var padding = 50;
    var width = 1000 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;

    // Parse the date / time
    // e.g. "2016-03-02T07:22:01Z"
    var parseDate = d3.time.format.iso.parse;

    // Set the ranges
    var x = d3.time.scale().range([padding, width]);
    var y = d3.scale.linear().range([padding/2, height]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
      .orient("top").ticks(5)
      .tickSize(8);
    var yAxis = d3.svg.axis().scale(y)
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
    var data = $scope.musicTracks;

    for (let d of data) {
      d["date"] = parseDate(d["added_at"]);
      d["y_category"] = d["audio_features"][$scope.yAxisCategory];
    }

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d["y_category"]; }) + 0.1]);
    //y.domain([0, 1]);
    //y.domain([0, d3.max(data, function(d) { return d.close; })]);

    // Zoom selection
    svg.append("rect")
      .attr("width", width + margin.left + margin.right + padding)
      .attr("height", height + margin.top + margin.bottom + padding)

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
      .style("opacity", 0.6)
      .attr("cx", function(d) { return x(d.date); })
      .attr("cy", function(d) { return y(d["y_category"]); })
      .on("mouseover", function(d) {
        d3.select(this)
          //.attr("r", (2 * d3.select(this).attr("r")))
          .attr("r", 16)
          .classed("selected", true);
        div.transition()
          .duration(200)
          .style("opacity", .7)
          .attr("r", 30);
        div.html(d.name + '<br>' + d.artists[0].name)
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
      .call(xAxis);

    // Add the Y Axis
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    // Call funtion zoom
    svg.call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));

    // Zoom into data (.dot)
    function zoom() {
      // console.log(d3.event.scale);
      svg.selectAll("circle")
        //.attr("r", (8 * d3.event.scale))
        .classed("animate", false)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d["y_category"]); });
      d3.select('.x.axis').call(xAxis);
      d3.select('.y.axis').call(yAxis);
    }

    $scope.updateGraph = function() {
      // x.domain(d3.extent(data, function(d) { return d.date; }));
      // y.domain([0, d3.max(data, function(d) { return d["y_category"]; }) + 0.1]);
      // d3.select('.x.axis').call(xAxis);
      // d3.select('.y.axis').call(yAxis);
      svg.selectAll("circle")
        .classed("animate", true)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d["y_category"]); });
      d3.select('.x.axis').call(xAxis);
      d3.select('.y.axis').call(yAxis);
    }

  }

})();