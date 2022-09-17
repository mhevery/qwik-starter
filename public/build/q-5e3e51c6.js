/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
function flattenArray(array, dst) {
    // Yes this function is just Array.flat, but we need to run on old versions of Node.
    if (!dst)
        dst = [];
    for (const item of array) {
        if (Array.isArray(item)) {
            flattenArray(item, dst);
        }
        else {
            dst.push(item);
        }
    }
    return dst;
}

/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
// minification can replace the `globalThis.qDev` with `false`
// which will remove all dev code within from the build
const qDev = globalThis.qDev !== false;
const qTest = globalThis.describe !== undefined;
const qGlobal = globalThis;

/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
const EMPTY_ARRAY = [];
const EMPTY_OBJ = {};
if (qDev) {
    Object.freeze(EMPTY_ARRAY);
    Object.freeze(EMPTY_OBJ);
}

/**
 * @public
 */
function jsx(type, props, key) {
    return new JSXNodeImpl(type, props, key);
}
class JSXNodeImpl {
    constructor(type, props, key) {
        this.type = type;
        this.props = props;
        this.key = key;
        if (props && props.children !== undefined) {
            if (Array.isArray(props.children)) {
                this.children = props.children;
            }
            else {
                this.children = [props.children];
            }
        }
        else {
            this.children = EMPTY_ARRAY;
        }
    }
}
const isJSXNode = (n) => {
    if (qDev) {
        if (n instanceof JSXNodeImpl) {
            return true;
        }
        if (n && typeof n === 'object' && n.constructor.name === JSXNodeImpl.name) {
            throw new Error(`Duplicate implementations of "JSXNodeImpl" found`);
        }
        return false;
    }
    else {
        return n instanceof JSXNodeImpl;
    }
};
/**
 * @public
 */
const Fragment = {};

/* eslint-disable */
/**
 * @public
 */
function h(type, props, ...children) {
    // Using legacy h() jsx transform and morphing it
    // so it can use the modern vdom structure
    // https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
    // https://www.typescriptlang.org/tsconfig#jsxImportSource
    const normalizedProps = {
        children: arguments.length > 2 ? flattenArray(children) : EMPTY_ARRAY,
    };
    let key;
    let i;
    for (i in props) {
        if (i == 'key')
            key = props[i];
        else
            normalizedProps[i] = props[i];
    }
    return new JSXNodeImpl(type, normalizedProps, key);
}

/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
function assertDefined(value, text) {
    if (qDev) {
        if (value != null)
            return;
        throw newError(text || 'Expected defined value.');
    }
}
function assertNotEqual(value1, value2, text) {
    if (qDev) {
        if (value1 !== value2)
            return;
        throw newError(text || `Expected '${value1}' !== '${value2}'.`);
    }
}
function assertEqual(value1, value2, text) {
    if (qDev) {
        if (value1 === value2)
            return;
        throw newError(text || `Expected '${value1}' === '${value2}'.`);
    }
}
function assertGreaterOrEqual(value1, value2, text) {
    if (qDev) {
        if (value1 >= value2)
            return;
        throw newError(text || `Expected '${value1}' >= '${value2}'.`);
    }
}
function assertGreater(value1, value2, text) {
    if (qDev) {
        if (value1 > value2)
            return;
        throw newError(text || `Expected '${value1}' > '${value2}'.`);
    }
}
function newError(text) {
    debugger; // eslint-disable-line no-debugger
    const error = new Error(text);
    console.error(error); // eslint-disable-line no-console
    return error;
}

/**
 * Returns true if the `node` is `Element` and of the right `tagName`.
 *
 * @param node
 * @private
 */
function isDomElementWithTagName(node, tagName) {
    return isHtmlElement(node) && node.tagName.toUpperCase() == tagName.toUpperCase();
}
/**
 * @private
 */
function isTemplateElement(node) {
    return isDomElementWithTagName(node, 'template');
}
/**
 * @private
 */
function isQSLotTemplateElement(node) {
    return isTemplateElement(node) && node.hasAttribute("q:slot" /* QSlotAttr */);
}
/**
 * @private
 */
function isComponentElement(node) {
    return isHtmlElement(node) && node.hasAttribute("on:q-render" /* OnRender */);
}
/**
 * @private
 */
function isHtmlElement(node) {
    return node ? node.nodeType === 1 /* ELEMENT_NODE */ : false;
}

/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
function isNode(value) {
    return value && typeof value.nodeType == 'number';
}
function isDocument(value) {
    return value && value.nodeType == 9 /* DOCUMENT_NODE */;
}
function isComment(value) {
    return isNode(value) && value.nodeType == 8 /* COMMENT_NODE */;
}

const createPlatform = (doc) => {
    let queuePromise;
    let storePromise;
    return {
        import: (url) => import(url),
        toPath: (url) => {
            url = new URL(String(url));
            url.hash = '';
            url.search = '';
            return url.href + '.js';
        },
        queueRender: (renderMarked) => {
            if (!queuePromise) {
                queuePromise = new Promise((resolve, reject) => doc.defaultView.requestAnimationFrame(() => {
                    queuePromise = null;
                    renderMarked(doc).then(resolve, reject);
                }));
            }
            return queuePromise;
        },
        queueStoreFlush: (flushStore) => {
            if (!storePromise) {
                storePromise = new Promise((resolve, reject) => doc.defaultView.requestAnimationFrame(() => {
                    storePromise = null;
                    flushStore(doc).then(resolve, reject);
                }));
            }
            return storePromise;
        },
    };
};
/**
 * @public
 */
const setPlatform = (doc, plt) => (doc[DocumentPlatform] = plt);
/**
 * @public
 */
const getPlatform = (docOrNode) => {
    const doc = isDocument(docOrNode) ? docOrNode : docOrNode.ownerDocument;
    return (doc[DocumentPlatform] ||
        (doc[DocumentPlatform] = createPlatform(doc)));
};
const DocumentPlatform = /*@__PURE__*/ Symbol();

/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
function stringifyDebug(value) {
    if (value == null)
        return String(value);
    if (typeof value === 'function')
        return value.name;
    if (isHtmlElement(value))
        return stringifyElement(value);
    if (value instanceof URL)
        return String(value);
    if (typeof value === 'object')
        return JSON.stringify(value, function (key, value) {
            if (isHtmlElement(value))
                return stringifyElement(value);
            return value;
        });
    return String(value);
}
function stringifyElement(element) {
    let html = '<' + element.tagName.toLowerCase();
    const attributes = element.attributes;
    const names = [];
    for (let i = 0; i < attributes.length; i++) {
        names.push(attributes[i].name);
    }
    names.sort();
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        let value = element.getAttribute(name);
        if (value === null || value === void 0 ? void 0 : value.startsWith('file:/')) {
            value = value.replace(/(file:\/\/).*(\/.*)$/, (all, protocol, file) => protocol + '...' + file);
        }
        html +=
            ' ' + name + (value == null || value == '' ? '' : "='" + value.replace("'", '&apos;') + "'");
    }
    return html + '>';
}

