/* <!-- AjaxPro --> */
AjaxPro.config = function(){

    var _config = {};

    return {
        init: function(config) {
            Object.extend(_config, config);
            return AjaxPro.config;
        },
        set: function(path, value) {
            var config = {};
            config[path] = value;
            Object.extend(_config, config);
            return AjaxPro.config;
        },
        get: function(path) {
            path = path || false;
            if (!path) {
                return _config;
            }
            var value = _config;
            try {
                path.split('/').each(function(_path){
                    value = value[_path];
                });
            } catch (e) {
                console.error('AjaxPro.config(\'' + path + '\') is undefined');
                console.error(e);
                return;
            }
            return value;
        }
}}();