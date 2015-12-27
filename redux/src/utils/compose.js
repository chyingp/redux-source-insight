/**
 * Composes single-argument functions from right to left.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing functions from right to
 * left. For example, compose(f, g, h) is identical to arg => f(g(h(arg))).
 */
export default function compose(...funcs) {
  return arg => funcs.reduceRight((composed, f) => f(composed), arg);
}

// dispatch = compose(...chain)(store.dispatch);
//
//"use strict";
//
//function compose(...funcs) {
//  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
//    funcs[_key] = arguments[_key];
//  }
//
//  // store.dispatch
//  return function (dispatch) {
//    return funcs.reduceRight(function (composed, f) {
//      return f(composed);
//    }, dispatch);
//  };
//}
//
//function (next) {
//  return function (action) {
//
//  }
//}