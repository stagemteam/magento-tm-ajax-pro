/* <!-- AjaxPro --> */
document.observe("dom:loaded", function (){
    AjaxPro.message = function(){
        var _id;
        function _getElement() {
            return $(_id);
        }

        function _eschide(e){
            if (27 !== e.keyCode) {
                return;
            }
            _hide();
        }

        function _lostFocusHide(e){
            if (!Event.element(e).up('.ajaxpro-form')) {
                _hide();
            }
        }

        function _hide(){
            var element = _getElement();
            if (!element) {
                return;
            }
            element.hide();
            if (Prototype.Browser.IE) {
                element.replace('<div></div>');
            } else {
                element.remove();
            }

            document.stopObserving('keyup', _eschide);
            document.stopObserving('click', _lostFocusHide);
            element.select('.ajaxpro-button').each(function(el){
                el.stopObserving('click', _hide);
            });

            AjaxPro.fire('message:hide');
        }
        return {
            getPosition: function() {
                var scrollOffsets = document.viewport.getScrollOffsets(),
                    viewportSize  = document.viewport.getDimensions(),
                    left          = viewportSize.width / 2,
                    top;

                var element = _getElement(),
                    elementHeight = element ? element.getHeight() : 150,
                    marginLeft = element ? element.getWidth() / 2 : 0;

                if ('undefined' === typeof viewportSize.height) { // mobile fix
                    top = scrollOffsets.top + 100;
                    left = scrollOffsets.left + left;
                } else {
                    left = scrollOffsets.left + left;
                    switch (AjaxPro.config.get('effect/location')) {
                        case 'top':
                            top = scrollOffsets.top + 10;
                            break;
                        case 'bottom':
                            top = scrollOffsets.top + viewportSize.height - elementHeight - 10;
                            break;
                        case 'center':
                        default:
                            top = scrollOffsets.top + viewportSize.height / 2 - elementHeight / 2 - 10;
                            if (top < scrollOffsets.top + 10) {
                                top = scrollOffsets.top + 10;
                            }
                            break;
                    }
                }

                return {
                    top : top + 'px',
                    left: left - marginLeft + 'px'
                };
            },
            setElementId: function(id){
                var el = $(id);
                if (el) {
                    _id = id;
                }
                return this;
            },
            visible: function(){
                return $$('.ajaxpro-form').findAll(function(el){
                    return el.visible();
                }).size() > 0;
            },
            hide: function(){
                _hide();
                return this;
            },
            show: function(){
                var element = _getElement();
                if (!element) {
                    return;
                }

                // correct centering of responsive popup window
                element.setStyle({width: 'auto'});
                var sizeConfig = {
                        '.product-view': 600,
                        '.crosssell': 600,
                        '.cart': 700,
                        '.ajaxpro-short-messages': 350
                    },
                    gap = 35, // gap for box shadow and close button
                    viewportSize = document.viewport.getDimensions();
                for (var selector in sizeConfig) {
                    var el = element.down(selector);
                    if (!el) {
                        continue;
                    }

                    var width = sizeConfig[selector];
                    if ((width + gap) > viewportSize.width) {
                        width = viewportSize.width - 50;
                    }
                    element.setStyle({
                        width: width + 'px'
                    });
                }

                element.setStyle(AjaxPro.message.getPosition());
                element.setStyle('');
//                element.fade({duration: 1, from: 1, to: AjaxPro.config.get('effect/opacity')});
                element.setOpacity(AjaxPro.config.get('effect/opacity'));

                element.select('.ajaxpro-button').each(function(el){
                    el.observe('click', _hide);
                });
                document.observe('keyup', _eschide);
                document.observe('click', _lostFocusHide);

                element.show();
                //_hide.delay(AjaxPro.config.get('effect/autohidemessagedelay'));
                AjaxPro.fire('message:show');
                return this;
            }
        };
    }();

    AjaxPro.observe('onSuccess', function(e) {
        var r = e.memo.response;

        if (r.layout && r.layout['ajaxpro_message']) {
            AjaxPro.message
                .setElementId('ajaxpro-notice-form')
                .show()
            ;
        }
    });

    AjaxPro.observe('onFailure', function(e) {
        var r = e.memo.response;
        function _redirect() {
            if (true == AjaxPro.config.get('debug')) {
                return;
            }
            if (r && r.redirectUrl == window.location.href) {
                return;
            }
            if (r && r.redirectUrl) {
                window.location.href = r.redirectUrl;
                return;
            }
            window.location.reload();
        };
        if (r && r.layout && r.layout['ajaxpro_message']) {
            AjaxPro.message
                .setElementId('ajaxpro-notice-form')
                .show()
            ;
            $('ajaxpro-notice-form').select('.ajaxpro-button').each(function(element){
                element.observe('click', _redirect);
            });
            return;
        }
        _redirect();
    });

});