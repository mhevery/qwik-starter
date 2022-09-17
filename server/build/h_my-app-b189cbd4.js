'use strict';

var core = require('./core-f6bb0836.js');

const MyApp_onRender_on_keyup = /*#__PURE__*/ core.qHook((props, state)=>{
    const event = core.useEvent();
    const input = event.target;
    state.name = input.value;
});

exports.MyApp_onRender_on_keyup = MyApp_onRender_on_keyup;
