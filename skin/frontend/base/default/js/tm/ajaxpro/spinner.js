document.observe("dom:loaded", function (){

    AjaxPro.spinner = function() {
        var _id = 'ajaxpro-spinner', _position;

        function _getElement() {
            var el = $(_id);
            if (!el) {
                var _el = new Element('div', {'id': _id, 'class': 'ajaxpro-spinner'})
                    .hide()
                    .setStyle("display:none")
                    .setOpacity(AjaxPro.config.get('effect/opacity'))
                    .update(
                        new Element('p').update(
                            AjaxPro.config.get('effect/text')
                        )
                    )
                    ;
                    Event.fire(document, "AjaxPro:spinner:init:after", {spinner: _el});

                document.body.insert({'bottom': _el});
                el = $(_id);
            }
            return el;
        }
        return {
            setElementId: function(id) {
                _id = id;
                return this;
            },
            hide: function(){
                _getElement().hide().remove();
                return this;
            },
            setPosition: function(e) {
                var left, top;
                if (e.pageX || e.pageY) {
                    left = e.pageX;
                    top = e.pageY;
                } else {
                    left = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    top = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }

                var el = _getElement(),
                    margin_left = el ? el.getWidth() / 2 : 0;

                if (margin_left) {
                    var right = left + margin_left,
                        viewportSize = document.viewport.getDimensions(),
                        scrollOffset = document.viewport.getScrollOffsets();

                    var viewportRightEdge = viewportSize.width + scrollOffset.left;
                    if (right > viewportRightEdge) {
                        left = left - (right - viewportRightEdge) - 10;
                    } else if ((left - margin_left) < scrollOffset.left) {
                        left = scrollOffset.left + margin_left + 10;
                    }

                    if (viewportSize.height) {
                        var viewportBottomEdge = viewportSize.height + scrollOffset.top,
                            height = el.getHeight() + 10;
                        if ((top + height) > viewportBottomEdge) {
                            top = viewportBottomEdge - height - 10;
                        }
                    }
                }

                _position = {
                    top : top + 'px',
                    left: left - margin_left + 'px'
                };
                return this;
            },
            show: function(){
                this.hide();
                var el = _getElement(),
                location = !!parseInt(
                    AjaxPro.config.get('effect/spinner_location')
                );
                if (_position && location) {
                    el.setStyle(_position);
                } else {
                    el.setStyle(
                        AjaxPro.message
                            .setElementId(_id)
                            .getPosition()
                    );
                }
                el.show();
                return this;
            }
        };
    }();

    Event.observe(window, 'click', function(e) {
        AjaxPro.spinner.setPosition(e);
    });

    AjaxPro.observe('click:stop', function (event) {
       var e = event.memo;
       AjaxPro.spinner.setPosition(e);
    });

    function _hash(str) {
        var h = 0;
        if (str.length == 0) return h;
        for (i = 0; i < str.length; i++) {
            c = str.charCodeAt(i);
            h = ((h<<5) - h) + c;
            h = h & h;
        }
        return h;
    }

    AjaxPro.observe('onLoading', function (e){

        var _id = 'ajaxpro-spinner-' + _hash(e.memo.url);
        AjaxPro.spinner
            .setElementId(_id)
            .show.bind(AjaxPro.spinner).defer();
    });

    AjaxPro.observe('onComplete', function(e){
        var _id = 'ajaxpro-spinner-' + _hash(e.memo.url);
        AjaxPro.spinner
            .setElementId(_id)
            .hide.bind(AjaxPro.spinner)();
    });
});
