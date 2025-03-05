# 组件即函数

在 React 中，组件即函数（不讨论类组件）。 ——你当然知道，但你可能没意识到这意味着什么。

## 组件是 JavaScript 函数

**从语法上看，函数组件就是普通的 JavaScript 函数**，它和平时写的其他函数没有什么区别。

React 只是规定了组件函数应该接收一个 props 参数，返回 React Element。

或许是先接触了 Vue 先入为主，或者是认为函数无法实现组件的生命周期等效果，许多初学者误以为，React 把我们写的函数进行层层封装转化，注入了许多魔法，让组件能够渲染 UI，具有生命周期等等。

或者误认为，函数组件 + hooks 是类组件的语法糖，React 会把它们转成类组件。

这些理解都是错的。事实上，你写的函数就是你的组件，React 不会转化你的组件函数，也不会把它们转成类组件。React 只是执行它们，就像执行普通的 JavaScript 函数。

## 组件的渲染和更新就是函数执行

组件即函数，函数自然就是用来执行的。
React 每次渲染（首次渲染和更新），都会执行组件函数。

比如，对这个 `Timer` 组件：

```jsx
function Timer() {
  const [sec, setSec] = useState(0);

  useEffect(() => {
    let timerId = setInterval(() => {
      setSec(sec + 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  return <p>Seconds passed: {sec}</p>;
}
```

React 多次调用 `Timer()` 函数。

```js
Timer(); // 首次渲染执行，sec = 0
// 一秒后...
Timer(); // 组件更新再次执行，sec = 1
// ...
```

这里也可能存在一个误区：❌ 组件更新时，代码是“按需执行”的，只有涉及到更新的代码才会执行，这显然是错的。
即使是更新，也是执行整个函数，这是 JavaScript 的运行机制，React 可做不到只执行函数内的一部分代码。

## 利用函数特性

组件即函数，**函数组件具有 JavaScript 函数的所有特性**。
我们可以在代码中运用这些特性。

比如，JavaScript 函数可以赋值给变量，所以可以这么写：

```jsx
const iconMap = {
  win: IconWin,
  linux: IconLinux,
};

function OSIcon({ os }) {
  const Icon = iconMap[os];
  return <Icon />;
}
```

再比如，函数式编程中，函数是一等公民，可以作为参数传递，也可以作为返回值。
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

