define(function (require) {

    "use strict";

    var $                   = require('jquery'),
        Backbone            = require('backbone');

        return Backbone.Model.extend({
            
            //url: "js/data/rank.js",
            url: "js/data/water.js",

            parse: function(response){
                //console.log(response);
                //return response.content;
                return response;
            },

/*            sync: function(method, model, options) {
                var that = this;
                var params = _.extend({
                    type: 'GET',
                    dataType: 'json',
                    url: that.url,
                    processData: false
                }, options);

                return $.ajax(params);
            }*/
        });
});
