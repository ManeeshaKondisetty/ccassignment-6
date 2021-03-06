'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', [function() {

}]);

function getData() {
  var firstCar = document.getElementById('one_cars').value;
  var secondCar = document.getElementById('two_cars').value;

  if(firstCar !== secondCar) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://data.kcmo.org/resource/32xf-gvw8.json", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();

    var firstCarCount = 0;
    var secondCarCount = 0;
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        var parseJson = JSON.parse(this.response);
        for(var i=0;i<parseJson.length;i++){
          if(parseJson[i].make===firstCar) {
            firstCarCount++;
          } else if(parseJson[i].make===secondCar) {
            secondCarCount++;
          }
        }

        var myCars = {
          'first car' : firstCarCount,
          'second car' : secondCarCount
        };

        var myCanvas = document.getElementById("myCanvas");
        myCanvas.width = 300;
        myCanvas.height = 300;

        var ctx = myCanvas.getContext("2d "+firstCar);

        var myBarchart = new Barchart(
            {
              canvas:myCanvas,
              seriesName:"Car Comparisons",
              padding:20,
              gridScale:5,
              gridColor:"#000000",
              data:myCars,
              colors:["#a55ca5","#67b6c7"]
            }
        );
        myBarchart.draw();
      }
    };
  } else {
    alert('Please select different colors');
  }
}

function drawLine(ctx, startX, startY, endX, endY,color){
  ctx.save();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX,startY);
  ctx.lineTo(endX,endY);
  ctx.stroke();
  ctx.restore();
}

function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height,color){
  ctx.save();
  ctx.fillStyle=color;
  ctx.fillRect(upperLeftCornerX,upperLeftCornerY,width,height);
  ctx.restore();
}

var Barchart = function(options){
  this.options = options;
  this.canvas = options.canvas;
  this.ctx = this.canvas.getContext("2d");
  this.colors = options.colors;

  this.draw = function(){
    var maxValue = 0;
    for (var categ in this.options.data){
      maxValue = Math.max(maxValue,this.options.data[categ]);
    }
    var canvasActualHeight = this.canvas.height - this.options.padding * 2;
    var canvasActualWidth = this.canvas.width - this.options.padding * 2;

    //drawing the grid lines
    var gridValue = 0;
    while (gridValue <= maxValue){
      var gridY = canvasActualHeight * (1 - gridValue/maxValue) + this.options.padding;
      drawLine(
          this.ctx,
          0,
          gridY,
          this.canvas.width,
          gridY,
          this.options.gridColor
      );

      //writing grid markers
      this.ctx.save();
      this.ctx.fillStyle = this.options.gridColor;
      this.ctx.textBaseline="bottom";
      this.ctx.font = "bold 10px Arial";
      this.ctx.fillText(gridValue, 10,gridY - 2);
      this.ctx.restore();

      gridValue+=this.options.gridScale;
    }

    //drawing the bars
    var barIndex = 0;
    var numberOfBars = Object.keys(this.options.data).length;
    var barSize = (canvasActualWidth)/numberOfBars;

    for (categ in this.options.data){
      var val = this.options.data[categ];
      var barHeight = Math.round( canvasActualHeight * val/maxValue) ;
      drawBar(
          this.ctx,
          this.options.padding + barIndex * barSize,
          this.canvas.height - barHeight - this.options.padding,
          barSize,
          barHeight,
          this.colors[barIndex%this.colors.length]
      );

      barIndex++;
    }

    //drawing series name
    this.ctx.save();
    this.ctx.textBaseline="bottom";
    this.ctx.textAlign="center";
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "bold 14px Arial";
    this.ctx.fillText(this.options.seriesName, this.canvas.width/2,this.canvas.height);
    this.ctx.restore();

    //draw legend
    barIndex = 0;
    var legend = document.querySelector("legend[for='myCanvas']");
    var ul = document.createElement("ul");
    legend.append(ul);
    for (categ in this.options.data){
      var li = document.createElement("li");
      li.style.listStyle = "none";
      li.style.borderLeft = "20px solid "+this.colors[barIndex%this.colors.length];
      li.style.padding = "5px";
      li.textContent = categ;
      ul.append(li);
      barIndex++;
    }
  }
}