/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
function qError(code, ...args) {
    if (qDev) {
        const text = codeToText(code);
        const parts = text.split('{}');
        const error = parts
            .map((value, index) => {
            return value + (index === parts.length - 1 ? '' : stringifyDebug(args[index]));
        })
            .join('');
        debugger; // eslint-disable-line no-debugger
        return new Error(error);
    }
    else {
        return new Error(`QError ` + code);
    }
}
function codeToText(code) {
    const area = {
        0: 'ERROR',
        1: 'QRL-ERROR',
        2: 'INJECTOR-ERROR',
        3: 'SERVICE-ERROR',
        4: 'COMPONENT-ERROR',
        5: 'PROVIDER-ERROR',
        6: 'RENDER-ERROR',
        7: 'EVENT-ERROR',
    }[Math.floor(code / 100)];
    const text = {
        [1 /* Core_qConfigNotFound_path */]: "QConfig not found in path '{}'.",
        [2 /* Core_unrecognizedStack_frame */]: "Unrecognized stack format '{}'",
        [3 /* Core_noAttribute_atr1_element */]: "Could not find entity state '{}' at '{}' or any of it's parents.",
        [4 /* Core_noAttribute_atr1_attr2_element */]: "Could not find entity state '{}' ( or entity provider '{}') at '{}' or any of it's parents.",
        [5 /* Core_missingProperty_name_props */]: "Missing property '{}' in props '{}'.",
        [6 /* Core_missingExport_name_url_props */]: "Missing export '{}' from '{}'. Exported symbols are: {}",
        //////////////
        [100 /* QRL_expectFunction_url_actual */]: "QRL '${}' should point to function, was '{}'.",
        //////////////
        [200 /* Injector_noHost_element */]: "Can't find host element above '{}'.",
        [201 /* Injector_expectedSpecificInjector_expected_actual */]: "Provider is expecting '{}' but got '{}'.",
        [202 /* Injector_notElement_arg */]: "Expected 'Element' was '{}'.",
        [203 /* Injector_wrongMethodThis_expected_actual */]: "Expected injection 'this' to be of type '{}', but was of type '{}'.",
        [204 /* Injector_missingSerializedState_entityKey_element */]: "Entity key '{}' is found on '{}' but does not contain state. Was 'serializeState()' not run during dehydration?",
        [206 /* Injector_notFound_element */]: "No injector can be found starting at '{}'.",
        [207 /* Injector_eventInjectorNotSerializable */]: 'EventInjector does not support serialization.',
        //////////////
        [300 /* Entity_notValidKey_key */]: "Data key '{}' is not a valid key.\n" +
            '  - Data key can only contain characters (preferably lowercase) or number\n' +
            '  - Data key is prefixed with entity name\n' +
            "  - Data key is made up from parts that are separated with ':'.",
        [301 /* Entity_keyAlreadyExists_key */]: "A entity with key '{}' already exists.",
        [303 /* Entity_invalidAttribute_name */]: "'{}' is not a valid attribute. " +
            "Attributes can only contain 'a-z' (lowercase), '0-9', '-' and '_'.",
        [304 /* Entity_missingExpandoOrState_attrName */]: "Found '{}' but expando did not have entity and attribute did not have state.",
        [305 /* Entity_elementMissingEntityAttr_element_attr */]: "Element '{}' is missing entity attribute definition '{}'.",
        [306 /* Entity_noState_entity_props */]: "Unable to create state for entity '{}' with props '{}' because no state found and '$newState()' method was not defined on entity.",
        [307 /* Entity_expected_obj */]: "'{}' is not an instance of 'Entity'.",
        [308 /* Entity_overridesConstructor_entity */]: "'{}' overrides 'constructor' property preventing 'EntityType' retrieval.",
        [311 /* Entity_no$keyProps_entity */]: "Entity '{}' does not define '$keyProps'.",
        [310 /* Entity_no$type_entity */]: "Entity '{}' must have static '$type' property defining the name of the entity.",
        [312 /* Entity_no$qrl_entity */]: "Entity '{}' must have static '$qrl' property defining the import location of the entity.",
        [313 /* Entity_nameCollision_name_currentQrl_expectedQrl */]: "Name collision. Already have entity named '{}' with QRL '{}' but expected QRL '{}'.",
        [309 /* Entity_keyMissingParts_key_key */]: "Entity key '{}' is missing values. Expecting '{}:someValue'.",
        [314 /* Entity_keyTooManyParts_entity_parts_key */]: "Entity '{}' defines '$keyProps' as  '{}'. Actual key '{}' has more parts than entity defines.",
        [315 /* Entity_keyNameMismatch_key_name_entity_name */]: "Key '{}' belongs to entity named '{}', but expected entity '{}' with name '{}'.",
        [316 /* Entity_stateMissingKey_state */]: "Entity state is missing '$key'. Are you sure you passed in state? Got '{}'.",
        //////////////
        [400 /* Component_bindNeedsKey */]: "'bind:' must have an key. (Example: 'bind:key=\"propertyName\"').",
        [401 /* Component_bindNeedsValue */]: "'bind:id' must have a property name. (Example: 'bind:key=\"propertyName\"').",
        [402 /* Component_needsState */]: "Can't find state on host element.",
        [403 /* Component_needsInjectionContext_constructor */]: "Components must be instantiated inside an injection context. Use '{}.new(...)' for creation.",
        [404 /* Component_noProperty_propName_props_host */]: "Property '{}' not found in '{}' on component '{}'.",
        [405 /* Component_notFound_component */]: "Unable to find '{}' component.",
        [406 /* Component_doesNotMatch_component_actual */]: "Requesting component type '{}' does not match existing component instance '{}'.",
        [408 /* Component_noState_component_props */]: "Unable to create state for component '{}' with props '{}' because no state found and '$newState()' method was not defined on component.",
        //////////////
        [500 /* Provider_unrecognizedFormat_value */]: "Unrecognized expression format '{}'.",
        //////////////
        [600 /* Render_unexpectedJSXNodeType_type */]: 'Unexpected JSXNode<{}> type.',
        [601 /* Render_unsupportedFormat_obj_attr */]: "Value '{}' can't be written into '{}' attribute.",
        [602 /* Render_expectingEntity_entity */]: "Expecting entity object, got '{}'.",
        [603 /* Render_expectingEntityArray_obj */]: "Expecting array of entities, got '{}'.",
        [604 /* Render_expectingEntityOrComponent_obj */]: "Expecting Entity or Component got '{}'.",
        [699 /* Render_stateMachineStuck */]: 'Render state machine did not advance.',
        //////////////
        [700 /* Event_emitEventRequiresName_url */]: "Missing '$type' attribute in the '{}' url.",
        [701 /* Event_emitEventCouldNotFindListener_event_element */]: "Re-emitting event '{}' but no listener found at '{}' or any of its parents.",
    }[code];
    let textCode = '000' + code;
    textCode = textCode.substr(textCode.length - 3);
    return `${area}(Q-${textCode}): ${text}`;
}

/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
/**
 * Lazy load a `QRL` symbol and returns the resulting value.
 *
 * @param element - Location of the URL to resolve against.
 * @param url - A relative URL (as `string` or `QRL`) or fully qualified `URL`
 * @returns A cached value synchronously or promise of imported value.
 * @public
 */
function qImport(element, url) {
    if (isParsedQRL(url)) {
        assertDefined(url._serialized);
        url = Array.isArray(url._serialized) ? url._serialized[0] : url._serialized;
    }
    if (qTest) {
        // This code is here for testing purposes only, and should never end up in production.
        const testSymbol = fromQRL(url);
        if (testSymbol) {
            return Promise.resolve(testSymbol);
        }
    }
    const doc = element.ownerDocument;
    const corePlatform = getPlatform(doc);
    const normalizedUrl = toUrl(doc, element, url);
    const importPath = corePlatform.toPath(normalizedUrl);
    const exportName = qExport(normalizedUrl);
    const cacheKey = importPath + '#' + exportName;
    const cacheValue = (doc[ImportCacheKey] || (doc[ImportCacheKey] = new Map())).get(cacheKey);
    if (cacheValue)
        return cacheValue;
    const promise = corePlatform.import(importPath).then((module) => {
        const handler = module[exportName];
        if (!handler)
            if (qDev) {
                throw qError(6 /* Core_missingExport_name_url_props */, exportName, importPath, Object.keys(module));
            }
            else {
                throw qError(6 /* Core_missingExport_name_url_props */);
            }
        qImportSet(doc, cacheKey, handler);
        return handler;
    });
    qImportSet(doc, cacheKey, promise);
    return promise;
}
function qImportSet(doc, cacheKey, value) {
    doc[ImportCacheKey].set(cacheKey, value);
}
/**
 * Convert relative base URI and relative URL into a fully qualified URL.
 *
 * @param base -`QRL`s are relative, and therefore they need a base for resolution.
 *    - `Element` use `base.ownerDocument.baseURI`
 *    - `Document` use `base.baseURI`
 *    - `string` use `base` as is
 *    - `QConfig` use `base.baseURI`
 * @param url - relative URL
 * @returns fully qualified URL.
 */
function toUrl(doc, element, url) {
    let _url;
    let _base = undefined;
    if (url === undefined) {
        //  recursive call
        if (element) {
            _url = element.getAttribute('q:base');
            _base = toUrl(doc, element.parentNode && element.parentNode.closest('[q\\:base]'));
        }
        else {
            _url = doc.baseURI;
        }
    }
    else if (url) {
        (_url = url), (_base = toUrl(doc, element.closest('[q\\:base]')));
    }
    else {
        throw new Error('INTERNAL ERROR');
    }
    return new URL(String(_url), _base);
}
/**
 * Extract the QRL export name from a URL.
 *
 * This name is encoded in the hash of the URL, before any `?`.
 */
function qExport(url) {
    // 1 - optional `#` at the start.
    // 2 - capture group `$1` containing the export name, stopping at the first `?`.
    // 3 - the rest from the first `?` to the end.
    // The hash string is replaced by the captured group that contains only the export name.
    //                       1112222222333
    return url.hash.replace(/^#?([^?]*).*$/, '$1') || 'default';
}
const ImportCacheKey = /*@__PURE__*/ Symbol();

/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
const camelToKebabCase = new Map();
function fromCamelToKebabCase(text, includeFirst = false) {
    if (typeof text != 'string')
        return text;
    const value = camelToKebabCase.get(text);
    if (value != null)
        return value;
    let converted = '';
    for (let x = 0; x < text.length; x++) {
        const ch = text.charAt(x);
        if (isUpperCase(ch)) {
            converted += (x != 0 || includeFirst ? '-' : '') + ch.toLowerCase();
        }
        else {
            converted += ch;
        }
    }
    camelToKebabCase.set(text, converted);
    return converted;
}
function isUpperCase(ch) {
    return 'A' <= ch && ch <= 'Z';
}

function QStore_hydrate(doc) {
    const script = doc.querySelector('script[type="qwik/json"]');
    let map = null;
    if (script) {
        script.parentElement.removeChild(script);
        map = JSON.parse(script.textContent || '{}');
        reviveQObjects(map);
        reviveNestedQObjects(map, map);
    }
    return map;
}
function QStore_dehydrate(doc) {
    const map = {};
    doc.querySelectorAll('[q\\:obj]').forEach((node) => {
        const props = qProps(node);
        const qMap = props.__qRefs__;
        clearQProps(node);
        assertDefined(qMap);
        qMap.forEach((v, k) => {
            map[k] = v.obj;
            collectQObjects(v, new Set(), (k, v) => (map[k] = v));
        });
    });
    const script = doc.createElement('script');
    script.setAttribute('type', 'qwik/json');
    script.textContent = JSON.stringify(map, function (key, value) {
        if (this === map)
            return value;
        if (key.startsWith('__'))
            return undefined;
        const id = getQObjectId(value);
        if (id)
            return JSON_OBJ_PREFIX + id;
        return value;
    }, qDev ? '  ' : undefined);
    doc.body.appendChild(script);
    clearQPropsMap(doc);
}
function reviveQObjects(map) {
    for (const key in map) {
        if (Object.prototype.hasOwnProperty.call(map, key)) {
            const value = map[key];
            map[key] = _restoreQObject(value, key);
        }
    }
}
function reviveNestedQObjects(obj, map) {
    if (obj && typeof obj == 'object') {
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                const value = obj[i];
                if (typeof value == 'string' && value.startsWith(JSON_OBJ_PREFIX)) {
                    obj[i] = map[value.substring(JSON_OBJ_PREFIX.length)];
                }
                else {
                    reviveNestedQObjects(value, map);
                }
            }
        }
        else {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const value = obj[key];
                    if (typeof value == 'string' && value.startsWith(JSON_OBJ_PREFIX)) {
                        obj[key] = map[value.substring(JSON_OBJ_PREFIX.length)];
                    }
                    else {
                        reviveNestedQObjects(value, map);
                    }
                }
            }
        }
    }
}
function collectQObjects(obj, seen, foundFn) {
    if (obj && typeof obj == 'object') {
        if (seen.has(obj))
            return;
        seen.add(obj);
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                collectQObjects(obj[i], seen, foundFn);
            }
        }
        else {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const value = obj[key];
                    const id = getQObjectId(value);
                    if (id)
                        foundFn(id, value);
                    collectQObjects(value, seen, foundFn);
                }
            }
        }
    }
}

