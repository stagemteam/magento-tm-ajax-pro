document.observe("dom:loaded", function (){

    AjaxPro.observe('addObservers', function() {

        $$('a').each(function(element){
            var url = element.getAttribute('href');

            if (url &&
                ((url.search('catalog/product_compare/add') != -1)
                || (url.search('catalog/product_compare/remove') != -1)
                || (url.search('catalog/product_compare/clear') != -1)
                ))
            {
                element.stopObserving('click');

                if (url.search('catalog/product_compare/remove') != -1) {
                    element.setAttribute('onclick', '');
                }

                if (url.search('catalog/product_compare/clear') != -1) {
                    element.setAttribute('onclick', '');
                }

                element.observe('click', function(e) {
                    AjaxPro.fire('click:stop', e);
                    Event.stop(e);
                    if ('1' == AjaxPro.config.get('catalogProductCompare/enabledDeleteConfirm')) {
                        var confirmation = true;
                        if (url.search('catalog/product_compare/remove') != -1) {
                            confirmation = confirm(
                                Translator.translate(
                                    'Are you sure you would like to remove this item from the compare products?'
                            ));
                        }
                        if (url.search('catalog/product_compare/clear') != -1) {
                            confirmation = confirm(
                                Translator.translate(
                                    'Are you sure you would like to remove all products from your comparison?'
                        ));
                        }
                        if (!confirmation) {
                            return false;
                        }
                    }

                    AjaxPro.request({'url' : url});
                    return false;
                });
                return false;
            }
        });
    });

    AjaxPro.observe('onLoading:catalog:product_compare', function() {
        if (!AjaxPro.opacity) {
            return;
        }
        AjaxPro.opacity
            .setSelector('.block-compare').show(0.5)
            .setSelector('.block-compared').show(0.5)
        ;
    });

    AjaxPro.observe('onFailure:catalog:product_compare', function() {
        if (!AjaxPro.opacity) {
            return;
        }
        AjaxPro.opacity
            .setSelector('.block-compare').hide()
            .setSelector('.block-compared').hide()
        ;
    });

});