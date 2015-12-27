import compose from './compose';

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
/*
  从调用方法 applyMiddleware(...middlewares)(Redux.createStore) 可以看出
  next 参数实际上是 Redux.createStore. 而 Redux.createStore 的调用方式为 Redux.createStore(reducer, initialState)
  所以 applyMiddleware(...middlewares)
  1. 参数: Redux.createStore
  2. 返回值:一个function, 跟 Redux.createStore 接受的参数一样

 */
export default function applyMiddleware(...middlewares) {
  return (next) => (reducer, initialState) => {
    // 内部先创建一个store (相当于直接调用 Redux.createStore(reducer, initialState))
    var store = next(reducer, initialState);
    // 保存最初始的store.dispatch
    var dispatch = store.dispatch;
    var chain = [];

    var middlewareAPI = {
      getState: store.getState,
      // 最后面, dispatch 被覆盖, 变成包装后的 dispatch 方法
      dispatch: (action) => dispatch(action)
    };
    // 返回一个数组
    // 贴个例子在这里做参考,redux-thunk
    // function thunkMiddleware(store) {
    //  var dispatch = store.dispatch;
    //  var getState = store.getState;
    //
    //  这里的next其实就是dispatch
    //  return function (next) {
    //    return function (action) {
    //      return typeof action === 'function' ? action(dispatch, getState) : next(action);
    //    };
    //  };
    //}
    /*
      chain 是个数组, 参考上面的 middlleware (redux-thunk),可以看到,chain的每个元素为如下形式的function
      并且, 传入的 store.getState 为原始的 store.getState,而 dispatch则是包装后的 dispatch(不是原始的store.dispatch)
      似乎是为了确保, 在每个middleware里调用 dispatch(action), 最终都是 用原始的 store.dispatch(action)
      避免 store.dispatch 被覆盖, 导致middleware 顺序调用的过程中, store.dispatch的值变化 --> store.dispatch 返回的值可能会有不同
      违背 redux 的设计理念

      这里的 next 则为 原始的 store.dispatch (见下面 compose(...chain)(store.dispatch) )
      function (next) {
        return function (action) {

        }
      }
     */
    chain = middlewares.map(middleware => middleware(middlewareAPI));

    // compose(...chain)(store.dispatch) 返回了一个function
    // 伪代码如下,
    // function (action) {
    //   middleware(store)(store.dispatch);
    // }
    dispatch = compose(...chain)(store.dispatch);  // 从右到左, middleware1( middleware2( middleware3(dispatch) ) )

    // 于是,最终调用 applyMiddleware(...middlewares)(Redux.createStore)
    // 返回的 store, getState,subscribe 方法都是原始的那个 store.getState, store.subscribe
    // 至于dispatch是封装过的
    return {
      ...store,
      dispatch
    };
  };
}
