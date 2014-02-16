define(function (require) {

    "use strict";

    var $           = require('jquery'),
        Backbone    = require('backbone'),
        ShellView   = require('app/views/shell'),
        IndexView   = require('app/views/index'),


        $body = $('body'),
        shellView = new ShellView({el: $body}).render(),
        $content = $("#content", shellView.el),
        indexView = new IndexView({el: $content});

    // Close the search dropdown on click anywhere in the UI
    $body.click(function () {
        $('.dropdown').removeClass("open");
    });

    $("body").on("click", "#showMeBtn", function (event) {
        event.preventDefault();
        shellView.search();
    });
    

    return Backbone.Router.extend({

        routes: {
            "": "index",
            "mywater": "getWaterMeasure",
            "contact": "contact"
        },

        index: function () {
            indexView.delegateEvents(); // delegate events when the view is recycled
            indexView.render();
            shellView.selectMenuItem('home-menu');
        },

        contact: function () {
            require(["app/views/contact"], function (ContactView) {
                var view = new ContactView({el: $content});
                view.render();
                shellView.selectMenuItem('contact-menu');
            });
        },

        getWaterMeasure: function(){
            require(['app/views/vWater', 'app/models/mWater'], function(View, Model){
                var model = new Model({});
                var view = new View({model: model, el: $content});
                view.render();
                //console.log(view);
                shellView.selectMenuItem('water-menu');
            });
        }

    });

});