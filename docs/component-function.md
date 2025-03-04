# 理解组件函数

在 React 中，组件即函数（不讨论类组件）。

-- 你当然知道，但你可能不知道这意味着什么。

## 组件是 JavaScript 函数

初学者普遍存在的误区是：React 把我们写组件进行层层封装转化，注入了许多魔法，让组件能够渲染 UI，具有生命周期等等。

但事实上，组件就是普通的 JavaScript 函数。
React 确实通过 hooks 注入了一些魔法，但是，从语法上，组件就是函数。

这意味着，**函数组件具有 JavaScript 函数的所有特性**。

比如，利用函数式编程：函数是一等公民，组件可以作为参数传递，也可以作为返回值。
高阶组件（Higher-Order Components, HOC）就是这么玩的，高阶组件接收一个组件，返回一个新的组件（接收一个函数，返回一个新函数）。

```jsx
function WithStyle(Component, styles) {
  return function ComponentWithStyle(props) {
    return <Component {...props} style={styles} />;
  };
}

// LongButton 是一个新的组件
const LongButton = WithStyle(Button, { display: "block" });
```

关于高阶组件，可以参考 [Higher-Order Components – React](https://legacy.reactjs.org/docs/higher-order-components.html)

你也可以在函数组件中利用闭包、递归等特性。比如用递归写一个树形结构的组件。

```jsx
function UnorderedList({ list }) {
  if (!list) return null;

  return (
    <ul>
      {list.map((item) => (
        <li key={item.id}>
          {item.value}
          <UnorderedList list={item.children} />
        </li>
      ))}
    </ul>
  );
}
```

反过来，**函数组件也受到 JavaScript 函数的限制**。

看下面这段代码，你能发现问题吗？

```jsx
function Timer() {
  let timerId;
  const [sec, setSec] = useState(0);

  function startTimer() {
    timerId = setInterval(() => {
      setSec(sec + 1);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerId);
  }

  return (
    <div>
      <p>Seconds passed: {sec}</p>
      <button onClick={startTimer}>开始计时</button>
      <button onClick={stopTimer}>停止计时</button>
    </div>
  );
}
```

上例中，计时器无法正常停止。
因为当计时开始之后，`setSec(sec + 1)` 会触发组件的更新。
React 是如何更新组件的呢？-- 再把组件函数执行一遍。

```js
Timer(); // 首次渲染执行
// 一秒后
Timer(); // setSec 触发 React 对组件进行更新再次执行
```

从 JavaScript 的运行机制来看，每次 `Timer()` 执行，都会创建一个新的 `timerId` 变量(值为`undefined`)。所以，`stopTimer` 无法正确清除计时器。

这几乎是所有 React 初学者有过的经历，组件内的变量明明被赋值了，但却又变回了初始值。
然后，他们被告知组件内的变量每次渲染都会重新创建和计算，然后困惑于 React 为什么设计得这么奇怪。

但事实是，这不是有意设计的，而是受限于 JavaScript 的运行机制，React 无法在多次函数执行中复用变量。

每次执行 `Timer()`，变量 `timerId`、函数 `startTimer/stopTimer` 都会被重新声明，执行完成后，又被 JavaScript 引擎回收。

正是因为这些限制，在引入 hooks 之前（16.8），函数组件只能写无状态组件，有状态组件必须用 class 组件。
