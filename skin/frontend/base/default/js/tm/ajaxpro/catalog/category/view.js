/* <!-- AjaxPro --> */

AjaxPro.toolbar = function(){

    var _currentPage, _totalNum, _limit, _url;

    function _getHashParams() {
        var hash = window.location.hash.substr(1), params = {};
        hash.split("&").each(function(arg){
            arg = arg.split('=');
            if (arg[0] && arg[1]) {
                params[arg[0]] = arg[1];
            }
        });
        return params;
    }
    return {
        getTotal: function(){
            return _totalNum;
        },
        setTotal: function(total){
            _totalNum = total;
            return AjaxPro.toolbar;
        },
        getLimit: function(){
            return _limit;
        },
        setLimit: function(limit){
            _limit = limit;
            return AjaxPro.toolbar;
        },
        scrollPosition: function() {
            var scrollOffsets = document.viewport.getScrollOffsets(),
            dimensions = document.viewport.getDimensions();
            return scrollOffsets[1] + dimensions.height;
        },
        getHashParam: function(key) {
            var _params = _getHashParams();
            return _params[key];
        },
        setHashParam: function(key, value){
//            console.log(key + ' ' + value);
            var add = {};
            add[key] = value;
            var _params = Object.extend(_getHashParams(), add);
            var anchor = '';
            for(var key in _params) {
                anchor += '&' + key + '=' + _params[key];
            }
            anchor = anchor.substr(1);
            window.location.hash = anchor;
//            console.log(anchor);
            return AjaxPro.toolbar;
        },
        getPage: function(){
            return _currentPage;
        },
        setPage: function(page){
            _currentPage = page;
            if ('1' == AjaxPro.config.get('catalogCategoryView/anchor')){
                AjaxPro.toolbar.setHashParam('p', page);
            }
            return AjaxPro.toolbar;
        },
        getUrl: function(){
            return _url;
        },
        setUrl: function(url){
            _url = url;
            return AjaxPro.toolbar;
        },
        isEnd: function () {
            if ( _limit == 0 || _totalNum <= _limit * _currentPage) {
                return true;
            }
            return false;
        },
        request: function() {
            if (AjaxPro.message.visible()) {
                return;
            }
            if (AjaxPro.toolbar.isEnd()) {
                return;
            }

            if ("object" === typeof ajaxlayerednavigation) {
                var params = _getHashParams();
                AjaxPro.request({
                    'url' : _url.replace('.page.', _currentPage + 1),
                    parameters : params
                });
                return;
            }
            AjaxPro.request({
                'url' : _url.replace('.page.', _currentPage + 1)
            });
        },
        incCurrentPage: function() {
            _currentPage++;
        }
    };
}();