关于高阶组件，这里不深入，不理解的可以参考 [Higher-Order Components – React](https://legacy.reactjs.org/docs/higher-order-components.html)。

你也可以在函数组件中利用闭包、递归等特性。比如，用递归写一个树形结构的组件。

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

## 函数的限制

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
因为当计时开始之后，`setSec(sec + 1)` 触发组件的更新。根据上面提到的，组件每次渲染，都会执行一次函数。

```js
Timer(); // 首次渲染执行
// 一秒后
Timer(); // setSec 触发 React 对组件进行更新再次执行
```

因为`timerId`是组件内声明的变量，每次 `Timer()` 执行，都会创建一个新的 `timerId` 变量(值为`undefined`)。所以，`stopTimer` 无法正确清除计时器。

这几乎是所有 React 初学者有过的经历，组件内的变量明明被赋值了，但却又变回了初始值。
然后，他们被告知组件内的变量每次渲染都会重新创建和计算，困惑于 React 为什么设计得这么奇怪。

但事实是，这不是有意设计的，而是受限于 JavaScript 的运行机制，React 无法在多次函数执行中复用变量。

甚至不单是变量 `timerId`，每次执行，也重新声明了 `startTimer/stopTimer` 函数。
执行完成后，这些函数内的局部变量又被 JavaScript 引擎回收，在下次执行时重新创建...

正是受限于函数运行机制，在引入 hooks 之前（16.8），函数组件只能写无状态组件，有状态组件必须用 class 组件。
（Hooks 让函数组件可以有状态，是一种非常巧妙的设计，后面讲 hooks 的时候再细聊）

## 组件函数是数据到视图的映射

组件函数接收一个 props 参数，返回一段描述 UI 的 JSX。
把 props 理解成数据，JSX 理解成视图，那组件就是把数据映射成视图的函数。

组件的状态也是数据，不过来源不同，props 是从父组件传递过来的，而状态是组件自己维护的。

由此，我们可以得到一个对组件的抽象理解：

```
UI = FC(props, state)
```

理解这个有什么用呢？从我的个人经历来看，这能让我更轻松得设计和实现组件。
因为我认识到我其实是在写一个类似 `dataToUI(props, state)` 函数，我只需要把数据转成 UI 即可。

另外，从这点出发，我们不该直接在组件函数内做一些附带操作（副作用），比如，发起网络请求，修改 DOM 等，这些应该通过 useEffect 实现。

## 组件是一个工厂函数

组件函数是一个工厂函数，定义了如何生产这种组件，每次执行，都会产生一个组件实例。

举个例子，`Button` 定义了如何创建一个按钮组件，`<Button />` 是执行 `Button` 函数之后创建出来一个按钮实例（JSX 语法背后会进行函数执行）。

## renderXxx 函数 与 组件函数

比较这 3 种写法，它们有什么区别吗？

```jsx
// 写法1
function Post(props) {
  return (
    <div>
      <h1>{props.title}</h1>
      <p>{props.content}</p>
    </div>
  );
}

// 写法2
function Post(props) {
  function renderTitle() {
    return <h1>{props.title}</h1>;
  }
  function renderContent() {
    return <p>{props.content}</p>;
  }
  return (
    <div>
      {renderTitle()}
      {renderContent()}
    </div>
  );
}

// 写法3
function Post(props) {
  function Title() {
    return <h1>{props.title}</h1>;
  }
  function Content() {
    return <p>{props.content}</p>;
  }
  return (
    <div>
      <Title />
      <Content />
    </div>
  );
}
```

1 和 2 是等效的，从函数机制来说，它们必须是一样的。不过，写法 2 把渲染逻辑拆分到多个函数中，在复杂组件中可读性更好，也方便进行函数复用。

也就是说，`renderXxx` 函数是一种代码的组织方式而已，是不同于函数组件的。
我们自己写这个函数，自己调用它，React 不感知它，不能用 `<renderXxx />` 的语法使用它，它内部也不能使用 hooks。

那换个问题，写法 3 中，`<Title />` 可以写成 `Title()` 吗？——可以，这就变回写法 2 了，函数命名并不影响什么。当然，如果 `Title` 组件内使用了 hooks，就只能用 `<Title />` 了。

那说回来，哪种是推荐写法呢？写法 2 肯定是没有问题的。而写法 3 这种嵌套组件声明的写法是应该尽量避免的，因为内层组件会发生状态无法保持的情况，容易导致 bug。

不过，可以的话，组件的写法当然是最推荐的。

```jsx
function Post(props) {
  return (
    <div>
      <Title title={props.title} />
      <Content content={props.content} />
    </div>
  );
}
// 把组件提到最外层
function Title(props) {
  return <h1>{props.title}</h1>;
}

function Content(props) {
  return <p>{props.content}</p>;
}
```

把组件提到最外层了，但相应的，没法直接读取外层组件的变量了，需要手动传递 props。

最后，renderXxx 函数最常见的常见，还是把它作为 prop，让外层组件来决定如何渲染。

## 总结

- 组件语法上是 JavaScript 函数。
- React 不会改变你的组件函数。
- 组件每次渲染，都会执行组件函数。
- 可以在代码中运用函数的特性编写组件。
- 按 JavaScript 运行机制，每次更新，组件内的变量/函数都会重新创建，结束后被回收。
- `renderXxx` 是一种代码组织方式，不是组件，内部不能使用 hooks。
