document.observe("dom:loaded", function (){

    AjaxPro.observe('addObservers', function() {

        setLocation = setLocation.wrap(function(callOriginal, url) {
            if (-1 != url.search('wishlist/index/cart')) {
                return AjaxPro.request({'url' : url});
            }
            return callOriginal(url);
        });

        $$('a').each(function(element){
            var url = element.getAttribute('href');

            if (url && ((url.search('wishlist/index/add') != -1)
                ||(url.search('wishlist/index/remove') != -1)
                ||(url.search('wishlist/index/cart') != -1)
                ||(url.search('wishlist/index/fromcart') != -1)
                ))
            {
                element.stopObserving('click');
                element.setAttribute('onclick', '');
                element.observe('click', function(e) {
                    AjaxPro.fire('click:stop', e);
                    Event.stop(e);
                    if ('1' == AjaxPro.config.get('wishlistIndex/enabledDeleteConfirm')) {
                        if (url.search('wishlist/index/remove') != -1
                            && !confirm(Translator.translate('Are you sure you would like to remove this item from the wishlist?')))
                        {
                            return false;
                        }
                    }

                    var params = {};
                    if (url.search('wishlist/index/add') != -1
                        && -1 != AjaxPro.config.get('handles').indexOf('PRODUCT_TYPE_configurable')) {

                        var form = element.up('form');
                        if (form && form.serialize) {
                            params = form.serialize(true);
                        }
                    }

                    AjaxPro.request({
                        'url'    : url,
                        parameters : params
                    });
    //                if (window.opener) {
    //                    window.opener.location.reload(false);
    //                }

                    return false;
                });
                return false;
            }
        });
    });

    AjaxPro.observe('onLoading:wishlist', function() {
        if (!AjaxPro.opacity) {
            return;
        }
        AjaxPro.opacity
            .setSelector('.block-wishlist')
            .show(0.5)
        ;
    });

    AjaxPro.observe('onFailure:wishlist', function() {
        if (!AjaxPro.opacity) {
            return;
        }
        AjaxPro.opacity
            .setSelector('.block-wishlist')
            .hide()
        ;
    });

});