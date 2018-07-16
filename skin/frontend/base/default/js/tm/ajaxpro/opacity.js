/* <!-- AjaxPro --> */
document.observe("dom:loaded", function (){
    AjaxPro.opacity = function(){
        var _selector;
        return {
            setSelector: function(selector){
                _selector = selector;
                return this;
            },
            show: function(opacity){
                opacity = opacity || AjaxPro.config.get('effect/opacity');
                $$(_selector).each(function(element){
                    element.fade({
                        duration: AjaxPro.config.get('effect/duration'),
                        from: 1,
                        to: opacity
                    });
                });
                return this;
            },
            hide: function(opacity){
                opacity = opacity || AjaxPro.config.get('effect/opacity');
                $$(_selector).each(function(element){
                    element.fade({
                        duration: AjaxPro.config.get('effect/duration'),
                        from: opacity,
                        to: 1
                    });
                });
                return this;
            }
        };
    }();
});