/* <!-- AjaxPro --> */
document.observe("dom:loaded", function (){
    AjaxPro.overlay = function(){
        var _id = 'ajaxpro-overlay', _status = false;
        function _getElement() {

            var el = $(_id);
            if (!el) {
                el = new Element('div', {
                    'id': _id, 'class': _id
                });
                var container = $('ajaxpro-notice-form').up();
                if (!container) {
                    container = document.body;
                }
                container.insert({'bottom': el});
            }
            return el;
        }

        return {
            setElementId: function(id) {
                _id = id;
                return this;
            },
            show: function(){
                var el = _getElement();
                if (!el || AjaxPro.overlay.visible()
                        || navigator.appVersion.indexOf("MSIE 10") != -1) {

                    return this;
                }

                el.setOpacity(0);
                el.setStyle({display: 'block'});
                el.fade({
                    duration: AjaxPro.config.get('effect/duration'),
                    from: 0,
                    to: AjaxPro.config.get('effect/overlay_opacity')
                });
                _status = true;
                return this;
            },
            hide: function(){
                var el = _getElement();
                if (!el) {
                    return this;
                }

                if (AjaxPro.message.visible()) {
                    return this;
                }

                el.fade({
                    duration: AjaxPro.config.get('effect/duration'),
                    from: el.getOpacity(),
                    to: 0
                });
//                el.hide();
                if (this.scrollOverlayIntervalId) {
                    clearInterval(this.scrollOverlayIntervalId);
                }
                _status = false;
                return this;
            },
            visible : function () {
                return _status;
            }
        };
    }();
//    AjaxPro.observe('onLoading', AjaxPro.overlay.show.bind(AjaxPro.overlay));
    AjaxPro.observe('message:show', AjaxPro.overlay.show.bind(AjaxPro.overlay));

//    AjaxPro.observe('onFailure', AjaxPro.overlay.hide.bind(AjaxPro.overlay));
//    AjaxPro.observe('onSuccess', AjaxPro.overlay.hide.bind(AjaxPro.overlay));
    AjaxPro.observe('message:hide', AjaxPro.overlay.hide.bind(AjaxPro.overlay));
});
