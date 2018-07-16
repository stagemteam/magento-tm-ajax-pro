TMQtySwitcherCart = function () {
    function _inc() {
        var element = this;
            step = 1,
            min = 0,
            max = 10000,
            value = element.value;

        if (isNaN(value)) {
            value = min;
        } else {
            value = parseFloat(value);
        }

        if (max >= value + step) {
            element.value = value + step;
        }

        return true;
    }

    function _dec() {
        var element = this,
            step = 1,
            min = 0,
            value = element.value;

        if (isNaN(value)) {
            value = min;
        } else {
            value = parseFloat(value);
        }

        if (min <= value - step) {
            element.value = value - step;
        }

        return true;
    }

    function _init() {
        $$("#shopping-cart-table .qty").each(function(el){
            if (el.up().hasClassName('qty-switcher-cart-wrapper')) {
                return;
            }
            var span2 = "<span><span>%s</span></span>";
            span2 = "%s";
            var decElement = new Element('a', {class:'qty qty-switcher-dec'})
                    .update(span2.replace('%s', '')),
                incElement = new Element('a', {class:'qty qty-switcher-inc'})
                    .update(span2.replace('%s', ''));
            incElement.observe('click', _inc.bind(el));
            decElement.observe('click', _dec.bind(el));

            el.observe('keydown', function(e){
                if (38 === e.keyCode) {
                    _inc.bind(el)();
                }
                if (40 === e.keyCode) {
                    _dec.bind(el)();
                }
            });

            var div = new Element('div', { 'class': 'qty-switcher-cart-wrapper' });
            el.wrap(div);

            el.insert({
                before: decElement,
                after: incElement
            });

            el.writeAttribute('autocomplete', 'off');
        });
    }

    if ('complete' === document.readyState) {
        _init();
    } else if (Prototype.Browser.IE) {
        Event.observe(window, 'load', _init);
    } else {
        document.observe("dom:loaded", _init);
    }

    [
        'AjaxPro:onComplete:checkout:cart:after',
        'AjaxPro:onComplete:wishlist:index:after'
    ]
    .map(function(eventName){
        document.observe(eventName, function() {_init();});
    });

    ['AjaxPro:message:show:after']
        .map(function(eventName){
            document.observe(eventName, function() {
                var selector = '#ajaxpro-notice-form #shopping-cart-table';
                if ($$(selector).length > 0) {
                    _init();
                }
            });
        });

    return true;
}();
