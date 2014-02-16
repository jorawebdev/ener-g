define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        _                   = require('underscore'),
        Backbone            = require('backbone'),
        handlebars          = require('handlebars-v1.3.0'),
        tpl                 = require('text!tpl/water.html'),
        /*template = _.template(tpl);*/
        template = Handlebars.compile(tpl);

    return Backbone.View.extend({

        events: {
            "click #chartTabs ul li a":"tabCharts"
        },

        render: function () {
            var that = this;
            that.model.fetch({
                success: function(data){
                    //console.log(data.attributes);
                    //var set = data.models[0].attributes;
                    //var arr = set[0];
                    var dd = data.attributes;
                    var maxUnitsArray = [];
                    var maxChargeArray = [];
                    var minUnitsArray = [];
                    var minChargeArray = [];
                    _.each(dd,function(k,v){
                        //console.log(k.usage);
                        maxUnitsArray.push(k.usage);
                        maxChargeArray.push(k.payment);
                        minUnitsArray.push(k.usage);
                        minChargeArray.push(k.payment);
                    }); 
                    var rD = {
                        maxU: that.maxVal(maxUnitsArray),
                        maxC: that.maxVal(maxChargeArray),
                        maxR: (that.maxVal(maxChargeArray)/that.maxVal(maxUnitsArray)).toFixed(2),
                        minU: that.minVal(minUnitsArray),
                        minC: that.minVal(minChargeArray),
                        minR: (that.minVal(minChargeArray)/that.minVal(minUnitsArray)).toFixed(2)
                    };

                    that.$el.html(template({mydata: dd, rateData: rD}));
                    that.visualize(dd);
                    that.delegateEvents();
                },
                error: function(er){
                    //console.log(er);
                }
            });
            //console.log('in view');
            //console.log(d);
            //this.$el.html(template());
            return that;
        },

        tabCharts: function(e){
            //console.log(e.target);
            e.preventDefault();
            //$(this).tab('show');
        },

        dateSort: function(array){
            array.sort(function(a,b){
                a = new Date(a);
                b = new Date(b);
                return a<b?-1:a>b?1:0;
            });
        },

        maxVal: function(ar){
            return Math.max.apply(null, ar);
        },

        minVal: function(ar){
            return Math.min.apply(null, ar);
        },

        visualize: function(dd){
            var that = this;
            /*console.log(dd);*/

            var ccUnits = [];
            var ccPayments = [];
            var ccDates = [];
            var ccCurrent = [];
            var maxUnit = '';
            var format = d3.time.format("%Y-%m-%d");


            for(var i in dd){
                /*console.log(dd[i]['usage']);*/
                ccUnits.push(dd[i]['usage']);
                ccPayments.push(dd[i]['payment']);
                var date = new Date(dd[i]['date']);
                ccCurrent.push(dd[i]['current']);
                ccDates.push(date);
            }
            //console.log(ccPayments);
            maxUnit = this.maxVal(ccUnits);
            maxPayment = this.maxVal(ccPayments);
            var minDate = d3.min(ccDates, function(d) {return d});
            var maxDate = d3.max(ccDates, function(d) {return d});
            var minPayment = d3.min(ccPayments, function(d) {return d});
            var maxPayment = d3.max(ccPayments, function(d) {return d});

            //console.log(format(minDate));
            var m = [20, 80, 80, 80]; // margins
            var w = 770 - m[1] - m[3];  // width
            var h = 550 - m[0] - m[2]; // height
            
            // create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
            /*var data1 = [3, 6, 2, 7, 5, 2, 0, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7];*/
            /*var data2 = [543, 367, 215, 56, 65, 62, 87, 156, 287, 398, 523, 685, 652, 674, 639, 619, 589, 558, 605, 574, 564, 496, 525, 476, 432, 458, 421, 387, 375, 368];*/
     
            // X scale will fit all values from data[] within pixels 0-w
            /*var x = d3.scale.linear().domain([0, data1.length]).range([0, w]);*/
            //var x = d3.scale.linear().domain([0, ccDates.length]).range([0, w]);
            //var x = d3.time.scale().domain([minDate, maxDate]).range([0, w]);
            var x = d3.time.scale().domain([d3.min(ccDates), d3.max(ccDates)]).range([0, w]);
            //var xZ = d3.time.scale().domain([0, maxUnit]).range([0, w]);
            //var xZ = d3.time.scale().domain(ccUnits).range([0, w]);
            //var x = d3.time.scale().domain([0, maxUnit]).range([0, w]);
            //var x = d3.time.scale().range([0, w]);
            // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
            /*var y1 = d3.scale.linear().domain([0, 20]).range([h, 0]);*/ // in real world the domain would be dynamically calculated from the data
            var y1 = d3.scale.linear().domain([0, maxUnit]).range([h, 0]);
            var y2 = d3.scale.linear().domain([minPayment, maxPayment]).range([h, 0]);  // in real world the domain would be dynamically calculated from the data
                // automatically determining max range can work something like this
                // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
     
            // create a line function that can convert data[] into x and y points
            //var line1 = d3.svg.line()
            var line1 = d3.svg.line()
                // assign the X function to plot our line as we wish
                .x(function(d,i) { 
                    var elX = x(d*1);
                    return elX;
                })
                .y(function(d, i) { 
                    var elY = y1(ccUnits[i]);
                    return elY;
                })
                
            // create a line function that can convert data[] into x and y points
            var line2 = d3.svg.line()
                // assign the X function to plot our line as we wish
                .x(function(d,i) { 
                        var elZ = x(d*1);
                        return elZ;
                })
                .y(function(d, i) { 
                        var elW = y2(ccPayments[i]);
                        return elW;
                });
 
 
            // Add an SVG element with the desired dimensions and margin.
            var graph = d3.select("#chart").append("svg:svg")
                  .attr("width", w + m[1] + m[3])
                  .attr("height", h + m[0] + m[2])
                .append("svg:g")
                  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
 
            // create yAxis
            var xAxis = d3.svg.axis().scale(x).tickFormat(d3.time.format("%b-%Y")).tickSize(-h).tickSubdivide(true);
            // Add the x-axis.
            graph.append("svg:g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + h + ")")
                  .call(xAxis);
 
 
            // create left yAxis
            var yAxisLeft = d3.svg.axis().scale(y1).ticks(maxUnit).orient("left");
            // Add the y-axis to the left
            graph.append("svg:g")
                  .attr("class", "y axis axisLeft")
                  .attr("transform", "translate(-15,0)")
                  .call(yAxisLeft);
            graph.append("text")
                .attr("class", "y1 label")
                .attr("text-anchor", "end")
                .attr("y", -50)
                .attr("dy", ".5em")
                .attr("transform", "rotate(-90)")
                .text("UNITS");
 
            // create right yAxis
            var yAxisRight = d3.svg.axis().tickFormat(
                function(d){
                    return '$'+d;
                }).scale(y2).ticks(20).orient("right");
            // Add the y-axis to the right
            graph.append("svg:g")
                  .attr("class", "y axis axisRight")
                  .attr("transform", "translate(" + (w+15) + ",0)")
                  .call(yAxisRight);
            graph.append("text")
                .attr("class", "y2 label")
                .attr("text-anchor", "end")
                .attr("y", w+60)
                .attr("dy", ".5em")
                .attr("transform", "rotate(-90)")
                .text("CHARGES");
            
            // add lines
            // do this AFTER the axes above so that the line is above the tick-lines
            /*graph.append("svg:path").attr("d", line1(data1)).attr("class", "data1");*/
            graph.append("svg:path").attr("d", line1(ccDates)).attr("class", "data1");
            //graph.append("svg:path").attr("d", line1(ccDates)).attr("class", "data1");
            graph.append("svg:path").attr("d", line2(ccDates)).attr("class", "data2");
            var tooltip = d3.select("body")
                .append("div")
                .attr("class", "tool-tip");

            graph.selectAll("circle")
             .data(ccUnits)
             .enter().append("circle")
             .attr("fill", "#fff")
             .attr("stroke","steelblue")
             .attr("r", 3)
             .attr("cx", function(d, i) {
                return x(ccDates[i]);
                })
             .attr("cy", function(d,i) {
                    return y1(ccUnits[i]);
                })
             .attr('data-obj', function(d,i){
                return d;
             })
             .on("mouseover", function(d) { 
                //console.log(this);
                var tt = tooltip.style("visibility", "visible").text(d+ " units");
                return tt;
                //var tit = $(this).data('data-obj');
                //$(this).addAttribute('alt',tit);
                })
            .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");
             });
        }

    });

});