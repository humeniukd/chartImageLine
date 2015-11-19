define([
    'chart'
], function() {
    Chart.types.Line.extend({
        name: "ImageLine",
        initialize:  function(data){
            var chartImages = data.datasets[0].images.reverse();
            this.PointClass = Chart.Point.extend({
                ctx : this.chart.ctx,
                strokeWidth : this.options.pointDotStrokeWidth,
                radius : this.options.pointDotRadius,
                display: this.options.pointDot,
                hitDetectionRadius : this.options.pointHitDetectionRadius,
                draw: function () {
                    var that = this;
                    if (this.display&&this.value) {
                        var img = document.createElement('img');
                        img.src = chartImages.pop();
                        img.onload = function(){
                            that.ctx.save();
                            that.ctx.beginPath();
                            that.ctx.arc(that.x, that.y, 10, 0, Math.PI*2);
                            that.ctx.closePath();
                            that.ctx.clip();
                            that.ctx.drawImage(this, that.x-10, that.y-10, 20, 20);
                            that.ctx.restore();
                        }
                    }
                }
            });
            this.datasets = [];

            //Set up tooltip events on the chart
            if (this.options.showTooltips){
                Chart.helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
                    var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
                    this.eachPoints(function(point){
                        point.restore(['fillColor', 'strokeColor']);
                    });
                    Chart.helpers.each(activePoints, function(activePoint){
                        activePoint.fillColor = activePoint.highlightFill;
                        activePoint.strokeColor = activePoint.highlightStroke;
                    });
                    this.showTooltip(activePoints);
                });
            }

            //Iterate through each of the datasets, and build this into a property of the chart
            Chart.helpers.each(data.datasets,function(dataset){

                var datasetObject = {
                    label : dataset.label || null,
                    fillColor : dataset.fillColor,
                    strokeColor : dataset.strokeColor,
                    pointColor : dataset.pointColor,
                    pointStrokeColor : dataset.pointStrokeColor,
                    points : []
                };

                this.datasets.push(datasetObject);


                Chart.helpers.each(dataset.data,function(dataPoint,index){
                    //Add a new point for each piece of data, passing any required data to draw.
                    datasetObject.points.push(new this.PointClass({
                        value : dataPoint,
                        label : data.labels[index],
                        datasetLabel: dataset.label,
                        strokeColor : dataset.pointStrokeColor,
                        fillColor : dataset.pointColor,
                        highlightFill : dataset.pointHighlightFill || dataset.pointColor,
                        highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
                    }));
                },this);

                this.buildScale(data.labels);


                this.eachPoints(function(point, index){
                    Chart.helpers.extend(point, {
                        x: this.scale.calculateX(index),
                        y: this.scale.endPoint
                    });
                    point.save();
                }, this);

            },this);


            this.render();

        }
    });
});