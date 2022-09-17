import { c as qHook, u as useEvent } from './q-5e3e51c6.js';

const MyApp_onRender_on_keyup = /*#__PURE__*/ qHook((props, state)=>{
    const event = useEvent();
    const input = event.target;
    state.name = input.value;
});

export { MyApp_onRender_on_keyup };
