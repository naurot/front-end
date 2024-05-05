
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	let src_url_equal_anchor;

	/**
	 * @param {string} element_src
	 * @param {string} url
	 * @returns {boolean}
	 */
	function src_url_equal(element_src, url) {
		if (element_src === url) return true;
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		// This is actually faster than doing URL(..).href
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/** @type {typeof globalThis} */
	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: // @ts-ignore Node typings have this
			  global;

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @returns {(event: any) => any} */
	function prevent_default(fn) {
		return function (event) {
			event.preventDefault();
			// @ts-ignore
			return fn.call(this, event);
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/** @returns {number} */
	function to_number(value) {
		return value === '' ? null : +value;
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function toggle_class(element, name, toggle) {
		// The `!!` is required because an `undefined` flag means flipping the current state.
		element.classList.toggle(name, !!toggle);
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	/**
	 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs#template-syntax-component-directives-on-eventname).
	 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
	 *
	 * Component events created with `createEventDispatcher` create a
	 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
	 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
	 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
	 * property and can contain any type of data.
	 *
	 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
	 * ```ts
	 * const dispatch = createEventDispatcher<{
	 *  loaded: never; // does not take a detail argument
	 *  change: string; // takes a detail argument of type string, which is required
	 *  optional: number | null; // takes an optional detail argument of type number
	 * }>();
	 * ```
	 *
	 * https://svelte.dev/docs/svelte#createeventdispatcher
	 * @template {Record<string, any>} [EventMap=any]
	 * @returns {import('./public.js').EventDispatcher<EventMap>}
	 */
	function createEventDispatcher() {
		const component = get_current_component();
		return (type, detail, { cancelable = false } = {}) => {
			const callbacks = component.$$.callbacks[type];
			if (callbacks) {
				// TODO are there situations where events could be dispatched
				// in a server (non-DOM) environment?
				const event = custom_event(/** @type {string} */ (type), detail, { cancelable });
				callbacks.slice().forEach((fn) => {
					fn.call(component, event);
				});
				return !event.defaultPrevented;
			}
			return true;
		};
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.2.15';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	/* src\components\Buy.svelte generated by Svelte v4.2.15 */
	const file$3 = "src\\components\\Buy.svelte";

	function create_fragment$3(ctx) {
		let div2;
		let div1;
		let h2;
		let t1;
		let form;
		let label0;
		let t2;
		let input0;
		let t3;
		let label1;
		let t4;
		let input1;
		let t5;
		let div0;
		let button0;
		let t7;
		let button1;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				div2 = element("div");
				div1 = element("div");
				h2 = element("h2");
				h2.textContent = "Buy Token";
				t1 = space();
				form = element("form");
				label0 = element("label");
				t2 = text("FT Quant:\r\n            ");
				input0 = element("input");
				t3 = space();
				label1 = element("label");
				t4 = text("NFT Quant:\r\n            ");
				input1 = element("input");
				t5 = space();
				div0 = element("div");
				button0 = element("button");
				button0.textContent = "Cancel";
				t7 = space();
				button1 = element("button");
				button1.textContent = "Submit";
				add_location(h2, file$3, 22, 8, 452);
				attr_dev(input0, "type", "number");
				attr_dev(input0, "id", "ftQuant");
				attr_dev(input0, "min", "0");
				attr_dev(input0, "max", "1000");
				attr_dev(input0, "size", "4");
				input0.required = true;
				attr_dev(input0, "class", "svelte-1munsr7");
				add_location(input0, file$3, 25, 12, 585);
				attr_dev(label0, "for", "ftQuant");
				attr_dev(label0, "class", "svelte-1munsr7");
				add_location(label0, file$3, 24, 12, 540);
				attr_dev(input1, "type", "number");
				attr_dev(input1, "id", "nftQuant");
				attr_dev(input1, "min", "0");
				attr_dev(input1, "max", "1000");
				attr_dev(input1, "size", "4");
				input1.required = true;
				attr_dev(input1, "class", "svelte-1munsr7");
				add_location(input1, file$3, 28, 12, 747);
				attr_dev(label1, "for", "nftQuant");
				attr_dev(label1, "class", "svelte-1munsr7");
				add_location(label1, file$3, 27, 12, 701);
				attr_dev(button0, "type", "button");
				attr_dev(button0, "class", "svelte-1munsr7");
				add_location(button0, file$3, 31, 16, 904);
				attr_dev(button1, "type", "submit");
				attr_dev(button1, "class", "svelte-1munsr7");
				add_location(button1, file$3, 32, 16, 983);
				attr_dev(div0, "class", "buttons svelte-1munsr7");
				add_location(div0, file$3, 30, 12, 865);
				add_location(form, file$3, 23, 8, 480);
				attr_dev(div1, "class", "modal-content svelte-1munsr7");
				add_location(div1, file$3, 21, 4, 415);
				attr_dev(div2, "class", "modal svelte-1munsr7");
				add_location(div2, file$3, 20, 0, 390);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div2, anchor);
				append_dev(div2, div1);
				append_dev(div1, h2);
				append_dev(div1, t1);
				append_dev(div1, form);
				append_dev(form, label0);
				append_dev(label0, t2);
				append_dev(label0, input0);
				set_input_value(input0, /*ftQuant*/ ctx[0]);
				append_dev(form, t3);
				append_dev(form, label1);
				append_dev(label1, t4);
				append_dev(label1, input1);
				set_input_value(input1, /*nftQuant*/ ctx[1]);
				append_dev(form, t5);
				append_dev(form, div0);
				append_dev(div0, button0);
				append_dev(div0, t7);
				append_dev(div0, button1);

				if (!mounted) {
					dispose = [
						listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
						listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
						listen_dev(button0, "click", /*handleCancel*/ ctx[3], false, false, false, false),
						listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[2]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*ftQuant*/ 1 && to_number(input0.value) !== /*ftQuant*/ ctx[0]) {
					set_input_value(input0, /*ftQuant*/ ctx[0]);
				}

				if (dirty & /*nftQuant*/ 2 && to_number(input1.value) !== /*nftQuant*/ ctx[1]) {
					set_input_value(input1, /*nftQuant*/ ctx[1]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div2);
				}

				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$3.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$3($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Buy', slots, []);
		const dispatch = createEventDispatcher();
		let ftQuant = 0;
		let nftQuant = 0;

		function handleSubmit() {
			const formData = { ftQuant, nftQuant };
			dispatch('submit', formData);
		}

		function handleCancel() {
			dispatch('cancel');
		}

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Buy> was created with unknown prop '${key}'`);
		});

		function input0_input_handler() {
			ftQuant = to_number(this.value);
			$$invalidate(0, ftQuant);
		}

		function input1_input_handler() {
			nftQuant = to_number(this.value);
			$$invalidate(1, nftQuant);
		}

		$$self.$capture_state = () => ({
			createEventDispatcher,
			dispatch,
			ftQuant,
			nftQuant,
			handleSubmit,
			handleCancel
		});

		$$self.$inject_state = $$props => {
			if ('ftQuant' in $$props) $$invalidate(0, ftQuant = $$props.ftQuant);
			if ('nftQuant' in $$props) $$invalidate(1, nftQuant = $$props.nftQuant);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			ftQuant,
			nftQuant,
			handleSubmit,
			handleCancel,
			input0_input_handler,
			input1_input_handler
		];
	}

	class Buy extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Buy",
				options,
				id: create_fragment$3.name
			});
		}
	}

	/* src\components\Mint.svelte generated by Svelte v4.2.15 */
	const file$2 = "src\\components\\Mint.svelte";

	function create_fragment$2(ctx) {
		let div2;
		let div1;
		let h2;
		let t1;
		let form;
		let label0;
		let t2;
		let input0;
		let t3;
		let label1;
		let t4;
		let input1;
		let t5;
		let label2;
		let t6;
		let input2;
		let t7;
		let label3;
		let t8;
		let input3;
		let t9;
		let label4;
		let t10;
		let input4;
		let t11;
		let label5;
		let t12;
		let input5;
		let t13;
		let label6;
		let t14;
		let input6;
		let t15;
		let div0;
		let button0;
		let t17;
		let button1;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				div2 = element("div");
				div1 = element("div");
				h2 = element("h2");
				h2.textContent = "Mint Token";
				t1 = space();
				form = element("form");
				label0 = element("label");
				t2 = text("Owner's Name:\r\n            ");
				input0 = element("input");
				t3 = space();
				label1 = element("label");
				t4 = text("Token Name:\r\n            ");
				input1 = element("input");
				t5 = space();
				label2 = element("label");
				t6 = text("Royalty:\r\n            ");
				input2 = element("input");
				t7 = space();
				label3 = element("label");
				t8 = text("Price:\r\n            ");
				input3 = element("input");
				t9 = space();
				label4 = element("label");
				t10 = text("FT Quant:\r\n            ");
				input4 = element("input");
				t11 = space();
				label5 = element("label");
				t12 = text("NFT Quant:\r\n            ");
				input5 = element("input");
				t13 = space();
				label6 = element("label");
				t14 = text("Picture:\r\n            ");
				input6 = element("input");
				t15 = space();
				div0 = element("div");
				button0 = element("button");
				button0.textContent = "Cancel";
				t17 = space();
				button1 = element("button");
				button1.textContent = "Submit";
				add_location(h2, file$2, 33, 8, 696);
				attr_dev(input0, "type", "text");
				attr_dev(input0, "id", "ownerName");
				attr_dev(input0, "class", "svelte-1munsr7");
				add_location(input0, file$2, 36, 12, 835);
				attr_dev(label0, "for", "ownerName");
				attr_dev(label0, "class", "svelte-1munsr7");
				add_location(label0, file$2, 35, 12, 785);
				attr_dev(input1, "type", "text");
				attr_dev(input1, "id", "tokenName");
				input1.required = true;
				attr_dev(input1, "class", "svelte-1munsr7");
				add_location(input1, file$2, 38, 12, 964);
				attr_dev(label1, "for", "tokenName");
				attr_dev(label1, "class", "svelte-1munsr7");
				add_location(label1, file$2, 37, 12, 916);
				attr_dev(input2, "type", "number");
				attr_dev(input2, "id", "royalty");
				attr_dev(input2, "min", "0");
				attr_dev(input2, "max", "20");
				input2.required = true;
				attr_dev(input2, "class", "svelte-1munsr7");
				add_location(input2, file$2, 40, 12, 1097);
				attr_dev(label2, "for", "royalty");
				attr_dev(label2, "class", "svelte-1munsr7");
				add_location(label2, file$2, 39, 12, 1054);
				attr_dev(input3, "type", "number");
				attr_dev(input3, "id", "price");
				attr_dev(input3, "min", "1");
				attr_dev(input3, "max", "10");
				input3.required = true;
				attr_dev(input3, "class", "svelte-1munsr7");
				add_location(input3, file$2, 42, 12, 1241);
				attr_dev(label3, "for", "price");
				attr_dev(label3, "class", "svelte-1munsr7");
				add_location(label3, file$2, 41, 12, 1202);
				attr_dev(input4, "type", "number");
				attr_dev(input4, "id", "ftQuant");
				attr_dev(input4, "min", "0");
				attr_dev(input4, "max", "1000");
				input4.required = true;
				attr_dev(input4, "class", "svelte-1munsr7");
				add_location(input4, file$2, 44, 12, 1386);
				attr_dev(label4, "for", "ftQuant");
				attr_dev(label4, "class", "svelte-1munsr7");
				add_location(label4, file$2, 43, 12, 1342);
				attr_dev(input5, "type", "number");
				attr_dev(input5, "id", "nftQuant");
				attr_dev(input5, "min", "0");
				attr_dev(input5, "max", "1000");
				input5.required = true;
				attr_dev(input5, "class", "svelte-1munsr7");
				add_location(input5, file$2, 46, 12, 1540);
				attr_dev(label5, "for", "nftQuant");
				attr_dev(label5, "class", "svelte-1munsr7");
				add_location(label5, file$2, 45, 12, 1494);
				attr_dev(input6, "type", "file");
				attr_dev(input6, "id", "picURL");
				attr_dev(input6, "accept", "image/jpeg, image/png");
				input6.required = true;
				attr_dev(input6, "class", "svelte-1munsr7");
				add_location(input6, file$2, 48, 12, 1691);
				attr_dev(label6, "for", "picURL");
				attr_dev(label6, "class", "svelte-1munsr7");
				add_location(label6, file$2, 47, 12, 1649);
				attr_dev(button0, "type", "button");
				attr_dev(button0, "class", "svelte-1munsr7");
				add_location(button0, file$2, 51, 16, 1847);
				attr_dev(button1, "type", "submit");
				attr_dev(button1, "class", "svelte-1munsr7");
				add_location(button1, file$2, 52, 16, 1926);
				attr_dev(div0, "class", "buttons svelte-1munsr7");
				add_location(div0, file$2, 50, 12, 1808);
				add_location(form, file$2, 34, 8, 725);
				attr_dev(div1, "class", "modal-content svelte-1munsr7");
				add_location(div1, file$2, 32, 4, 659);
				attr_dev(div2, "class", "modal svelte-1munsr7");
				add_location(div2, file$2, 31, 0, 634);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div2, anchor);
				append_dev(div2, div1);
				append_dev(div1, h2);
				append_dev(div1, t1);
				append_dev(div1, form);
				append_dev(form, label0);
				append_dev(label0, t2);
				append_dev(label0, input0);
				set_input_value(input0, /*ownerName*/ ctx[0]);
				append_dev(form, t3);
				append_dev(form, label1);
				append_dev(label1, t4);
				append_dev(label1, input1);
				set_input_value(input1, /*tokenName*/ ctx[1]);
				append_dev(form, t5);
				append_dev(form, label2);
				append_dev(label2, t6);
				append_dev(label2, input2);
				set_input_value(input2, /*royalty*/ ctx[2]);
				append_dev(form, t7);
				append_dev(form, label3);
				append_dev(label3, t8);
				append_dev(label3, input3);
				set_input_value(input3, /*price*/ ctx[3]);
				append_dev(form, t9);
				append_dev(form, label4);
				append_dev(label4, t10);
				append_dev(label4, input4);
				set_input_value(input4, /*ftQuant*/ ctx[4]);
				append_dev(form, t11);
				append_dev(form, label5);
				append_dev(label5, t12);
				append_dev(label5, input5);
				set_input_value(input5, /*nftQuant*/ ctx[5]);
				append_dev(form, t13);
				append_dev(form, label6);
				append_dev(label6, t14);
				append_dev(label6, input6);
				append_dev(form, t15);
				append_dev(form, div0);
				append_dev(div0, button0);
				append_dev(div0, t17);
				append_dev(div0, button1);

				if (!mounted) {
					dispose = [
						listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
						listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
						listen_dev(input2, "input", /*input2_input_handler*/ ctx[11]),
						listen_dev(input3, "input", /*input3_input_handler*/ ctx[12]),
						listen_dev(input4, "input", /*input4_input_handler*/ ctx[13]),
						listen_dev(input5, "input", /*input5_input_handler*/ ctx[14]),
						listen_dev(input6, "change", /*input6_change_handler*/ ctx[15]),
						listen_dev(button0, "click", /*handleCancel*/ ctx[8], false, false, false, false),
						listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[7]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*ownerName*/ 1 && input0.value !== /*ownerName*/ ctx[0]) {
					set_input_value(input0, /*ownerName*/ ctx[0]);
				}

				if (dirty & /*tokenName*/ 2 && input1.value !== /*tokenName*/ ctx[1]) {
					set_input_value(input1, /*tokenName*/ ctx[1]);
				}

				if (dirty & /*royalty*/ 4 && to_number(input2.value) !== /*royalty*/ ctx[2]) {
					set_input_value(input2, /*royalty*/ ctx[2]);
				}

				if (dirty & /*price*/ 8 && to_number(input3.value) !== /*price*/ ctx[3]) {
					set_input_value(input3, /*price*/ ctx[3]);
				}

				if (dirty & /*ftQuant*/ 16 && to_number(input4.value) !== /*ftQuant*/ ctx[4]) {
					set_input_value(input4, /*ftQuant*/ ctx[4]);
				}

				if (dirty & /*nftQuant*/ 32 && to_number(input5.value) !== /*nftQuant*/ ctx[5]) {
					set_input_value(input5, /*nftQuant*/ ctx[5]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div2);
				}

				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$2.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$2($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Mint', slots, []);
		const dispatch = createEventDispatcher();
		let ownerName = "";
		let tokenName = "";
		let royalty = "";
		let price = "";
		let ftQuant = "";
		let nftQuant = "";
		let picURL = "";

		function handleSubmit() {
			const formData = {
				ownerName,
				tokenName,
				royalty,
				price,
				ftQuant,
				nftQuant,
				picURL
			};

			dispatch("submit", formData);
		}

		function handleCancel() {
			dispatch("cancel");
		}

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Mint> was created with unknown prop '${key}'`);
		});

		function input0_input_handler() {
			ownerName = this.value;
			$$invalidate(0, ownerName);
		}

		function input1_input_handler() {
			tokenName = this.value;
			$$invalidate(1, tokenName);
		}

		function input2_input_handler() {
			royalty = to_number(this.value);
			$$invalidate(2, royalty);
		}

		function input3_input_handler() {
			price = to_number(this.value);
			$$invalidate(3, price);
		}

		function input4_input_handler() {
			ftQuant = to_number(this.value);
			$$invalidate(4, ftQuant);
		}

		function input5_input_handler() {
			nftQuant = to_number(this.value);
			$$invalidate(5, nftQuant);
		}

		function input6_change_handler() {
			picURL = this.value;
			$$invalidate(6, picURL);
		}

		$$self.$capture_state = () => ({
			createEventDispatcher,
			dispatch,
			ownerName,
			tokenName,
			royalty,
			price,
			ftQuant,
			nftQuant,
			picURL,
			handleSubmit,
			handleCancel
		});

		$$self.$inject_state = $$props => {
			if ('ownerName' in $$props) $$invalidate(0, ownerName = $$props.ownerName);
			if ('tokenName' in $$props) $$invalidate(1, tokenName = $$props.tokenName);
			if ('royalty' in $$props) $$invalidate(2, royalty = $$props.royalty);
			if ('price' in $$props) $$invalidate(3, price = $$props.price);
			if ('ftQuant' in $$props) $$invalidate(4, ftQuant = $$props.ftQuant);
			if ('nftQuant' in $$props) $$invalidate(5, nftQuant = $$props.nftQuant);
			if ('picURL' in $$props) $$invalidate(6, picURL = $$props.picURL);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			ownerName,
			tokenName,
			royalty,
			price,
			ftQuant,
			nftQuant,
			picURL,
			handleSubmit,
			handleCancel,
			input0_input_handler,
			input1_input_handler,
			input2_input_handler,
			input3_input_handler,
			input4_input_handler,
			input5_input_handler,
			input6_change_handler
		];
	}

	class Mint extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Mint",
				options,
				id: create_fragment$2.name
			});
		}
	}

	/* src\components\Card.svelte generated by Svelte v4.2.15 */

	const { console: console_1$1 } = globals;
	const file$1 = "src\\components\\Card.svelte";

	// (63:8) {#if card.isEnlarged}
	function create_if_block(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block_1, create_else_block];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*card*/ ctx[0].purpose === "mint") return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(63:8) {#if card.isEnlarged}",
			ctx
		});

		return block;
	}

	// (72:12) {:else}
	function create_else_block(ctx) {
		let button;
		let t1;
		let if_block_anchor;
		let current;
		let mounted;
		let dispose;
		let if_block = /*isBuyOpen*/ ctx[1] && create_if_block_3(ctx);

		const block = {
			c: function create() {
				button = element("button");
				button.textContent = "Buy";
				t1 = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				attr_dev(button, "class", "svelte-1b6amio");
				add_location(button, file$1, 72, 16, 2262);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);
				insert_dev(target, t1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = listen_dev(button, "click", /*openBuy*/ ctx[3], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (/*isBuyOpen*/ ctx[1]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*isBuyOpen*/ 2) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_3(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(button);
					detach_dev(t1);
					detach_dev(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(72:12) {:else}",
			ctx
		});

		return block;
	}

	// (64:12) {#if card.purpose === "mint"}
	function create_if_block_1(ctx) {
		let button;
		let t1;
		let if_block_anchor;
		let current;
		let mounted;
		let dispose;
		let if_block = /*isMintOpen*/ ctx[2] && create_if_block_2(ctx);

		const block = {
			c: function create() {
				button = element("button");
				button.textContent = "Mint";
				t1 = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				attr_dev(button, "class", "svelte-1b6amio");
				add_location(button, file$1, 64, 16, 1971);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);
				insert_dev(target, t1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = listen_dev(button, "click", /*openMint*/ ctx[4], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (/*isMintOpen*/ ctx[2]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*isMintOpen*/ 4) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_2(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(button);
					detach_dev(t1);
					detach_dev(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(64:12) {#if card.purpose === \\\"mint\\\"}",
			ctx
		});

		return block;
	}

	// (74:16) {#if isBuyOpen}
	function create_if_block_3(ctx) {
		let buy;
		let current;
		buy = new Buy({ $$inline: true });
		buy.$on("submit", /*handleFormSubmit*/ ctx[6]);
		buy.$on("cancel", /*handleClose*/ ctx[5]);

		const block = {
			c: function create() {
				create_component(buy.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(buy, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(buy.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(buy.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(buy, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3.name,
			type: "if",
			source: "(74:16) {#if isBuyOpen}",
			ctx
		});

		return block;
	}

	// (66:16) {#if isMintOpen}
	function create_if_block_2(ctx) {
		let mint;
		let current;
		mint = new Mint({ $$inline: true });
		mint.$on("submit", /*handleFormSubmit*/ ctx[6]);
		mint.$on("cancel", /*handleClose*/ ctx[5]);

		const block = {
			c: function create() {
				create_component(mint.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(mint, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(mint.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(mint.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(mint, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2.name,
			type: "if",
			source: "(66:16) {#if isMintOpen}",
			ctx
		});

		return block;
	}

	function create_fragment$1(ctx) {
		let div3;
		let div0;
		let img;
		let img_src_value;
		let img_alt_value;
		let t0;
		let div2;
		let h2;
		let t1_value = /*card*/ ctx[0].tokenName + "";
		let t1;
		let t2;
		let div1;
		let p0;
		let t3_value = /*card*/ ctx[0].ownerName + "";
		let t3;
		let t4;
		let p1;
		let t5_value = /*card*/ ctx[0].royalty + "";
		let t5;
		let t6;
		let t7;
		let p2;
		let t8_value = /*card*/ ctx[0].cost + "";
		let t8;
		let t9;
		let t10;
		let p3;
		let t11_value = /*card*/ ctx[0].mintLeft + "";
		let t11;
		let t12;
		let t13_value = /*card*/ ctx[0].mintTotal + "";
		let t13;
		let t14;
		let current;
		let mounted;
		let dispose;
		let if_block = /*card*/ ctx[0].isEnlarged && create_if_block(ctx);

		const block = {
			c: function create() {
				div3 = element("div");
				div0 = element("div");
				img = element("img");
				t0 = space();
				div2 = element("div");
				h2 = element("h2");
				t1 = text(t1_value);
				t2 = space();
				div1 = element("div");
				p0 = element("p");
				t3 = text(t3_value);
				t4 = space();
				p1 = element("p");
				t5 = text(t5_value);
				t6 = text("%");
				t7 = space();
				p2 = element("p");
				t8 = text(t8_value);
				t9 = text(" ETH");
				t10 = space();
				p3 = element("p");
				t11 = text(t11_value);
				t12 = text(" / ");
				t13 = text(t13_value);
				t14 = space();
				if (if_block) if_block.c();
				if (!src_url_equal(img.src, img_src_value = "/" + /*card*/ ctx[0].imgUrl + ".jpg")) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", img_alt_value = /*card*/ ctx[0].tokenName);
				attr_dev(img, "class", "svelte-1b6amio");
				add_location(img, file$1, 52, 8, 1468);
				attr_dev(div0, "class", "image-container svelte-1b6amio");
				add_location(div0, file$1, 51, 4, 1429);
				attr_dev(h2, "class", "token-name svelte-1b6amio");
				add_location(h2, file$1, 55, 8, 1570);
				attr_dev(p0, "class", "owner svelte-1b6amio");
				add_location(p0, file$1, 57, 12, 1656);
				attr_dev(p1, "class", "royalty svelte-1b6amio");
				add_location(p1, file$1, 58, 12, 1707);
				attr_dev(p2, "class", "cost svelte-1b6amio");
				add_location(p2, file$1, 59, 12, 1759);
				attr_dev(p3, "class", "mints svelte-1b6amio");
				add_location(p3, file$1, 60, 12, 1808);
				attr_dev(div1, "class", "info svelte-1b6amio");
				add_location(div1, file$1, 56, 8, 1624);
				attr_dev(div2, "class", "content svelte-1b6amio");
				add_location(div2, file$1, 54, 4, 1539);
				attr_dev(div3, "class", "card svelte-1b6amio");
				toggle_class(div3, "enlarged", /*card*/ ctx[0].isEnlarged);
				add_location(div3, file$1, 50, 0, 1346);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div3, anchor);
				append_dev(div3, div0);
				append_dev(div0, img);
				append_dev(div3, t0);
				append_dev(div3, div2);
				append_dev(div2, h2);
				append_dev(h2, t1);
				append_dev(div2, t2);
				append_dev(div2, div1);
				append_dev(div1, p0);
				append_dev(p0, t3);
				append_dev(div1, t4);
				append_dev(div1, p1);
				append_dev(p1, t5);
				append_dev(p1, t6);
				append_dev(div1, t7);
				append_dev(div1, p2);
				append_dev(p2, t8);
				append_dev(p2, t9);
				append_dev(div1, t10);
				append_dev(div1, p3);
				append_dev(p3, t11);
				append_dev(p3, t12);
				append_dev(p3, t13);
				append_dev(div2, t14);
				if (if_block) if_block.m(div2, null);
				current = true;

				if (!mounted) {
					dispose = listen_dev(div3, "click", /*toggleEnlarged*/ ctx[7], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (!current || dirty & /*card*/ 1 && !src_url_equal(img.src, img_src_value = "/" + /*card*/ ctx[0].imgUrl + ".jpg")) {
					attr_dev(img, "src", img_src_value);
				}

				if (!current || dirty & /*card*/ 1 && img_alt_value !== (img_alt_value = /*card*/ ctx[0].tokenName)) {
					attr_dev(img, "alt", img_alt_value);
				}

				if ((!current || dirty & /*card*/ 1) && t1_value !== (t1_value = /*card*/ ctx[0].tokenName + "")) set_data_dev(t1, t1_value);
				if ((!current || dirty & /*card*/ 1) && t3_value !== (t3_value = /*card*/ ctx[0].ownerName + "")) set_data_dev(t3, t3_value);
				if ((!current || dirty & /*card*/ 1) && t5_value !== (t5_value = /*card*/ ctx[0].royalty + "")) set_data_dev(t5, t5_value);
				if ((!current || dirty & /*card*/ 1) && t8_value !== (t8_value = /*card*/ ctx[0].cost + "")) set_data_dev(t8, t8_value);
				if ((!current || dirty & /*card*/ 1) && t11_value !== (t11_value = /*card*/ ctx[0].mintLeft + "")) set_data_dev(t11, t11_value);
				if ((!current || dirty & /*card*/ 1) && t13_value !== (t13_value = /*card*/ ctx[0].mintTotal + "")) set_data_dev(t13, t13_value);

				if (/*card*/ ctx[0].isEnlarged) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*card*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div2, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				if (!current || dirty & /*card*/ 1) {
					toggle_class(div3, "enlarged", /*card*/ ctx[0].isEnlarged);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div3);
				}

				if (if_block) if_block.d();
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$1($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Card', slots, []);
		let { card } = $$props;
		card.isEnlarged = false;
		let isBuyOpen = false;
		let isMintOpen = false;

		function openBuy() {
			$$invalidate(1, isBuyOpen = true);
		}

		function openMint() {
			$$invalidate(2, isMintOpen = true);
		}

		function handleClose() {
			$$invalidate(1, isBuyOpen = false);
			$$invalidate(2, isMintOpen = false);
			$$invalidate(0, card.isEnlarged = false, card);
		}

		function handleFormSubmit(event) {
			console.log("Form submitted with data:", event.detail);
			handleClose();
		}

		function toggleEnlarged() {
			console.log(`Card Clicked: ${card.imgUrl}`);
			if (isBuyOpen || isMintOpen) return;
			$$invalidate(0, card.isEnlarged = !card.isEnlarged, card);

			if (card.isEnlarged) {
				if (typeof card.purpose === "undefined") {
					//we goot a wannabe buyer
					//get contract details from blockchain using contract address
					//
					console.log("buying");
				} else {
					// we got a wannabe maker
					//display a form
					console.log("making");
				}
			}
		}

		$$self.$$.on_mount.push(function () {
			if (card === undefined && !('card' in $$props || $$self.$$.bound[$$self.$$.props['card']])) {
				console_1$1.warn("<Card> was created without expected prop 'card'");
			}
		});

		const writable_props = ['card'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Card> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('card' in $$props) $$invalidate(0, card = $$props.card);
		};

		$$self.$capture_state = () => ({
			card,
			Buy,
			Mint,
			isBuyOpen,
			isMintOpen,
			openBuy,
			openMint,
			handleClose,
			handleFormSubmit,
			toggleEnlarged
		});

		$$self.$inject_state = $$props => {
			if ('card' in $$props) $$invalidate(0, card = $$props.card);
			if ('isBuyOpen' in $$props) $$invalidate(1, isBuyOpen = $$props.isBuyOpen);
			if ('isMintOpen' in $$props) $$invalidate(2, isMintOpen = $$props.isMintOpen);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			card,
			isBuyOpen,
			isMintOpen,
			openBuy,
			openMint,
			handleClose,
			handleFormSubmit,
			toggleEnlarged
		];
	}

	class Card extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$1, create_fragment$1, safe_not_equal, { card: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Card",
				options,
				id: create_fragment$1.name
			});
		}

		get card() {
			throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set card(value) {
			throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\App.svelte generated by Svelte v4.2.15 */

	const { Error: Error_1, console: console_1 } = globals;
	const file = "src\\App.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[2] = list[i];
		return child_ctx;
	}

	// (45:8) {#each cards as card}
	function create_each_block(ctx) {
		let card_1;
		let current;

		card_1 = new Card({
				props: { card: /*card*/ ctx[2] },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(card_1.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(card_1, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const card_1_changes = {};
				if (dirty & /*cards*/ 1) card_1_changes.card = /*card*/ ctx[2];
				card_1.$set(card_1_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(card_1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(card_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(card_1, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(45:8) {#each cards as card}",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let div1;
		let h1;
		let t1;
		let div0;
		let current;
		let each_value = ensure_array_like_dev(/*cards*/ ctx[0]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				div1 = element("div");
				h1 = element("h1");
				h1.textContent = "Kryptocist Artwerks";
				t1 = space();
				div0 = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				add_location(h1, file, 42, 4, 1208);
				attr_dev(div0, "class", "cards svelte-w0cedt");
				add_location(div0, file, 43, 4, 1241);
				add_location(div1, file, 41, 0, 1198);
			},
			l: function claim(nodes) {
				throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, h1);
				append_dev(div1, t1);
				append_dev(div1, div0);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div0, null);
					}
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*cards*/ 1) {
					each_value = ensure_array_like_dev(/*cards*/ ctx[0]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(div0, null);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function checkIfWalletConnected() {
		const { ethereum } = window;

		if (!ethereum) {
			console.log("You don't have a wallet!");
		} else {
			console.log("You have a wallet");
		}
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('App', slots, []);
		let cards = [];

		let newCard = {
			imgUrl: "0",
			tokenName: "ART",
			ownerName: "Arthur",
			mintLeft: "???",
			mintTotal: "???",
			cost: "?",
			royalty: "??",
			purpose: "mint"
		};

		// Fetch data from the backend when the component mounts
		onMount(async () => {
			checkIfWalletConnected();

			try {
				const response = await fetch("http://localhost:5000/cards");

				if (!response.ok) {
					throw new Error("Failed to fetch: " + response.statusText);
				}

				$$invalidate(0, cards = await response.json());

				// cards = cards.map(card => {return {...card, isEnlarged: false};
				// });
				$$invalidate(0, cards = [...cards, newCard]);
			} catch(error) {
				console.error("Error fetching cards:", error);
			}
		});

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			onMount,
			Card,
			cards,
			newCard,
			checkIfWalletConnected
		});

		$$self.$inject_state = $$props => {
			if ('cards' in $$props) $$invalidate(0, cards = $$props.cards);
			if ('newCard' in $$props) newCard = $$props.newCard;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [cards];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new App({
		target: document.body
	});

	return app;

})();
//# sourceMappingURL=bundle.js.map