Event.observe(window, 'load', function() {
    // Check for possible page without tm/ajaxpro/catalog/category/init.phtml
    // @see /app/code/local/TM/AjaxPro/Model/Observer.php~534, allowedBlockNames
    if (!AjaxPro.toolbar.getTotal()) {
        return;
    }

    if ('1' == AjaxPro.config.get('catalogCategoryView/anchor')){
        Event.observe(window, 'scroll', function() {

            var current = AjaxPro.toolbar.scrollPosition(), page = 1;
            $$('.ajaxpro-category-view-anchor').each(function(item){
                if (item.offsetTop > current) {
                    throw $break;
                }
                page = item.id.substr(3);
            });
            var _page = AjaxPro.toolbar.getHashParam('p');
            if (_page != page) {
                AjaxPro.toolbar.setHashParam('p', page);
            }
        });
    }

    if ("scroll"  == AjaxPro.config.get('catalogCategoryView/type')) {

        Event.observe(window, 'scroll', function() {

            var topElement = $$('.toolbar-bottom').last();
            if (!topElement) {
                return;
            }

            var currentTopPosition = AjaxPro.toolbar.scrollPosition(),
            elementTopPosition = topElement.offsetTop;

            if (elementTopPosition > currentTopPosition || Ajax.activeRequestCount > 0) {

                return;
            }

            AjaxPro.toolbar.request();
        });

    } else {

        var title = Translator.translate('More Products');
        AjaxPro.toolbar.addButton = function() {

            if ($('ajaxpro-scrolling-button')) {
                return;
            }
            var toolbarBottom = $$('.toolbar-bottom').last();
            if (!toolbarBottom) {
                return;
            }

            toolbarBottom.insert({
                'before': '<button id="ajaxpro-scrolling-button" type="button" title="'+ title +'" class="button">'
                        + '<span><span>'+ title +'</span></span></button>'
            });

            if (AjaxPro.toolbar.isEnd()) {
                $('ajaxpro-scrolling-button').hide();
            }

            Event.observe($('ajaxpro-scrolling-button'), 'click', AjaxPro.toolbar.request);
            return true;
        };

        AjaxPro.toolbar.addButton();
        AjaxPro.observe('addObservers', AjaxPro.toolbar.addButton);
    }


    AjaxPro.toolbar.appendProductList = function(html) {
        var el = $('ajaxpro-scrolling-button');
        if (!el) {
            el = $$('.toolbar-bottom').last();
        }
        if (el) {
            el.insert({'before': html.stripScripts()});
            html.extractScripts().map(function(script) {
//                return window.eval.defer(script);
                try {
                    return window.eval.defer(script);
                } catch (err) {
                    console.log(script);
                    console.error(err);
                }
            });

            AjaxPro.toolbar.incCurrentPage();
            if (AjaxPro.toolbar.isEnd() && $('ajaxpro-scrolling-button')) {
                $('ajaxpro-scrolling-button').hide();
            }
        }
        // fix pager amount
        var t = AjaxPro.toolbar;
        count = [t.getLimit() * t.getPage(), t.getTotal()].min();
        $$('.toolbar .amount').each(function(el){
            el.innerHTML = el.innerHTML.replace(/(\d+)([^\d]*)\d+/, '$1$2' + count);
        });

        //remove last css class
        $$('.products-grid.last').each(function(el){
            el.removeClassName('last');
        });
//        $$('.pager .pages').invoke('hide');
        $$('.pager .pages').each(function(pager){
            var firstActiveLi = pager.select('li.current').first();
            if (!firstActiveLi) {
                // don't do anything if theme is not using .current class name
                return;
            }

            // detect the first and last li's to activate
            var firstLi = pager.select('li').first(),
                firstA,
                start = firstActiveLi.previousSiblings().size(), // offset, to skip the a.previous
                end   = t.getPage();

            if (!firstActiveLi.down('a')) {
                var startValue = parseInt(firstActiveLi.innerHTML);
                if ('number' != typeof startValue) {
                    startValue = start;
                }
                end = start + (t.getPage() - startValue) + 1;
            } else if (firstLi && (firstA = firstLi.down('a'))) {
                end += (firstA.hasClassName('previous') ? 1 : 0); // offset, if a.previous is the first li
            }
            pager.select('li').slice(start, end).invoke('addClassName', 'current');

            // hide the next page button
            if (t.isEnd()) {
                var lastLi = pager.select('li').last();
                if (lastLi.down('a.next')) {
                    lastLi.hide();
                }
            }
        });
    };

    var productListEvents = [
        'onSuccess:catalog:category:view',
        'onSuccess:catalogsearch:result:index',
        'onSuccess:catalogsearch:advanced:result',
        'onSuccess:attributepages:page:view'
        //'onSuccess:' + AjaxPro.toolbar.getUrl().replace(AjaxPro.config.get('baseUrl'), '').split('/').first()  // if _url_rewrite => true
    ];
    productListEvents.each(function(eventName) {
        AjaxPro.observe(eventName, function(e) {
            var r = e.memo.response;
            if (!r.custom.product_list) {
                return false;
            }
            AjaxPro.toolbar.appendProductList(r.custom.product_list);

            if ('undefined'!= typeof setGridItemsEqualHeight && jQuery) {
                setGridItemsEqualHeight(jQuery);
            }
        });
    });
});