const Q_OBJECT_ATTR = 'q:obj';
function updateSubscriptions(element, map, idSubscriptionSet) {
    map.forEach((value, key) => {
        const qObj = value.obj;
        if (idSubscriptionSet.has(value.obj)) {
            // do nothing; already subscribed
            if (!value.isSub) {
                setMapFacade(map, getQObjectId(qObj), qObj, element, true, 1);
            }
        }
        else if (value.isSub) {
            // Unsubscribe
            value.isSub = false;
            releaseRef(value, map, key);
        }
        idSubscriptionSet.delete(qObj);
    });
    idSubscriptionSet.forEach((qObj) => setMapFacade(map, getQObjectId(qObj), qObj, element, true, 1));
    writeQObjAttr(element, map);
}
function writeQObjAttr(element, map) {
    const list = [];
    map.forEach((v, k) => {
        if (v.isSub)
            k = '!' + k;
        v.count == 1 ? list.push(k) : list.push('#' + v.count, k);
    });
    if (list.length) {
        element.setAttribute(Q_OBJECT_ATTR, list.join(' '));
    }
    else {
        element.removeAttribute(Q_OBJECT_ATTR);
    }
}
function createMapFacade(element, map) {
    return {
        forEach(fn) {
            return map.forEach((v, k) => {
                fn(v.obj, k);
            });
        },
        get(key) {
            const value = map.get(key);
            return value === null || value === void 0 ? void 0 : value.obj;
        },
        set(key, qObj) {
            setMapFacade(map, key, qObj, element, false, 1);
            writeQObjAttr(element, map);
        },
    };
}
function setMapFacade(map, key, qObj, element, subscribed, count) {
    assertDefined(key);
    let value = map.get(key);
    if (qObj) {
        QObject_addDoc(qObj, element.ownerDocument);
        if (value) {
            value.count += count;
            value.isSub = value.isSub || subscribed;
        }
        else {
            map.set(key, (value = { obj: qObj, count, isSub: subscribed }));
        }
    }
    else {
        if (value) {
            value = releaseRef(value, map, key);
        }
    }
    return value;
}
function releaseRef(value, map, key) {
    value.count--;
    if (value.count == 0) {
        map.delete(key);
        return undefined;
    }
    return value;
}
function loadObjectsFromState(element, storeMap) {
    const qProps = newQProps(element);
    const objs = element.getAttribute(Q_OBJECT_ATTR);
    if (objs) {
        const parts = objs.split(' ');
        const qMap = qProps.__qRefs__;
        let lastCount = 1;
        parts.forEach((key) => {
            if (key.startsWith('#')) {
                lastCount = Number(key.substr(1));
            }
            else {
                let isSubscribed = false;
                if (key.startsWith('!')) {
                    key = key.substr(1);
                    isSubscribed = true;
                }
                const qObj = storeMap[key];
                setMapFacade(qMap, key, qObj, element, isSubscribed, lastCount);
            }
        });
    }
}

// TODO(misko): For better debugger experience the qProps should never store Proxy, always naked objects to make it easier to traverse in the debugger.
const Q_IS_HYDRATED = '__isHydrated__';
const Q_PROP = 'qProps';
function hydrateIfNeeded(element) {
    const doc = element.ownerDocument;
    const isHydrated = doc[Q_IS_HYDRATED];
    if (!isHydrated) {
        doc[Q_IS_HYDRATED] = true;
        const map = QStore_hydrate(element.ownerDocument);
        if (map) {
            doc.querySelectorAll(Q_OBJECT_ATTR_SELECTOR).forEach((element) => {
                loadObjectsFromState(element, map);
            });
        }
    }
}
function clearQPropsMap(doc) {
    doc[Q_IS_HYDRATED] = undefined;
}
function clearQProps(element) {
    element[Q_PROP] = undefined;
}
const Q_OBJECT_ATTR_SELECTOR = '[q\\:obj]';
const STATE_PREFIX = 'state:';
const ON_PREFIX = 'on:';
function newQProps(element) {
    const qObjRefMap = new Map();
    const qObjMap = createMapFacade(element, qObjRefMap);
    const cache = {
        __element__: element,
        __qRefs__: qObjRefMap,
        __qMap__: qObjMap,
        __mutation__: false,
    };
    return (element[Q_PROP] = new Proxy(cache, {
        get: (target, prop) => {
            if (typeof prop == 'string') {
                if (prop === '__mutation__') {
                    const mutation = target.__mutation__;
                    target.__mutation__ = false;
                    return mutation;
                }
                else if (prop == '__parent__') {
                    const parent = element.parentElement;
                    return parent && qProps(parent);
                }
                else if (prop.startsWith(ON_PREFIX)) {
                    return createInvokeFn(cache, qObjMap, prop);
                }
                if (prop in cache) {
                    return target[prop];
                }
                if (prop.startsWith(STATE_PREFIX)) {
                    return (cache[prop] = findState(qObjMap, prop.substr(STATE_PREFIX.length)));
                }
                else {
                    return (cache[prop] = readAttribute(element, qObjMap, prop));
                }
            }
        },
        set: (target, prop, value) => {
            if (typeof prop == 'string') {
                if (prop === 'children')
                    return true;
                if (prop.startsWith(STATE_PREFIX)) {
                    const id = getQObjectId(value);
                    assertDefined(id);
                    assertEqual(id.startsWith(prop.substr(STATE_PREFIX.length)), true);
                    qObjMap.set(id, (target[prop] = value));
                }
                else if (prop.startsWith(ON_PREFIX)) {
                    addQrlListener(cache, qObjMap, prop, value);
                }
                else if (prop === ':subscriptions') {
                    updateSubscriptions(element, qObjRefMap, value);
                }
                else {
                    value = wrap(value);
                    const existingValue = prop in target ? target[prop] : (target[prop] = readAttribute(element, qObjMap, prop));
                    /**
                    const qObjs = diff(existingValue, value);
                    if (qObjs) {
                      qObjs.forEach((id) => qObjMap.set(id, null!));
                      writeAttribute(element, qObjMap, prop, (target[prop] = value));
                      target.__mutation__ = true;
                    }
                    */
                    if (value !== existingValue) {
                        const existingId = getQObjectId(existingValue);
                        existingId && qObjMap.set(existingId, null);
                        writeAttribute(element, qObjMap, prop, (target[prop] = value));
                        target.__mutation__ = true;
                    }
                }
                return true;
            }
            else {
                // TODO(misko): Better error/test
                throw new Error('Only string keys are supported');
            }
        },
    }));
}
function readAttribute(element, map, propName) {
    if (propName.startsWith(ON_PREFIX)) {
        const attrName = fromCamelToKebabCase(propName.substr(3));
        const attrValue = element.getAttribute(attrName);
        const listeners = [];
        attrValue === null || attrValue === void 0 ? void 0 : attrValue.split('\n').forEach((qrl) => {
            listeners.push(parseQRL(qrl, map));
        });
        return listeners;
    }
    else {
        const attrName = fromCamelToKebabCase(propName);
        const attrValue = element.getAttribute(attrName);
        if (attrValue === null) {
            return undefined;
        }
        else {
            return qJsonParse(attrValue, map);
        }
    }
}
function writeAttribute(element, map, propName, value) {
    const attrName = fromCamelToKebabCase(propName);
    if (propName == 'class') {
        element.setAttribute('class', stringifyClassOrStyle(value, true));
    }
    else if (propName == 'style') {
        element.setAttribute('style', stringifyClassOrStyle(value, false));
    }
    else if (propName === 'innerHTML' || propName === 'innerText') {
        element.setAttribute(attrName, '');
        element[propName] = value;
    }
    else {
        const newValue = qJsonStringify(value, map);
        if (value === undefined) {
            element.removeAttribute(attrName);
        }
        else {
            element.setAttribute(attrName, newValue);
        }
    }
    if ((propName == 'value' || propName == 'checked') && element.tagName === 'INPUT') {
        // INPUT properties `value` and `checked` are special because they can go out of sync
        // between the attribute and what the user entered, so they have special treatment.
        element[propName] = value;
    }
}
function findState(map, stateName) {
    let state = null;
    stateName += Q_OBJECT_PREFIX_SEP;
    map.forEach((v, k) => {
        if (k.startsWith(stateName)) {
            state = v;
        }
    });
    return state;
}
function addQrlListener(cache, map, prop, value) {
    if (!value)
        return;
    if (typeof value == 'string' || value instanceof String) {
        value = parseQRL(value, undefined /** Don't expect objects in strings */);
    }
    if (value instanceof ParsedQRL) {
        const existingQRLs = getExistingQRLs(cache, map, prop);
        let found = false;
        for (let index = 0; index < existingQRLs.length; index++) {
            const existingQRL = existingQRLs[index];
            if (isSameHandler(existingQRL, value)) {
                found = true;
                replaceQRL(existingQRLs, map, index, value);
                break;
            }
        }
        if (!found) {
            replaceQRL(existingQRLs, map, existingQRLs.length, value);
        }
        const kababProp = ON_PREFIX + fromCamelToKebabCase(prop.substr(ON_PREFIX.length));
        cache.__element__.setAttribute(kababProp, serializeQRLs(existingQRLs));
    }
    else {
        // TODO(misko): Test/better text
        throw new Error(`Not QRL: prop: ${prop}; value: ` + value);
    }
}
function getExistingQRLs(cache, map, prop) {
    if (prop in cache)
        return cache[prop];
    const kababProp = ON_PREFIX + fromCamelToKebabCase(prop.substr(ON_PREFIX.length));
    const parts = [];
    (cache.__element__.getAttribute(kababProp) || '').split('\n').forEach((qrl) => {
        if (qrl) {
            parts.push(parseQRL(qrl, map));
        }
    });
    return (cache[prop] = parts);
}
function isSameHandler(existing, actual) {
    return (existing.url == actual.url &&
        existing.symbol == actual.symbol &&
        existing.getState() == actual.getState());
}
function serializeQRLs(existingQRLs) {
    return existingQRLs
        .map((qrl) => {
        assertDefined(qrl._serialized);
        return qrl._serialized;
    })
        .join('\n');
}
function replaceQRL(existingQRLs, map, index, newQrl) {
    const existing = index < existingQRLs.length ? existingQRLs[index] : null;
    if (existing && Array.isArray(existing._serialized)) {
        existing._serialized.forEach((key, index) => {
            if (index) {
                // need to skip the first one.
                map.set(key, null);
            }
        });
    }
    stringifyQRL(newQrl, map);
    existingQRLs[index] = newQrl;
}
function createInvokeFn(cache, map, prop) {
    const existingQRLs = getExistingQRLs(cache, map, prop);
    if (existingQRLs.length === 0)
        return null;
    return (event) => {
        return Promise.all(existingQRLs.map(async (qrl) => {
            const fn = await qImport(cache.__element__, qrl);
            const element = cache.__element__;
            const qrlString = Array.isArray(qrl._serialized) ? qrl._serialized[0] : qrl._serialized;
            const url = new URL(qrlString, element.ownerDocument.baseURI);
            return { state: qrl.getState(), value: await fn(element, event, url) };
        }));
    };
}
function didQPropsChange(qProps) {
    return qProps.__mutation__;
}
/**
 * Turn an `Array` or object literal into a `class` or `style`
 *
 * @param obj `string`, `Array` or object literal
 * @param isClass `true` if expecting `class` output
 * @returns `string`
 */
