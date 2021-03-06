import { Option } from '@ephox/katamari';
import Element from '../../api/node/Element';
import Traverse from '../../api/search/Traverse';
import Selection from '../../api/selection/Selection';
import ContainerPoint from './ContainerPoint';
import EdgePoint from './EdgePoint';
import { Window, Document, Range } from '@ephox/dom-globals';

declare const document: any;

var caretPositionFromPoint = function (doc: Element, x: number, y: number) {
  return Option.from(doc.dom().caretPositionFromPoint(x, y)).bind(function (pos) {
    // It turns out that Firefox can return null for pos.offsetNode
    if (pos.offsetNode === null) return Option.none<Range>();
    var r = (doc.dom() as Document).createRange();
    r.setStart(pos.offsetNode, pos.offset);
    r.collapse();
    return Option.some(r);
  });
};

var caretRangeFromPoint = function (doc: Element, x: number, y: number) {
  return Option.from((doc.dom() as Document).caretRangeFromPoint(x, y));
};

var searchTextNodes = function (doc, node, x, y) {
  var r = doc.dom().createRange();
  r.selectNode(node.dom());
  var rect = r.getBoundingClientRect();
  // Clamp x,y at the bounds of the node so that the locate function has SOME chance
  var boundedX = Math.max(rect.left, Math.min(rect.right, x));
  var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));

  return ContainerPoint.locate(doc, node, boundedX, boundedY);
};

var searchFromPoint = function (doc: Element, x: number, y: number): Option<Range> {
  // elementFromPoint is defined to return null when there is no element at the point
  // This often happens when using IE10 event.y instead of event.clientY
  return Element.fromPoint(doc, x, y).bind(function (elem) {
    // used when the x,y position points to an image, or outside the bounds
    var fallback = function () {
      return EdgePoint.search(doc, elem, x);
    };

    return Traverse.children(elem).length === 0 ? fallback() :
            // if we have children, search for the right text node and then get the offset out of it
            searchTextNodes(doc, elem, x, y).orThunk(fallback);
  });
};

var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint :  // defined standard
                      document.caretRangeFromPoint ? caretRangeFromPoint :        // webkit implementation
                      searchFromPoint;                                            // fallback


var fromPoint = function (win: Window, x: number, y: number) {
  var doc = Element.fromDom(win.document);
  return availableSearch(doc, x, y).map(function (rng) {
    return Selection.range(
      Element.fromDom(rng.startContainer),
      rng.startOffset,
      Element.fromDom(rng.endContainer),
      rng.endOffset
    );
  });
};

export default {
  fromPoint
};