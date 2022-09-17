import { c as qHook, h } from './q-5e3e51c6.js';

const MyApp_onRender = /*#__PURE__*/ qHook((props, state)=>{
    return h("div", null, h("p", {
        style: {
            'text-align': 'center'
        }
    }, h("a", {
        href: "https://github.com/builderio/qwik"
    }, h("img", {
        alt: "Qwik Logo",
        width: 400,
        src: "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F667ab6c2283d4c4d878fb9083aacc10f"
    }))), h("p", null, "Congratulations Qwik is working!"), h("p", null, "Next steps:"), h("ol", null, h("li", null, "Open dev-tools network tab and notice that no JavaScript was downloaded to render this page. (Zero JavaScript no matter the size of your app.)"), h("li", null, "Try interacting with this component by changing", ' ', h("input", {
        value: state.name,
        "on:keyup": qHook(()=>import('./q-abc9e386.js')
        , "MyApp_onRender_on_keyup")
    }), "."), h("li", null, "Observe that the binding changes: ", h("code", null, "Hello ", state.name, "!")), h("li", null, "Notice that Qwik automatically lazily-loaded and hydrated the component upon interaction without the developer having to code that behavior. (Lazy hydration is what gives even large apps instant on behavior.)"), h("li", null, "Read the docs ", h("a", {
        href: "https://github.com/builderio/qwik"
    }, "here"), "."), h("li", null, "Replace the content of this component with your code."), h("li", null, "Build amazing web-sites with unbeatable startup performance.")), h("hr", null), h("p", {
        style: {
            'text-align': 'center'
        }
    }, "Made with ❤️ by", ' ', h("a", {
        target: "_blank",
        href: "https://www.builder.io/"
    }, "Builder.io")));
});

export { MyApp_onRender };