function stringifyClassOrStyle(obj, isClass) {
    if (obj == null)
        return '';
    if (typeof obj == 'object') {
        let text = '';
        let sep = '';
        if (Array.isArray(obj)) {
            if (!isClass) {
                throw qError(601 /* Render_unsupportedFormat_obj_attr */, obj, 'style');
            }
            for (let i = 0; i < obj.length; i++) {
                text += sep + obj[i];
                sep = ' ';
            }
        }
        else {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const value = obj[key];
                    text += isClass ? (value ? sep + key : '') : sep + key + ':' + value;
                    sep = isClass ? ' ' : ';';
                }
            }
        }
        return text;
    }
    return String(obj);
}

/**
 * @public
 */
function qProps(element) {
    hydrateIfNeeded(element);
    let qProps = element[Q_PROP];
    if (!qProps) {
        qProps = newQProps(element);
    }
    return qProps;
}

/**
 * Remove item from array (Same as `Array.splice()` but faster.)
 *
 * `Array.splice()` is not as fast because it has to allocate an array for the elements which were
 * removed. This causes memory pressure and slows down code when most of the time we don't
 * care about the deleted items array.
 *
 * https://jsperf.com/fast-array-splice (About 20x faster)
 *
 * @param array Array to splice
 * @param index Index of element in array to remove.
 * @param count Number of items to remove.
 */
/**
 * Same as `Array.splice2(index, 0, value1, value2)` but faster.
 *
 * `Array.splice()` is not fast because it has to allocate an array for the elements which were
 * removed. This causes memory pressure and slows down code when most of the time we don't
 * care about the deleted items array.
 *
 * @param array Array to splice.
 * @param index Index in array where the `value` should be added.
 * @param value1 Value to add to array.
 * @param value2 Value to add to array.
 */
function arrayInsert2(array, index, value1, value2) {
    let end = array.length;
    if (end == index) {
        // inserting at the end.
        array.push(value1, value2);
    }
    else if (end === 1) {
        // corner case when we have less items in array than we have items to insert.
        array.push(value2, array[0]);
        array[0] = value1;
    }
    else {
        end--;
        array.push(array[end - 1], array[end]);
        while (end > index) {
            const previousEnd = end - 2;
            array[end] = array[previousEnd];
            end--;
        }
        array[index] = value1;
        array[index + 1] = value2;
    }
}
function keyValueArrayGet(keyValueArray, key, notFoundFactory) {
    const index = keyValueArrayIndexOf(keyValueArray, key);
    if (index >= 0) {
        // if we found it retrieve it.
        return keyValueArray[index | 1];
    }
    if (notFoundFactory) {
        const value = notFoundFactory();
        arrayInsert2(keyValueArray, ~index, key, value);
        return value;
    }
    return undefined;
}
/**
 * Retrieve a `key` index value in the array or `-1` if not found.
 *
 * @param keyValueArray to search.
 * @param key The key to locate.
 * @returns index of where the key is (or should have been.)
 *   - positive (even) index if key found.
 *   - negative index if key not found. (`~index` (even) to get the index where it should have
 *     been inserted.)
 */
function keyValueArrayIndexOf(keyValueArray, key) {
    return _arrayIndexOfSorted(keyValueArray, key, 1);
}
/**
 * INTERNAL: Get an index of an `value` in a sorted `array` by grouping search by `shift`.
 *
 * NOTE:
 * - This uses binary search algorithm for fast removals.
 *
 * @param array A sorted array to binary search.
 * @param value The value to look for.
 * @param shift grouping shift.
 *   - `0` means look at every location
 *   - `1` means only look at every other (even) location (the odd locations are to be ignored as
 *         they are values.)
 * @returns index of the value.
 *   - positive index if value found.
 *   - negative index if value not found. (`~index` to get the value where it should have been
 * inserted)
 */
function _arrayIndexOfSorted(array, value, shift) {
    let start = 0;
    let end = array.length >> shift;
    while (end !== start) {
        const middle = start + ((end - start) >> 1); // find the middle.
        const current = array[middle << shift];
        if (value === current) {
            return middle << shift;
        }
        else if (current > value) {
            end = middle;
        }
        else {
            start = middle + 1; // We already searched middle so make it non-inclusive by adding 1
        }
    }
    return ~(end << shift);
}

function isSlotMap(value) {
    return Array.isArray(value);
}
/**
 * Retrieves the current `SlotMap` from `QComponent`
 *
 *
 * This method collects the content `Node`s for a given component.
 *
 * @param component
 * @returns
 */
function getSlotMap(component) {
    const slots = [];
    const host = component.hostElement;
    const firstChild = host.firstElementChild;
    if (isQSlotTemplate(firstChild)) {
        slotMapAddChildren(slots, firstChild.content, null);
    }
    const previousSlots = [];
    host.querySelectorAll("Q\\:SLOT" /* QSlotSelector */).forEach((qSlot) => {
        for (const parent of previousSlots) {
            if (parent.contains(qSlot)) {
                // When we do `querySelectorAll` it is possible that we get `<q:slot>`
                // which are children of existing `<q:slot>`. This check is here
                // to make sure that we don't get `<q:lsot>` recursively.
                // <component>
                //   <q:slot include-me>
                //     <q:slot dont-include-me></q:slot>
                //   </q:slot>
                // </component>
                return;
            }
        }
        previousSlots.push(qSlot);
        const name = qSlot.getAttribute('name') || '';
        slotMapAddChildren(slots, qSlot, name);
    });
    return slots;
}
/**
 * Determines if the `node` is `<template q:slot>` used for storing un-projected items.
 */
function isQSlotTemplate(node) {
    return isDomElementWithTagName(node, 'template') && node.hasAttribute("q:slot" /* QSlotAttr */);
}
/**
 * Add projected nodes into `SlotMap`.
 *
 * See `SlotMap` for the layout.
 *
 * @param slots
 * @param parent Parent whoes children should be added to the `slots`.
 */
function slotMapAddChildren(slots, parent, name) {
    _slotParent = parent;
    let child = parent.firstChild;
    if (name !== null) {
        keyValueArrayGet(slots, name, emptyArrayFactory);
    }
    while (child) {
        const slotName = name !== null
            ? name
            : (isHtmlElement(child) && child.getAttribute("q:slot" /* QSlotAttr */)) || '';
        keyValueArrayGet(slots, slotName, emptyArrayFactory).push(child);
        child = child.nextSibling;
    }
    _slotParent = undefined;
}
let _slotParent;
function emptyArrayFactory() {
    return [-1, _slotParent];
}

/**
 * Create a cursor which reconciles logical children.
 *
 * Here logical means children as defined by JSX. (This will be same as DOM except
 * in the case of projection.) In case of projection the cursor will correctly
 * deal with the logical children of the View (rather then rendered children.)
 *
 * See: `cursorForComponent`
 *
 * @param parent Parent `Element` whose children should be reconciled.
 */
function cursorForParent(parent) {
    let firstChild = parent.firstChild;
    if (firstChild && firstChild.nodeType === 10 /* DOCUMENT_TYPE_NODE */) {
        firstChild = firstChild.nextSibling;
    }
    return newCursor(parent, firstChild, null);
}
function newCursor(parent, node, end) {
    return { parent, node, end };
}
function getNode(cursor) {
    const node = cursor.node;
    return cursor.end == node ? null : node;
}
function setNode(cursor, node) {
    cursor.node = cursor.end == node ? null : node;
}
function cursorClone(cursor) {
    return newCursor(cursor.parent, cursor.node, cursor.end);
}
/**
 * Reconcile view children of a component.
 *
 * Use this method to create a cursor when reconciling a component's view.
 *
 * The main point of this method is to skip the `<template q:slot/>` Node.
 *
 * @param componentHost Component host element for which view children should be
 *     reconciled.
 * @returns
 */
function cursorForComponent(componentHost) {
    assertEqual(isComponentElement(componentHost), true);
    let firstNonTemplate = componentHost.firstChild;
    if (isQSLotTemplateElement(firstNonTemplate)) {
        firstNonTemplate = firstNonTemplate.nextSibling;
    }
    return newCursor(componentHost, firstNonTemplate, null);
}
/**
 * Ensure that node at cursor is an `Element` with given attributes.
 *
 * Reconciles the current cursor location with `expectTag`/`expectProps`.
 * This method will either leave the element alone if it matches, updates the
 * props, or completely removes and replaces the node with correct element.
 *
 * After invocation of this method, the cursor is advanced to the next sibling.
 *
 * @param cursor
 * @param component `ComponentRenderContext` of the component to whom the view childer
 *        logically belong.
 * @param expectTag
 * @param expectProps
 * @param componentRenderQueue Set if the current element is a component.
 *    This means that the reconciliation should detect input changes and if
 *    present add the component to the `componentRenderQueue` for further processing.
 * @returns Child `Cursor` to reconcile the children of this `Element`.
 */
