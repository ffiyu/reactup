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
Hooks 让函数组件可以有状态，是一种非常巧妙的设计，后面讲 hooks 的时候再细聊。

认识到组件的本身是 JavaScript 函数，这一点十分重要，能帮助我们理解许多 React 的设计，尤其是 hooks，所以，后续会多次提到这点。

## 不要从类组件的角度理解函数组件

另一个常见的误区是：函数组件+hooks 是 类组件的语法糖，React 会把函数组件和 hooks 转成类组件。
——这是错误的，**类组件和函数组件是两种完全不同的语法**，这两种写法可以写出表现相同的组件，但语法上是不一样的，运行的机制也有所区别，更不会把函数组件转成类组件。

函数组件+hooks 是推荐的写法，能覆盖 99%的场景。我们默认也不会讨论类组件的情况。

## 组件函数是数据到视图的映射

组件函数接收一个 props 参数，返回一段描述 UI 的 JSX。
把 props 理解成数据，JSX 理解成视图，那组件就是把数据映射成视图的函数，UI=FC(data)。

有了这层抽象理解，编写组件函数的过程，其实就是在把数据转化成 UI 的过程。

##
