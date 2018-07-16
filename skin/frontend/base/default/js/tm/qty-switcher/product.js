TMQtySwitcherProduct = function () {
    var _config, _element = false;

    function _getElement() {
        // if (!_element) {
            _element = $('qty');
        // }
        return _element;
    }

    function _inc() {
        var el = _getElement(),
            step = _config.step,
            min = _config.min,
            max = _config.max,
            value = el.value;

        if (isNaN(value)) {
            value = min;
        } else {
            value = parseFloat(value);
        }

        if (max >= value + step) {
            el.value = value + step;
        }
        return true;
    }

    function _dec() {
        var el = _getElement(),
            step = _config.step,
            min = _config.min,
            max = _config.max,
            value = el.value;

        if (isNaN(value)) {
            value = min;
        } else {
            value = parseFloat(value);
        }

        if (min <= value - step) {
            value = value - step;
            if (value > max) {
                value = max;
            }
            el.value = value;
        }
        return true;
    }

    function __init() {
        var el = _getElement();
        if (!el) {
            return;
        }
        var previous = el.previous();
        if (previous &&
            (previous.hasClassName('qty qty-switcher-dec') ||
            previous.hasClassName('qty qty-switcher-inc'))) {

            return;
        }

        var span2 = "<span><span>%s</span></span>";
        span2 = "%s";
        var decElement = new Element('a', {class:'qty qty-switcher-dec'})
                .update(span2.replace('%s', '')),
            incElement = new Element('a', {class:'qty qty-switcher-inc'})
                .update(span2.replace('%s', ''));
        incElement.observe('click', _inc);
        decElement.observe('click', _dec);

        el.wrap('div', {class: 'qty-increment'}).insert({
            top: decElement,
            bottom: incElement
        });

        el.observe('keydown', function(e){
            if (38 === e.keyCode) {
                _inc();
            }
            if (40 === e.keyCode) {
                _dec();
            }
        });

        el.writeAttribute('autocomplete', 'off');
    }

    function _init() {
        var el = $('tm-qty-switcher-config');
        if (!el) {
            return;
        }
        try {
            var config = el.readAttribute('data-config');
            config = JSON.parse(config);

            _config = {
                min: 1,
                max: 100,
                step: 1
            };

            if (config && config.current_product) {
                _config = config.current_product;
            }

            __init();
        } catch (e) {}
    }

    if ('complete' === document.readyState) {
        _init();
    } else if (Prototype.Browser.IE) {
        Event.observe(window, 'load', _init);
    } else {
        document.observe("dom:loaded", _init);
    }
    [
        //ajaxpro integration, product view events
        'AjaxPro:message:show:after',
    ].map(function(eventName){
        document.observe(eventName, function() {
            var productForm = $('ajaxpro-addcustomproduct-view');
            if (productForm) {
                _init();
            }
        });
    });

    return true;
}();