function cursorReconcileElement(cursor, component, expectTag, expectProps, componentRenderQueue) {
    let node = getNode(cursor);
    assertNotEqual(node, undefined, 'Cursor already closed');
    if (isSlotMap(node)) {
        assertDefined(cursor.parent);
        return slotMapReconcileSlots(cursor.parent, node, cursor.end, component, expectTag, expectProps, componentRenderQueue);
    }
    else {
        assertNotEqual(node, undefined, 'Cursor already closed');
        node = _reconcileElement(cursor.parent, node, cursor.end, component, expectTag, expectProps, componentRenderQueue);
        assertDefined(node);
        setNode(cursor, node.nextSibling);
        return _reconcileElementChildCursor(node, !!componentRenderQueue);
    }
}
function slotMapReconcileSlots(parent, slots, end, component, expectTag, expectProps, componentRenderQueue) {
    const slotName = expectProps["q:slot" /* QSlotAttr */] || '';
    const namedSlot = keyValueArrayGet(slots, slotName);
    let childNode;
    if (namedSlot) {
        assertGreaterOrEqual(namedSlot.length, 2);
        const parent = namedSlot[1 /* parent */];
        let index = namedSlot[0 /* index */];
        if (index == -1) {
            index = 2;
        }
        childNode = (namedSlot.length > index ? namedSlot[index] : null);
        const node = _reconcileElement(parent, childNode, end, component, expectTag, expectProps, componentRenderQueue);
        if (childNode !== node) {
            namedSlot[index] = node;
            childNode = node;
        }
        namedSlot[0 /* index */] = index + 1;
    }
    else {
        const template = getUnSlottedStorage(parent);
        childNode = _reconcileElement(template.content, null, end, component, expectTag, expectProps, true);
        assertDefined(childNode);
    }
    return _reconcileElementChildCursor(childNode, !!componentRenderQueue);
}
function _reconcileElement(parent, existing, end, component, expectTag, expectProps, componentRenderQueue) {
    let shouldDescendIntoComponent;
    let reconciledElement;
    if (isDomElementWithTagName(existing, expectTag)) {
        const props = qProps(existing);
        Object.assign(props, expectProps);
        shouldDescendIntoComponent = didQPropsChange(props) && !!componentRenderQueue;
        reconciledElement = existing;
    }
    else {
        // Expected node and actual node did not match. Need to switch.
        reconciledElement = replaceNode(parent, existing, (isDocument(parent) ? parent : parent.ownerDocument).createElement(expectTag), end);
        shouldDescendIntoComponent = !!componentRenderQueue;
        Object.assign(qProps(reconciledElement), expectProps);
    }
    component && component.styleClass && reconciledElement.classList.add(component.styleClass);
    if (shouldDescendIntoComponent) {
        const hostComponent = getQComponent(reconciledElement);
        hostComponent.styleHostClass && reconciledElement.classList.add(hostComponent.styleHostClass);
        if (Array.isArray(componentRenderQueue)) {
            componentRenderQueue.push(hostComponent.render());
        }
        else if (reconciledElement.getAttribute("on:q-render" /* OnRender */)) {
            reconciledElement.setAttribute("on:q-render-notify" /* RenderNotify */, '');
        }
    }
    return reconciledElement;
}
function _reconcileElementChildCursor(node, isComponent) {
    assertDefined(node);
    if (isComponent) {
        // We are a component. We need to return Slots
        return newCursor(node, getSlotMap(getQComponent(node)), null);
    }
    else {
        // Not a component, normal return.
        return cursorForParent(node);
    }
}
/**
 * Ensure that node at cursor is a `Text`.
 *
 * Reconciles the current cursor location with expected text.
 * This method will either leave the text alone if it matches, updates the
 * text, or completely removes and replaces the node with correct text.
 *
 * After invocation of this method, the cursor is advanced to the next sibling.
 *
 * @param cursor
 * @param expectText
 */
function cursorReconcileText(cursor, expectText) {
    let node = getNode(cursor);
    assertNotEqual(node, undefined, 'Cursor already closed');
    assertDefined(cursor.parent);
    if (isSlotMap(node)) {
        let parent;
        let childNode;
        const namedSlot = keyValueArrayGet(node, '');
        if (namedSlot) {
            assertGreaterOrEqual(namedSlot.length, 2);
            parent = namedSlot[1 /* parent */];
            let index = namedSlot[0 /* index */];
            if (index == -1) {
                index = 2;
            }
            childNode = (namedSlot.length > index ? namedSlot[index] : null);
            node = _reconcileText(parent, childNode, cursor.end, expectText);
            if (childNode !== node) {
                namedSlot[index] = node;
            }
            namedSlot[0 /* index */] = index + 1;
        }
        else {
            const template = getUnSlottedStorage(cursor.parent);
            _reconcileText(template.content, null, cursor.end, expectText);
        }
    }
    else {
        node = _reconcileText(cursor.parent, node, cursor.end, expectText);
        setNode(cursor, node.nextSibling);
    }
}
function _reconcileText(parent, node, beforeNode, expectText) {
    // Reconcile as Text Node
    if (node && node.nodeType == 3 /* TEXT_NODE */) {
        if (node.textContent !== expectText) {
            node.textContent = expectText;
        }
    }
    else {
        // Expected node and actual node did not match. Need to switch.
        node = replaceNode(parent, node, parent.ownerDocument.createTextNode(expectText), beforeNode);
    }
    return node;
}
/**
 * Close out the cursor and clear any extra elements.
 *
 * Invocation of this method indicates that no mare Nodes after the cursor are expected.
 * This is a signal to remove any excess `Node`s if present.
 *
 * @param cursor
 */
