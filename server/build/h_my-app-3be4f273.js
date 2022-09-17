'use strict';

var core = require('./core-f6bb0836.js');

const MyApp_onRender = /*#__PURE__*/ core.qHook((props, state)=>{
    return core.h("div", null, core.h("p", {
        style: {
            'text-align': 'center'
        }
    }, core.h("a", {
        href: "https://github.com/builderio/qwik"
    }, core.h("img", {
        alt: "Qwik Logo",
        width: 400,
        src: "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F667ab6c2283d4c4d878fb9083aacc10f"
    }))), core.h("p", null, "Congratulations Qwik is working!"), core.h("p", null, "Next steps:"), core.h("ol", null, core.h("li", null, "Open dev-tools network tab and notice that no JavaScript was downloaded to render this page. (Zero JavaScript no matter the size of your app.)"), core.h("li", null, "Try interacting with this component by changing", ' ', core.h("input", {
        value: state.name,
        "on:keyup": core.qHook(()=>Promise.resolve().then(function () { return require('./h_my-app-b189cbd4.js'); })
        , "MyApp_onRender_on_keyup")
    }), "."), core.h("li", null, "Observe that the binding changes: ", core.h("code", null, "Hello ", state.name, "!")), core.h("li", null, "Notice that Qwik automatically lazily-loaded and hydrated the component upon interaction without the developer having to code that behavior. (Lazy hydration is what gives even large apps instant on behavior.)"), core.h("li", null, "Read the docs ", core.h("a", {
        href: "https://github.com/builderio/qwik"
    }, "here"), "."), core.h("li", null, "Replace the content of this component with your code."), core.h("li", null, "Build amazing web-sites with unbeatable startup performance.")), core.h("hr", null), core.h("p", {
        style: {
            'text-align': 'center'
        }
    }, "Made with ❤️ by", ' ', core.h("a", {
        target: "_blank",
        href: "https://www.builder.io/"
    }, "Builder.io")));
});

exports.MyApp_onRender = MyApp_onRender;
