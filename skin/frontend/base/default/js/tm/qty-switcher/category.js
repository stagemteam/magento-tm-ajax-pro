TMQtySwitcher = function () {
    var step = 1,
        min = 1,
        max = 10000;

    function _inc() {
        var element = this,
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

    function trimChar(string, charToRemove) {
        while(string.charAt(0)==charToRemove) {
            string = string.substring(1);
        }

        while(string.charAt(string.length-1)==charToRemove) {
            string = string.substring(0,string.length-1);
        }

        return string;
    }

    function _getConfig() {
        var el = $('tm-qty-switcher-config');
        if (!el) {
            return {};
        }
        try {
            var config = el.readAttribute('data-config');
            config = JSON.parse(config);
        } catch (e) {
            return {};
        }
        return config;
    }

    function _getQtyElement()
    {
        var qtyElement, type, config = _getConfig();

        if (config && config.category && config.category.type) {
            type = config.category.type;
        }
        if ('select' == type) {
            qtyElement = new Element('select', {
                value: 1,
                title: 'Qty',
                class: 'input-select qty',
            });
            var option;
            step = 1;
            max = 20;
            for (var i = 1; i <= max; i++) {
                option = new Element('option', {value: i}).update(i);
                qtyElement.insert(option);
            }
        } else {
            qtyElement = new Element('input', {
                type: 'text',
                maxlength: 12,
                value: 1,
                title: 'Qty',
                class: 'input-text qty',
                autocomplete: 'off'
            });
        }

        return qtyElement;
    }

    function _init() {
        $$('.category-products button.btn-cart').each(function(button){
            var uri = button.readAttribute('onClick')
               .replace(/^setLocation\(\'/, '')
               .replace(/\'\)$/, '');

            if (-1 === uri.indexOf('/checkout/cart/add/')) {
                return false;
            }
            uri = trimChar(uri, '/');

            var qtyElement = _getQtyElement();

            var span2 = "<span><span>%s</span></span>";
            span2 = "%s";
            var decElement = new Element('a', {class:'qty qty-switcher-dec'})
                    .update(span2.replace('%s', '')),
                incElement = new Element('a', {class:'qty qty-switcher-inc'})
                    .update(span2.replace('%s', ''));

            incElement.observe('click', _inc.bind(qtyElement));
            decElement.observe('click', _dec.bind(qtyElement));
            qtyElement.observe('keydown', function(e){
                if (38 === e.keyCode) {
                    _inc.bind(qtyElement)();
                }
                if (40 === e.keyCode) {
                    _dec.bind(qtyElement)();
                }
            });
            var div = new Element('div', {class: 'qty-increment'});

            button.writeAttribute('onclick', function(){return false;});
            button.onclick = function(){return false;};
            button.observe('click', function() {
                setLocation(uri + '/qty/' + qtyElement.value + '/');
            });
            qtyElement.observe('keyup', function() {
                button.stopObserving('click');
                button.observe('click', function() {
                    setLocation(uri + '/qty/' + qtyElement.value + '/');
                });
            });

            div = div.insert(decElement)
                .insert(qtyElement)
                .insert(incElement);

            var actions = button.up('.actions');
            // Fix list mode
            if ('undefined' == typeof actions) {
                actions = button.up('.action');
            }
            if ('undefined' == typeof actions) {
                actions = button.up('p');
            }
            if (actions) {
                actions.insert({top:div});
            }
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
        //ajaxpro integration, product listings events
        'AjaxPro:onSuccess:catalog:category:view',
        'AjaxPro:onSuccess:catalogsearch:result:index',
        'AjaxPro:onSuccess:catalogsearch:advanced:result',
        'AjaxPro:onSuccess:attributepages:page:view',
        //ajaxlayerednavigation integration
        'ajaxlayerednavigation:ready'
    ].map(function(eventName){
        document.observe(eventName, function() {_init();});
    });
    return true;
}();
