import { HTMLElement } from "@ephox/dom-globals";

// some elements, such as mathml, don't have style attributes
var isSupported = function (dom: HTMLElement) {
  return dom.style !== undefined 
    && dom.style.constructor !== undefined
	&& dom.style.constructor.name === 'CSSStyleDeclaration';
};

export default {
  isSupported
};