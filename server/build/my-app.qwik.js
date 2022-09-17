'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('./core-f6bb0836.js');

const MyApp = /*#__PURE__*/ core.qComponent({
    tagName: 'my-app',
    onMount: core.qHook(()=>Promise.resolve().then(function () { return require('./h_my-app-b6925def.js'); })
    , "MyApp_onMount"),
    onRender: core.qHook(()=>Promise.resolve().then(function () { return require('./h_my-app-3be4f273.js'); })
    , "MyApp_onRender")
});

exports.MyApp = MyApp;
