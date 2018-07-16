document.observe("dom:loaded", function (){

    AjaxPro.observe('addObservers', function() {

        setLocation = setLocation.wrap(function(callOriginal, url) {
            var handles = AjaxPro.config.get('handles');

            if (-1 != url.search('options=cart')
                && "object" == typeof Product
                && -1 == handles.indexOf('PRODUCT_TYPE_configurable')) {

                return AjaxPro.request({'url' : url});
            }
            return callOriginal(url);
        });
    });

//    AjaxPro.observe('onLoading:checkout', function() {
//        var el = $('ajaxpro-addcustomproduct-view').up('.ajaxpro-form');
//        if (el) {
//            el.hide();
//        }
//    });
});