function cursorReconcileEnd(cursor) {
    let node = getNode(cursor);
    if (isSlotMap(node)) {
        for (let i = 0; i < node.length; i = i + 2) {
            const namedSlot = node[i + 1];
            if (namedSlot[0 /* index */] !== -1) {
                assertGreater(namedSlot[0 /* index */], 1 /* parent */);
                for (let k = namedSlot[0 /* index */]; k < namedSlot.length; k++) {
                    namedSlot[1 /* parent */].removeChild(namedSlot[k]);
                }
            }
        }
    }
    else {
        while (node) {
            const next = node.nextSibling;
            cursor.parent.removeChild(node);
            node = next;
        }
    }
    setNode(cursor, undefined);
}
function getUnSlottedStorage(componentElement) {
    assertEqual(isComponentElement(componentElement), true, 'Must be component element');
    let template = componentElement === null || componentElement === void 0 ? void 0 : componentElement.firstElementChild;
    if (!isDomElementWithTagName(template, 'template') ||
        !template.hasAttribute("q:slot" /* QSlotAttr */)) {
        template = componentElement.insertBefore(componentElement.ownerDocument.createElement('template'), template);
        template.setAttribute("q:slot" /* QSlotAttr */, '');
    }
    return template;
}
const V_NODE_START = '<node:';
const V_NODE_END = '</node:';
function cursorReconcileVirtualNode(cursor) {
    var _a;
    let node = getNode(cursor);
    if (isSlotMap(node)) {
        // TODO(misko): proper error and test;
        throw new Error('Not expecting slot map here');
    }
    else {
        if (isComment(node) && ((_a = node.textContent) === null || _a === void 0 ? void 0 : _a.startsWith(V_NODE_START))) {
            throw new Error('IMPLEMENT');
        }
        else {
            const id = Math.round(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
            const parent = cursor.parent;
            const doc = parent.ownerDocument;
            const startVNode = doc.createComment(V_NODE_START + id + '>');
            const endVNode = doc.createComment(V_NODE_END + id + '>');
            node = replaceNode(cursor.parent, node, endVNode, null);
            cursor.parent.insertBefore(startVNode, endVNode);
            setNode(cursor, endVNode.nextSibling);
            return newCursor(parent, startVNode, endVNode);
        }
    }
}
function cursorReconcileStartVirtualNode(cursor) {
    const node = getNode(cursor);
    assertEqual(isComment(node) && node.textContent.startsWith(V_NODE_START), true);
    setNode(cursor, node && node.nextSibling);
}
function replaceNode(parentNode, existingNode, newNode, insertBefore) {
    parentNode.insertBefore(newNode, existingNode || insertBefore);
    if (existingNode) {
        parentNode.removeChild(existingNode);
    }
    return newNode;
}

/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
/**
 * Converts a tree of Promises into a flat array of resolved promise values.
 *
 * @param tree - array of arrays of values or promises of values.
 * @returns a `Promise` of array of values.
 */
function flattenPromiseTree(tree) {
    return Promise.all(tree).then((values) => {
        const flatArray = flattenArray(values);
        for (let i = 0; i < flatArray.length; i++) {
            if (isPromise(flatArray[i])) {
                return flattenPromiseTree(flatArray);
            }
        }
        return flatArray;
    });
}
function isPromise(value) {
    return value instanceof Promise;
}

/**
 * @license
 * Copyright Builder.io, Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
/**
 * Place at the root of the component View to allow binding of attributes on the Host element.
 *
 * ```
 * <Host someAttr={someExpr} someAttrStatic="value">
 *   View content implementation.
 * </Host>
 * ```
 *
 * Qwik requires that components have [docs/HOST_ELEMENTS.ts] so that it is possible to have
 * asynchronous loading point. Host element is not owned by the component. At times it is
 * desirable for the component to render additional attributes on the host element. `<Host>`
 * servers that purpose.
 * @public
 */
const Host = { __brand__: 'host' };

/**
 * @public
 */
const Slot = {
    __brand__: 'slot',
};

function visitJsxNode(component, renderQueue, cursor, jsxNode) {
    if (isJSXNode(jsxNode)) {
        const nodeType = jsxNode.type;
        if (nodeType == null)
            return;
        if (typeof nodeType === 'string') {
            visitJsxLiteralNode(component, renderQueue, cursor, jsxNode);
        }
        else if (nodeType === Fragment || nodeType == null) {
            const jsxChildren = jsxNode.children || EMPTY_ARRAY;
            for (const jsxChild of jsxChildren) {
                visitJsxNode(component, renderQueue, cursor, jsxChild);
            }
        }
        else if (jsxNode.type === Host) {
            const props = qProps(cursor.parent);
            Object.assign(props, jsxNode.props);
            const jsxChildren = jsxNode.children || EMPTY_ARRAY;
            for (const jsxChild of jsxChildren) {
                visitJsxNode(component, renderQueue, cursor, jsxChild);
            }
            didQPropsChange(props);
        }
        else if (jsxNode.type === Slot) {
            component && visitQSlotJsxNode(component, renderQueue, cursor, jsxNode);
        }
        else if (typeof jsxNode.type === 'function') {
            visitJsxNode(component, renderQueue, cursor, jsxNode.type(jsxNode.props));
        }
        else {
            throw qError(600 /* Render_unexpectedJSXNodeType_type */, nodeType);
        }
    }
    else if (isPromise(jsxNode)) {
        const vNodeCursor = cursorReconcileVirtualNode(cursor);
        const render = (jsxNode) => {
            cursorReconcileStartVirtualNode(vNodeCursor);
            visitJsxNode(component, renderQueue, vNodeCursor, jsxNode);
            cursorReconcileEnd(vNodeCursor);
        };
        jsxNode.then(render, render);
        if (jsxNode.whilePending) {
            const vNodePending = cursorClone(vNodeCursor);
            cursorReconcileStartVirtualNode(vNodePending);
            visitJsxNode(component, renderQueue, vNodePending, jsxNode.whilePending);
            cursorReconcileEnd(vNodePending);
        }
    }
    else if (Array.isArray(jsxNode)) {
        const jsxChildren = jsxNode;
        for (const jsxChild of jsxChildren) {
            visitJsxNode(component, renderQueue, cursor, jsxChild);
        }
    }
    else if (typeof jsxNode === 'string' || typeof jsxNode === 'number') {
        // stringify
        cursorReconcileText(cursor, String(jsxNode));
    }
}
function visitJsxLiteralNode(component, renderQueue, cursor, jsxNode) {
    const jsxTag = jsxNode.type;
    const isQComponent = "on:q-render" /* OnRender */ in jsxNode.props;
    const elementCursor = cursorReconcileElement(cursor, component, jsxTag, jsxNode.props, isQComponent ? renderQueue : null);
    if (!hasInnerHtmlOrTextBinding(jsxNode)) {
        // we don't process children if we have inner-html bound to something.
        const jsxChildren = jsxNode.children || EMPTY_ARRAY;
        for (const jsxChild of jsxChildren) {
            visitJsxNode(component, renderQueue, elementCursor, jsxChild);
        }
        cursorReconcileEnd(elementCursor);
    }
    else if (isQComponent) {
        //TODO(misko): needs tests and QError.
        throw new Error('innerHTML/innerText bindings not supported on component content');
    }
}
function hasInnerHtmlOrTextBinding(jsxNode) {
    return 'innerHTML' in jsxNode.props || 'innerText' in jsxNode.props;
}
function visitQSlotJsxNode(component, renderQueue, cursor, jsxNode) {
    const slotName = jsxNode.props.name || '';
    const slotCursor = cursorReconcileElement(cursor, component, "Q:SLOT" /* QSlot */, Object.assign({ ["name" /* QSlotName */]: slotName }, jsxNode.props), null);
    const slotMap = getSlotMap(component);
    const namedSlot = keyValueArrayGet(slotMap, slotName);
    if (namedSlot && namedSlot.length > 2 /* firstNode */) {
        // project existing nodes.
        const cursorParent = slotCursor.parent;
        if (namedSlot[1 /* parent */] !== cursorParent) {
            // The only time we need to do anything if the existing elements are not already
            // in the right spot. Move them.
            cursorReconcileEnd(slotCursor); // clear anything which is already in.
            for (let i = 2 /* firstNode */; i < namedSlot.length; i++) {
                const node = namedSlot[i];
                cursorParent.appendChild(node);
            }
            cursorReconcileEnd(slotCursor);
        }
        cursorParent.querySelectorAll("[on\\:q-render-notify]" /* RenderNotifySelector */).forEach((compElem) => {
            renderQueue.push(getQComponent(compElem).render());
        });
    }
    else {
        // fallback to default value projection.
        const jsxChildren = jsxNode.children;
        for (const jsxChild of jsxChildren) {
            visitJsxNode(component, renderQueue, slotCursor, jsxChild);
        }
        cursorReconcileEnd(slotCursor);
    }
}

// TODO(misko): Can we get rid of this whole file, and instead teach qProps to know how to render
// the advantage will be that the render capability would then be exposed to the outside world as well.
class QComponentCtx {
    constructor(hostElement) {
        this.styleId = null;
        this.styleClass = null;
        this.styleHostClass = null;
        this.hostElement = hostElement;
        const scopedStyleId = (this.styleId = styleKey(hostElement.getAttribute("q:sstyle" /* ComponentStyles */)));
        if (scopedStyleId) {
            this.styleHostClass = styleHost(scopedStyleId);
            this.styleClass = styleContent(scopedStyleId);
        }
    }
    dehydrate() {
        throw new Error('Method not implemented.');
    }
    async render() {
        const props = qProps(this.hostElement);
        // TODO(misko): extract constant
        if (props['state:'] == null) {
            try {
                const scopedStyle = props["q:sstyle" /* ComponentStyles */];
                const unscopedStyle = props["q:ustyle" /* ComponentUnscopedStyles */];
                insertStyleIfNeeded(this, scopedStyle);
                insertStyleIfNeeded(this, unscopedStyle);
                const hook = props['on:qMount'];
                if (hook) {
                    const values = await hook('qMount');
                    values.forEach((v) => {
                        props['state:' + v.state] = _stateQObject(v.value, v.state);
                    });
                }
            }
            catch (e) {
                // TODO(misko): Proper error handling
                // eslint-disable-next-line no-console
                console.log(e);
            }
        }
        const onRender = props['on:qRender']; // TODO(misko): extract constant
        assertDefined(onRender);
        this.hostElement.removeAttribute("on:q-render-notify" /* RenderNotify */);
        const renderQueue = [];
        try {
            const returnValue = await onRender('qRender');
            if (returnValue.length) {
                const jsxNode = returnValue[0].value;
                const cursor = cursorForComponent(this.hostElement);
                visitJsxNode(this, renderQueue, cursor, jsxNode);
                cursorReconcileEnd(cursor);
            }
        }
        catch (e) {
            // TODO(misko): Proper error handling
            // eslint-disable-next-line no-console
            console.log(e);
        }
        return [this.hostElement, ...(await flattenPromiseTree(renderQueue))];
    }
}
const COMPONENT_PROP = '__qComponent__';
function getQComponent(hostElement) {
    const element = hostElement;
    let component = element[COMPONENT_PROP];
    if (!component)
        component = element[COMPONENT_PROP] = new QComponentCtx(hostElement);
    return component;
}
//TODO(misko): needs lots of tests
// - Skip over projection
// TODO(misko): move to central DOM traversal location.
function getHostElement(element) {
    // TODO(misko): this needs to take projection into account.
    while (element && !element.getAttribute("on:q-render" /* OnRender */)) {
        element = element.parentElement;
    }
    return element;
}
function insertStyleIfNeeded(ctx, style) {
    if (style) {
        const styleId = styleKey(style);
        const host = ctx.hostElement;
        const document = host.ownerDocument;
        const head = document.querySelector('head');
        if (!head.querySelector(`style[q\\:style="${styleId}"]`)) {
            const styleImport = Promise.resolve(qImport(host, style));
            styleImport.then((styles) => {
                const style = document.createElement('style');
                style.setAttribute('q:style', styleId);
                style.textContent = styles.replace(/�/g, styleId);
                head.appendChild(style);
            });
        }
    }
}

/**
 * Mark component for rendering.
 *
 * Use `notifyRender` method to mark a component for rendering at some later point in time.
 * This method uses `getPlatform(doc).queueRender` for scheduling of the rendering. The
 * default implementation of the method is to use `requestAnimationFrame` to do actual rendering.
 *
 * The method is intended to coalesce multiple calls into `notifyRender` into a single call for
 * rendering.
 *
 * @param hostElement - Host-element of the component to re-render.
 * @returns A promise which is resolved when the component has been rendered.
 * @public
 */
// TODO(misko): tests
// TODO(misko): this should take QComponent as well.
function qNotifyRender(hostElement) {
    assertDefined(hostElement.getAttribute("on:q-render" /* OnRender */));
    hostElement.setAttribute("on:q-render-notify" /* RenderNotify */, '');
    return scheduleRender(hostElement.ownerDocument);
}
/**
 * Schedule rendering for the future.
 *
 * Multiple calls to this function result in a single `rAF` scheduling creating coalescence.
 *
 * Rendering is achieved by `querySelectorAll` looking for all `on:q-render` attributes.
 *
 * @returns a `Promise` of all of the `HostElements` which were re-rendered.
 * @internal
 */
function scheduleRender(doc) {
    return getPlatform(doc).queueRender(renderMarked);
}
async function renderMarked(doc) {
    const hosts = Array.from(doc.querySelectorAll("[on\\:q-render-notify]" /* RenderNotifySelector */));
    return Promise.all(hosts.map((hostElement) => {
        hostElement.removeAttribute("on:q-render-notify" /* RenderNotify */);
        const cmp = getQComponent(hostElement);
        return cmp && cmp.render();
    }));
}

function isQEvent(value) {
    return typeof value == 'function' && typeof value.type == 'string';
}
/**
 * @public
 */
function useEvent(expectEventType) {
    assertDefined(_event, 'Invoking of `useEvent()` outside of `use*()` context.');
    // TODO(misko): implement checking of expectEventType;
    expectEventType &&
        assertEqual(_event.type, isQEvent(expectEventType) ? expectEventType.type : expectEventType);
    return _event;
}
function safeQSubscribe(qObject) {
    assertNotEqual(unwrapProxy(qObject), qObject, 'Expecting Proxy');
    _subscriptions && qObject && _subscriptions.add(qObject);
}
let _hostElement;
let _event;
let _url;
let _subscriptions;
function useInvoke(fn, element, event, url) {
    const isRender = event === 'qRender';
    try {
        _hostElement = element;
        _event = event;
        _url = url;
        isRender && (_subscriptions = new Set());
        return fn();
    }
    finally {
        _hostElement = undefined;
        _event = undefined;
        _url = undefined;
        if (_subscriptions) {
            element && (qProps(element)[':subscriptions'] = _subscriptions);
            _subscriptions = undefined;
        }
    }
}

const Q_OBJECT_PREFIX_SEP = ':';
function _stateQObject(obj, prefix) {
    const id = getQObjectId(obj);
    if (id) {
        obj[QObjectIdSymbol] = prefix + Q_OBJECT_PREFIX_SEP + id;
        return obj;
    }
    else {
        return readWriteProxy(obj, prefix + Q_OBJECT_PREFIX_SEP + generateId());
    }
}
function _restoreQObject(obj, id) {
    return readWriteProxy(obj, id);
}
function QObject_notifyWrite(id, doc) {
    if (doc) {
        doc.querySelectorAll(idToComponentSelector(id)).forEach(qNotifyRender);
    }
}
function QObject_notifyRead(target) {
    const proxy = proxyMap.get(target);
    assertDefined(proxy);
    safeQSubscribe(proxy);
}
function QObject_addDoc(qObj, doc) {
    assertNotEqual(unwrapProxy(qObj), qObj, 'Expected Proxy');
    qObj[QObjectDocumentSymbol] = doc;
}
function getQObjectId(obj) {
    return (obj && typeof obj === 'object' && obj[QObjectIdSymbol]) || null;
}
function idToComponentSelector(id) {
    id = id.replace(/([^\w\d])/g, (_, v) => '\\' + v);
    return '[q\\:obj*=' + (isStateObj(id) ? '' : '\\!') + id + ']';
}
function isStateObj(id) {
    if (id && typeof id !== 'string') {
        id = getQObjectId(id);
        assertDefined(id);
    }
    return id.indexOf(Q_OBJECT_PREFIX_SEP) !== -1;
}
/**
 * Creates a proxy which notifies of any writes.
 */
function readWriteProxy(target, id) {
    if (!target || typeof target !== 'object')
        return target;
    let proxy = proxyMap.get(target);
    if (proxy)
        return proxy;
    proxy = new Proxy(target, new ReadWriteProxyHandler(id));
    proxyMap.set(target, proxy);
    return proxy;
}
const QOjectTargetSymbol = ':target:';
const QOjectTransientsSymbol = ':transients:';
const QObjectIdSymbol = ':id:';
const QObjectDocumentSymbol = ':doc:';
function unwrapProxy(proxy) {
    if (proxy && typeof proxy == 'object') {
        const value = proxy[QOjectTargetSymbol];
        if (value)
            return value;
    }
    return proxy;
}
function wrap(value) {
    if (value && typeof value === 'object') {
        const nakedValue = unwrapProxy(value);
        if (nakedValue !== value) {
            // already a proxy return;
            return value;
        }
        const proxy = proxyMap.get(value);
        return proxy ? proxy : readWriteProxy(value, generateId());
    }
    else {
        return value;
    }
}
class ReadWriteProxyHandler {
    constructor(id) {
        this.doc = null;
        this.transients = null;
        this.id = id;
    }
    get(target, prop) {
        if (prop === QOjectTargetSymbol)
            return target;
        if (prop === QObjectIdSymbol)
            return this.id;
        if (prop === QOjectTransientsSymbol) {
            return this.transients || (this.transients = new WeakMap());
        }
        const value = target[prop];
        QObject_notifyRead(target);
        return wrap(value);
    }
    set(target, prop, newValue) {
        if (prop === QObjectDocumentSymbol) {
            this.doc = newValue;
        }
        else if (prop == QObjectIdSymbol) {
            this.id = newValue;
        }
        else {
            const unwrappedNewValue = unwrapProxy(newValue);
            const oldValue = target[prop];
            if (oldValue !== unwrappedNewValue) {
                target[prop] = unwrappedNewValue;
                QObject_notifyWrite(this.id, this.doc);
            }
        }
        return true;
    }
    has(target, property) {
        if (property === QOjectTargetSymbol)
            return true;
        return Object.prototype.hasOwnProperty.call(target, property);
    }
    ownKeys(target) {
        return Object.getOwnPropertyNames(target);
    }
}
const proxyMap = new WeakMap();
function generateId() {
    return (
    // TODO(misko): For now I have removed the data as I think it is overkill
    // and makes the output unnecessarily big.
    // new Date().getTime().toString(36) +
    Math.round(Math.random() * Number.MAX_SAFE_INTEGER).toString(36));
}

// TODO(misko): need full object parsing /serializing
const JSON_OBJ_PREFIX = '\u0010';
const ATTR_OBJ_PREFIX = '*';
function qJsonStringify(obj, map) {
    if (obj == undefined)
        return String(obj);
    if (typeof obj == 'number')
        return String(obj);
    if (typeof obj == 'boolean')
        return String(obj);
    const id = getQObjectId(obj);
    if (id) {
        map && map.set(id, obj);
        return ATTR_OBJ_PREFIX + id;
    }
    if (typeof obj == 'string') {
        const ch = obj.charCodeAt(0);
        if (isDash(ch) || isDigit(ch) || isObj(ch) || isReserved(obj) || containsEscape(obj)) {
            return "'" + obj.replace(/'/g, "\\'").replace(/\//g, '\\') + "'";
        }
        return obj;
    }
    return JSON.stringify(obj, function (key, value) {
        const id = getQObjectId(value);
        if (id) {
            assertDefined(map);
            map && map.set(id, value);
            return JSON_OBJ_PREFIX + id;
        }
        return value;
    });
}
function qJsonParse(txt, map) {
    if (txt == '')
        return '';
    if (txt == 'null')
        return null;
    if (txt == 'undefined')
        return undefined;
    if (txt == 'false')
        return false;
    if (txt == 'true')
        return true;
    const ch = txt.charCodeAt(0);
    if (isDigit(ch) || isDash(ch)) {
        return Number(txt);
    }
    if (isAttrObj(ch)) {
        const id = txt.substr(1); // QObject ID;
        if (!map) {
            // TODO(misko): better error / test
            throw new Error('Map needs to be present when parsing QObjects');
        }
        const obj = map.get(id);
        assertDefined(obj);
        return obj;
    }
    if (isQuote(ch)) {
        return txt.substring(1, txt.length - 1).replace(/\\(.)/, (v) => v);
    }
    if (isObj(ch)) {
        return JSON.parse(txt, function (key, value) {
            if (typeof value == 'string' && isJsonObj(value.charCodeAt(0))) {
                if (!map) {
                    // TODO(misko): better error / test
                    throw new Error('Map needs to be present when parsing QObjects');
                }
                value = map.get(value.substr(1));
                assertDefined(value);
            }
            return value;
        });
    }
    return txt;
}
function isDash(ch) {
    return ch == '-'.charCodeAt(0);
}
function isObj(ch) {
    return ch == '['.charCodeAt(0) || ch == '{'.charCodeAt(0);
}
function isQuote(ch) {
    return ch == "'".charCodeAt(0);
}
function isDigit(ch) {
    return '0'.charCodeAt(0) <= ch && ch <= '9'.charCodeAt(0);
}
function isAttrObj(ch) {
    return ch == ATTR_OBJ_PREFIX.charCodeAt(0);
}
function isJsonObj(ch) {
    return ch == JSON_OBJ_PREFIX.charCodeAt(0);
}
function isReserved(obj) {
    return obj === 'null' || obj === 'undefined' || obj == 'true' || obj == 'false';
}
function containsEscape(obj) {
    return obj.indexOf("'") != -1 || obj.indexOf('\\') != -1;
}
function isParsedQRL(value) {
    return value instanceof ParsedQRL;
}
// TODO(misko): Split this to static and runtime because ParsedQRL should be internal
class ParsedQRL {
    constructor(url, symbol, params) {
        this._serialized = null;
        this.args = null;
        this.url = url;
        this.symbol = symbol;
        this.args = params;
    }
    get(name) {
        return (this.args && this.args[name]) || null;
    }
    getState() {
        return (this.args && this.args[QRL_STATE]) || '';
    }
    with(args) {
        const p = cloneQrlParams(this);
        Object.assign(p, args);
        return new ParsedQRL(this.url, this.symbol, p);
    }
    toString() {
        return stringifyQRL(this);
    }
}
const QRL_STATE = '.';
const MOCK_BASE = 'http://q/';
function cloneQrlParams(qrl) {
    return qrl.args ? Object.assign({}, qrl.args) : {};
}
function parseQRL(qrl, map) {
    assertDefined(qrl);
    const string = String(qrl);
    let hashIdx = string.indexOf('#');
    if (hashIdx == -1)
        hashIdx = string.length;
    const url = string.substring(0, hashIdx);
    const urlParsed = new URL(string.substr(hashIdx + 1), MOCK_BASE);
    const symbol = urlParsed.pathname.substr(1);
    const params = {};
    const tMap = map && trackingMap(map);
    urlParsed.searchParams.forEach((v, k) => {
        params[k] = qJsonParse(v, tMap);
    });
    const parsedQRL = new ParsedQRL(url, symbol, params);
    parsedQRL._serialized = tMap && tMap.items ? [string, ...tMap.items] : string;
    return parsedQRL;
}
function stringifyQRL(parsedQRL, map) {
    const url = new URL(parsedQRL.symbol, MOCK_BASE);
    if (parsedQRL.args) {
        for (const key in parsedQRL.args) {
            if (Object.prototype.hasOwnProperty.call(parsedQRL.args, key)) {
                const value = qJsonStringify(parsedQRL.args[key], map);
                url.searchParams.set(key, value);
            }
        }
    }
    const hash = url.toString().substr(MOCK_BASE.length);
    const string = parsedQRL.url + (hash ? '#' + hash : '');
    parsedQRL._serialized = string;
    return string;
}
function trackingMap(map) {
    const tMap = {
        items: null,
        get(key) {
            const items = tMap.items || (tMap.items = []);
            items.push(key);
            return map.get(key);
        },
        set(key, value) {
            const items = tMap.items || (tMap.items = []);
            items.push(key);
            map.set(key, value);
        },
    };
    return tMap;
}

/**
 * This file is here to make testing of QRLs without Optimizer possible. The content of this file should
 * not ever make it to production.
 */
let qrlMap;
let qrlNextId;
const MOCK_IMPORT = '/qMockModule';
/**
 * This function is here to make testing easier. It is expected
 * that the method is tree shaken by the bundlers.
 *
 * The purpose of this function is to generate a unique QRL
 * for a symbol. This allows for writing and executing the tests
 * without optimizer being present.
 */
function toDevModeQRL(symbol, stackFrames) {
    if (!qTest)
        throw new Error('This should run in tests only!!!');
    if (!qrlMap) {
        qrlMap = new Map();
        qrlNextId = 0;
    }
    // TODO(misko): Make this nicer. This relies on qrl=>toQrl for it to work.
    const frames = stackFrames.stack.split('\n');
    const key = frames[2];
    let qrl = qrlMap.get(key);
    if (!qrl) {
        const symbolName = 'symbol_' + qrlNextId++;
        qrl = MOCK_IMPORT + '#' + symbolName;
        qrlMap.set(qrl, symbol);
        qrlMap.set(key, qrl);
        const qrlMockExport = qGlobal[MOCK_IMPORT + '.js'] || (qGlobal[MOCK_IMPORT + '.js'] = {});
        qrlMockExport[symbolName] = symbol;
    }
    qrl = new String(qrl);
    qrl.with = withArgs;
    return qrl;
}
function withArgs(args) {
    return stringifyQRL(parseQRL(String(this)).with(args));
}
/**
 * This function is here to make testing easier. It is expected
 * that the method is tree shaken by the bundlers.
 *
 * The purpose of this function is to generate a unique QRL
 * for a symbol. This allows for writing and executing the tests
 * without optimizer being present.
 */
function fromQRL(qrl) {
    if (!qTest)
        throw new Error('This should run in tests only!!!');
    if (typeof qrl === 'string' || qrl instanceof String) {
        const key = qrl.split('?')[0];
        if (qrlMap) {
            const symbol = qrlMap.get(key);
            if (symbol)
                return symbol;
        }
    }
    return undefined;
}

function hashCode(text, hash = 0) {
    if (text.length === 0)
        return hash;
    for (let i = 0; i < text.length; i++) {
        const chr = text.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return Number(Math.abs(hash)).toString(36);
}

/**
 * @public
 */
function styleKey(qStyles) {
    return qStyles && String(hashCode(String(qStyles)));
}
function styleHost(styleId) {
    return styleId && "\uD83D\uDCE6" /* ComponentStylesPrefixHost */ + styleId;
}
function styleContent(styleId) {
    return styleId && "\uD83C\uDFF7\uFE0F" /* ComponentStylesPrefixContent */ + styleId;
}

// <docs markdown="./q-component.md#qComponent">
// !!DO NOT EDIT THIS COMMENT DIRECTLY!!! (edit ./q-component.md instead)
/**
 * Create a Qwik component that can be used in JSX.
 *
 * Use `qComponent` to declare a Qwik component. `QComponent` is a special kind of component that
 * allows the Qwik framework to lazy load and executed the component independently of other
 * `QComponent`s on the page as well as lazy load the `QComponent`s life-cycle hooks and event
 * handlers.
 *
 * Side note: You can also declare regular (standard JSX) components that will have standard
 * synchronous behavior.
 *
 * `QComponent` is a facade that describes how the component should be used without forcing the
 * implementation of the component to be eagerly loaded. The definition consists of:
 *
 * - Component definition (`qComponent`) a description of the public (props) and private (state)
 * interface of a component.
 * - a set of life-cycle hooks. (`onRender` is the only required hook).
 * - `tag`/`props`: an optional tag and props to be placed on the host element of the component.
 *
 * ### Example:
 *
 * Example showing how to create a counter component.
 *
 * ```typescript
 * export const Counter = qComponent<{ value?: number; step?: number }, { count: number }>({
 *   onMount: qHook((props) => ({ count: props.value || 0 })),
 *   onRender: qHook((props, state) => (
 *     <div>
 *       <span>{state.count}</span>
 *       <button
 *         on:click={qHook<typeof Counter>((props, state) => {
 *           state.count += props.step || 1;
 *         })}
 *       >
 *         +
 *       </button>
 *     </div>
 *   )),
 * });
 * ```
 *
 * - `qComponent` is how a component gets declared.
 * - `{ value?: number; step?: number }` declares the public (props) interface of the component.
 * - `{ count: number }` declares the private (state) interface of the component.
 * - `onMount`: is used to initialize the private state.
 * - `onRender`: is required hook for rendering the component.
 * - `qHook`: mark which parts of the component will be lazy-loaded. (see `qHook` for details.)
 *
 * The above can than be used like so:
 *
 * ```typescript
 * export const OtherComponent = qComponent({
 *   onRender: qHook(() => <Counter value={100} />),
 * });
 * ```
 *
 * @public
 */
// </docs>
function qComponent({ onRender, styles, unscopedStyles, tagName, props, onResume, onMount, onUnmount, onHydrate, onDehydrate, }) {
    const QComponent = function (jsxProps) {
        return h(tagName || 'div', Object.assign(Object.assign({ ["on:q-mount" /* OnMount */]: onMount, ["on:q-render" /* OnRender */]: onRender, ["on:q-unmount" /* OnUnmount */]: onUnmount, ["on:q-hydrate" /* OnHydrate */]: onHydrate, ["on:q-dehydrate" /* OnDehydrate */]: onDehydrate, ["q:sstyle" /* ComponentStyles */]: styles, ["q:ustyle" /* ComponentUnscopedStyles */]: unscopedStyles }, props), jsxProps));
    };
    QComponent.onRender = onRender || null;
    QComponent.onResume = onResume || null;
    QComponent.onMount = onMount || null;
    QComponent.onUnmount = onUnmount || null;
    QComponent.onHydrate = onHydrate || null;
    QComponent.onDehydrate = onDehydrate || null;
    QComponent.styles = styles || null;
    const styleId = styleKey(styles);
    QComponent.styleHostClass = styleHost(styleId) || null;
    QComponent.styleClass = styleContent(styleId) || null;
    return QComponent;
}

/**
 * @public
 */
function qHook(hook, symbol) {
    if (typeof symbol === 'string') {
        let match;
        if ((match = String(hook).match(EXTRACT_IMPORT_PATH)) && match[2]) {
            hook = match[2];
        }
        else if ((match = String(hook).match(EXTRACT_SELF_IMPORT))) {
            const frame = new Error('SELF').stack.split('\n')[2];
            match = frame.match(EXTRACT_FILE_NAME);
            if (!match) {
                throw new Error('Could not filename in: ' + frame);
            }
            hook = match[1];
        }
        else {
            throw new Error('dynamic import not found: ' + String(hook));
        }
        hook =
            (hook.startsWith('.') ? '' : './') +
                (hook.endsWith('.js') ? hook.substr(0, hook.length - 3) : hook) +
                '#' +
                symbol;
    }
    if (typeof hook === 'string')
        return parseQRL(hook);
    const qrlFn = async (element, event, url) => {
        const isQwikInternalHook = typeof event == 'string';
        // isQwikInternalHook && console.log('HOOK', event, element, url);
        // `isQwikInternalHook` is a bit of a hack. When events fire we need to treat self as host
        // but if it is regular event than we need to skip us.
        const hostElement = getHostElement(isQwikInternalHook ? element : element.parentElement);
        const props = hostElement && qProps(hostElement);
        const parsedQRL = props && parseQRL(url.toString(), props.__qMap__);
        const state = props && parsedQRL && props['state:' + parsedQRL.getState()];
        const args = parsedQRL && parsedQRL.args;
        return await useInvoke(() => hook(props, state, args), hostElement, event, url);
    };
    if (qTest) {
        return toDevModeQRL(qrlFn, new Error());
    }
    return qrlFn;
}
// https://regexr.com/68v72
const EXTRACT_IMPORT_PATH = /\(\s*(['"])([^\1]+)\1\s*\)/;
// https://regexr.com/690ds
const EXTRACT_SELF_IMPORT = /Promise\s*\.\s*resolve/;
// https://regexr.com/6a83h
const EXTRACT_FILE_NAME = /[\\/(]([\w\d.\-_]+)\.(js|ts)x?:/;

//TODO(misko): Add public DOCS.
//TODO(misko): Rename to qDehydrate
/**
 * @public
 */
function qDehydrate(document) {
    QStore_dehydrate(document);
}

/**
 * Render JSX.
 *
 * Use this method to render JSX. This function does reconciling which means
 * it always tries to reuse what is already in the DOM (rather then destroy and
 * recrate content.)
 *
 * @param parent - Element which will act as a parent to `jsxNode`. When
 *     possible the rendering will try to reuse existing nodes.
 * @param jsxNode - JSX to render
 * @public
 */
async function qRender(parent, jsxNode) {
    const renderQueue = [];
    let firstChild = parent.firstChild;
    while (firstChild && firstChild.nodeType > 8 /* COMMENT_NODE */) {
        firstChild = firstChild.nextSibling;
    }
    const cursor = cursorForParent(parent);
    visitJsxNode(null, renderQueue, cursor, jsxNode);
    return flattenPromiseTree(renderQueue);
}

export { qDehydrate as a, qComponent as b, qHook as c, h, jsx as j, qRender as q, setPlatform as s, useEvent as u };
