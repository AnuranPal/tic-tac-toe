var Evented = {
    on: function (eventName, callback, domElement) {
        $(domElement || this).on(eventName, callback);
    },

    off: function (eventName, callback, domElement) {
        $(domElement || this).off(eventName, callback);
    },

    trigger: function (eventName, params, domElement) {
        $(domElement || this).trigger(eventName, params);
    }
}
