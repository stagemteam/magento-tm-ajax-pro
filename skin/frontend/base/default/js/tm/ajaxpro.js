/* <!-- AjaxPro -->
     _     _            ____
    / \   (_) __ ___  _|  _ \ _ __ ___
   / _ \  | |/ _` \ \/ / |_) | '__/ _ \
  / ___ \ | | (_| |>  <|  __/| | | (_) |
 /_/   \_\/ |\__,_/_/\_\_|   |_|  \___/
        |__/
*/
AjaxPro = function () {

    var _comments = [];

    function _findComments() {
       //get all comments
        var elements = document.getElementsByTagName('*');
        var comments = [];
        for(var i in elements) {
            if (elements[i] && elements[i].childNodes) {
                var nodes = elements[i].childNodes;
            } else {
                continue;
            }
            for (var j in nodes) {
                var node = nodes[j];
                if (node && 8 == node.nodeType
                    && node.data && 1 == node.data.indexOf('ajaxpro_')) {

                    comments.push(node);
                }
            }
        }
        _comments = comments;
    }
    function _replaceBlock(blockName, html) {

        if (Prototype.Browser.IE) {
            html = "&zwnj;" + html; // IE8 bugfix
        }

        function __getCommentNode(id) {
            for(var i in _comments) {
                if (_comments[i] && _comments[i].data == "[" + id + "]") {
                    var node = _comments[i];
                    delete _comments[i];
                    return node;
                }
            }
            return false;
        }

        function __replace(start, end) {
            var node = start;
            var parent = start.parentNode;
            if (!parent) {
                return;
            }
            do {
                var remove = node;
                node = node.nextSibling;
                parent.removeChild(remove);
            } while (node && node != end);

    //        try {
    //            var range = document.createRange();
    //            var frag = range.createContextualFragment(html);
    //            parent.replaceChild(frag, end);
    //        } catch(err) {
                var tempdiv = document.createElement('div');
                tempdiv.innerHTML = html;
                node = tempdiv.firstChild;
                var next = node.nextSibling;
                while (node) {
                    parent.insertBefore(node, end);
                    node = next;
                    next = node ? node.nextSibling : undefined;
                }
                parent.removeChild(end);
    //        }
        }

        var start, end;
        while ((start = __getCommentNode('ajaxpro_' + blockName + '_start')) &&
            (end = __getCommentNode('ajaxpro_' + blockName + '_end'))) {

            __replace(start, end);
        }
    }
    function _getConfig(path) {
        return AjaxPro.config.get(path);
    }

    var _globalEval = (function() {
        var eval0 = (function(original, Object) {
            try {
                return [eval][0]('Object') === original;
            } catch (e) {
                return false;
            }
        }(Object, false));
        if (eval0) {
            return function(expression) {
                return [eval][0](expression);
            };
        } else {
            return function(expression) { // Safari
                return eval.call(window, expression);
            };
        }
    }());

    return {
        version: function(){
            return AjaxPro.config.get('version');
        },
        init: function() {

            // ie9 fix
            Event.stop = Event.stop.wrap(function(callOriginal, event) {
                if (typeof event != 'undefined') {
                    event.preventDefault ? event.preventDefault() : event.returnValue = false;
                }
                return callOriginal(event);
            });

            AjaxPro.fire('init');
            AjaxPro.fire('addObservers');

            Ajax.Responders.register({
                onComplete: function() {
                    AjaxPro.fire.delay(1, 'addObservers');
                }
            });

        },
        /**
         * url, method, parameters
         *
         * request function
         */
        request: function (request) {

            var parser = document.createElement('a');
            parser.href = request.url;

            var fires = request.url
                .replace(/https{0,1}\:\/\//, '')
                .replace(_getConfig('baseUrl').replace(/https{0,1}\:\/\//, ''), '');

            fires = fires.split('/').splice(0, 3);

            request.url = request.url.replace(/https{0,1}\:/, window.location.protocol);
            request.url = request.url.replace(/\/uenc\/[a-zA-Z0-9,]+\//, '/');
            request.url = request.url.replace(parser.hostname, window.location.hostname);

            request.method = 'post',//request.method || 'post',
            request.parameters = Object.extend(
                {'handles[]': _getConfig('handles'), ajaxpro: 1, in_cart: 1},
                request.parameters || {}
            ),
            refererParam = _getConfig('_refererParam');
            request.parameters[refererParam] = _getConfig(refererParam);

            new Ajax.Request(request.url, {
                parameters: request.parameters,
                method: request.method,
                onLoading: function() {
                    fires.unshift('onLoading');
                    AjaxPro.fire(fires, request);
                },
                onFailure : function(transport) {
                    window.location = request.url;
                },
                onComplete: function(transport) {
                    var response = transport.responseJSON;
                    if (!response) {
                        try {
                            response = transport.responseText.evalJSON();
                        } catch(err) {
                            console.error(err);
                        }
                    }
                    request.response = response;
    //                if (!response || 200 != transport.status || !response.status) {
    //                    fires.unshift('onFailure');
    //                    AjaxPro.fire(fires, request);
    //                    return;
    //                }
                    /////////////////////
                    _findComments();
                    if (response && response.layout) {
                        var content;
                        for (var block in response.layout) {
                            try {
                                content = response.layout[block];
                                _replaceBlock(block, content.stripScripts());
                                content.extractScripts().map(function(script) {
                                    try {
                                        return _globalEval.defer(script);
                                        // return window.eval.defer(script);
                                    } catch (err) {
                                        console.log(script);
                                        console.error(err);
                                    }
                                });
                            } catch (err) {
                                console.error(err);
                            }
                        }
                    }
                    var _fires = fires;
                    _fires.unshift('onComplete');
                    AjaxPro.fire(_fires, request);

                    if (!response || 200 != transport.status || !response.status) {
                        fires.unshift('onFailure');
                    } else {
                        ///////////////
                        fires.unshift('onSuccess');
                    }
                    AjaxPro.fire(fires, request);
                }
            });
        },
        fire: function(eventName, memo) {
            var events = [], _eventName;
            if ('string' == typeof eventName) {
                events.push(eventName);
            } else {
                events = eventName.slice();
                eventName.shift();
            }
            while(events.length) {
                _eventName = 'AjaxPro:' + events.join(':');
                Element.fire(document, _eventName + ':before', memo);
                Element.fire(document, _eventName, memo);
                Element.fire(document, _eventName + ':after', memo);
                events.pop();
            }
        },
        observe: function(eventName, handler) {
            if (eventName instanceof Array) {
                eventName.each(function(_eventName){
                    Element.observe(document, 'AjaxPro:' + _eventName, handler);
                });
            } else {
    //        handler = handler || function(e) {debugger; console.log(e);};
                Element.observe(document, 'AjaxPro:' + eventName, handler);
            }
        }
        }
}();
