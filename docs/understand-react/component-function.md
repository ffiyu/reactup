# 函数组件：既是组件，也是函数

前面说过，React 是一个 JavaScript 库。现在，我们从组件上，展开说说。

## 组件函数的格式

函数组件，从语法上看，就是 JavaScript 函数。形如：

```js
// 从 React 19开始，支持直接传入第二个参数 `ref`，不需要 `forwardRef`
function FC(props, ref) {
  // ...
  return <>...</>;
}
```

有这个格式要求，是因为组件函数是由 React 帮我们调用的。

```jsx
// 我们使用组件时
<Button onClick={handler}>Click Me</Button>;

// React 内部会调用组件函数，获取它的返回值
const ele = Button({ onClick: handler, children: "Click Me" }, ref);
```

除此之外，组件函数和其他函数是一样的。

## 组件渲染与函数执行

函数就是用来调用的，组件函数也是一样。

React 每次渲染（首次渲染和更新）组件的过程中，都会调用执行组件函数，获取它返回的 JSX，构建最新展示的 UI。

比如，对这个 `Counter` 组件：

```jsx
function Counter(props) {
  const step = props.step || 1;

  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + step);
  }

  // return (
  //   <div>
  //     <div>Count: {count}</div>
  //     <button onClick={handleClick}> + </button>
  //   </div>
  // )
  return createElement(
    "div",
    {},
    createElement("div", {}, `Count: ${count}`),
    createElement("button", { onClick: handleClick }, ` + `)
  );
}
```

为了更容易理解，我们用 `createElement` 替代 JSX。

使用 `<Counter />` 组件时，React 通过多次调用 `Counter()` 函数，来渲染和更新视图。

```js
Counter(); // 首次渲染执行，useState 返回 count = 0
// 点击 button 后更新，设置 count 状态为 1
Counter(); // 函数再次执行，useState 返回 count = 1
```

注意，**每次 React 更新视图，都必须调用组件函数**，React 没有其他方式更新视图。除非你通过 `useEffect` 等其他方式手动操作 DOM。

## 分析一下组件函数的执行

让我们深入一点扒扒组件函数的运行过程。

如果使用组件 `<Counter step={2} />`，就会执行 `Counter({step:2})`，从 JavaScript 函数角度看，会发生什么？

1. 声明并初始化局部变量 `step = 2`。
2. 创建局部变量 `count`、`setCount`，调用 `useState(0)`，React 发现是第一次调用，所以返回初始值`0`和一个更新函数。
3. 声明了内部函数 `handleClick`，它被绑定到返回的对象上。
4. 调用 `createElement` 创建并最终返回一个 ReactElement 对象，它有两个子节点，也都是 ReactElement 对象。

函数执行完成之后：

- `step`、`count` 作为函数内的局部基本类型变量，是按值拷贝的，一旦函数执行结束，变量生命周期就结束了，等待被回收。
- `setCount`、`handleClick` 作为函数，而且返回值引用到了它们，所以它们还可以继续存在，等待响应点击事件。

当点击事件触发后， `handleClick -> setCount(0+2) -> React 更新组件 -> 再次执行 Counter({step:2})`。

我们都知道，JavaScript 函数多次调用之间是没有关系的，第二次调用还是重复第一次的工作，创建局部变量和函数、调用 `useState(0)`、创建并返回 ReactElement。

注意，第二次调用创建的局部变量和函数，和第一次调用过程创建的是完全没联系的，它们是全新的局部变量，返回的 ReactElement 对象也是完全不同的了。

不过，第二次调用过程中，当执行 `useState(0)` 时，React 会发现这不是这个组件第一次在这个位置调用`useState`了，这是一次组件更新，React 会忽略初始值 `0`（入参），而是返回最新的状态值 `2`，即`count=2`。相应地，其他引用 `count` 的函数也会更新，比如这次声明的 `handleClick` 函数是：

```js
function handleClick() {
  // count=2,step=2
  setCount(2 + 2);
}
```

然后，新的 `handleClick` 绑定到新创建的 ReactElement 对象上，一起返回。

因为已经有了全新的局部变量和 ReactElement 对象，所以上一次执行中还未回收的所有变量、函数、ReactElement 对象，都可以被回收了。

等等等等，好像不对吧，组件不是按需更新吗？这怎么全都更新了？

首先，以上的代码执行分析肯定是没错的。函数组件内的所有变量、函数、返回的 ReactElement 都是即时创建即时销毁的，前后没有复用。

我们说的按需更新，是指 浏览器 DOM 节点，ReactElement 只是一个轻量 JavaScript 对象，还要转成虚拟 DOM 再转成浏览器 DOM。所以这并不矛盾，**ReactElement 是每次渲染过程都会新建的，而 浏览器 DOM 节点是按需更新的**。

最后，需要注意的是，浏览器 button 元素（真实 DOM）的 `onclick` 确实是需要每次渲染后重新绑定的，因为前后两次的 `handleClick` 是不同的函数，第一次是 `setCount(0+2)`，第二次是 `setCount(2+2)`，如果不更新，那 `onclick` 绑定的函数就会一直是 `setCount(2)`，无法持续增加计数值。

如果你之前没理解这点，可能会觉得非常反直觉，但事实就是如此，React 并没有你想的那么聪明，但从 JavaScript 的角度看，这才是符合代码规则的。

## 代码组织不会影响组件渲染

我们把 `Counter` 组件的代码改写一下：

```jsx
function Counter(props) {
  const step = props.step || 1;

  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + step);
  }

  function renderValue() {
    return <div>Count: {count}</div>;
  }

  function renderAction() {
    return <button onClick={handleClick}> + </button>;
  }

  return (
    <div>
      {renderValue()}
      {renderAction()}
    </div>
  );
}
```

这个组件和刚刚的组件一样吗？

对 React 来说，完全一样，还是那句话，React 只能执行组件函数，完全不知道你代码是怎么写的，它只能拿到你返回的 ReactElement，根据它去渲染 UI。组件函数的代码如何组织，ReactElement 如何创建出来的，React 并不知道。

对开发人员来说，在大型组件中，用 `renderXxx` 函数组织代码，可以让组件代码变得更清晰，甚至能提取到组件外部，实现代码复用。所以这是一种常见的 React 代码模式。（名称其实无所谓，只是习惯 render 开头）

还有一种常见的变体，把 `renderXxx` 作为 prop，支持在使用组件时自定义组件中某部分内容的展示：

```jsx
function defaultCountRenderer(count) {
  return <div>Count: {count}</div>;
}

function Counter(props) {
  const { step = 1, renderCount = defaultCountRenderer } = props;
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count + step);
  }
  return (
    <div>
      {renderCount(count)}
      <button onClick={handleClick}> + </button>
    </div>
  );
}
```

这些都是纯粹的 JavaScript 代码组织方式，其实和 React 没有什么关系，React 上许多玩出花的操作，都是对 JavaScript 的运用。

## 组件内的函数执行和声明

这两种 `useState` 用法：

```jsx
function FC() {
  function getInitialState() {
    // 计算并返回值
  }
  // （1）
  const [state, setState] = useState(getInitialState());
  // 或者
  // （2）
  const [state, setState] = useState(getInitialState);
  // ...
}
```

它们都是有效的，那有什么区别吗？

回答这个问题，同样要用 JavaScript 来分析。第一种用法相当于：

```jsx
function FC() {
  const initialValue = getInitialState();
  const [state, setState] = useState(initialValue);
}
```

所以，当每次执行`FC()`时，`getInitialState()`都会执行。

而第二种用法`useState(getInitialState)`，把函数作为值传递给 `useState`，并没有直接调用，`useState` 内部只在首次渲染时执行 `getInitialState()` 作为初始值，后续会直接忽略它。

也就是说，用法（1）中，`getInitialState` 会在每次渲染时声明并执行；而用法（2）中，`getInitialState` 只会在首次渲染时执行，重新渲染时，只是声明了函数，并没有执行。

很多情况下这个区别无关紧要，但是，如果 `getInitialState` 存在大量的计算，可能就会有明显的性能差异了。不管函数体内有多复杂的计算，函数声明的开销都是很小的，所以用法（2）会更好。

用这个例子，主要想说，**组件内声明一个函数和执行一个函数是有很大区别的**。

在组件中，有很多情况与用法（2）类似，组件每次都对声明函数，但是实际由 hook 决定会不会执行。

```jsx
function FC() {
  useEffect(() => {}, []);
  const memorized = useMemo(() => {}, []);
  const cb = useCallback(() => {}, []);
  // ...
}

// 真面目
function FC() {
  const f1 = () => {};
  useEffect(f1, []);
  const f2 = () => {};
  const memorized = useMemo(f2, []);
  const f3 = () => {};
  const cb = useCallback(f3, []);
}
```

是的，使用这些 hook 时，你的组件会在每次渲染时，声明一个新的函数，然后传给 hook，hook 的功能会决定这个函数后续是否执行。也就是说，函数声明每次都存在，但最终会被执行还是会被忽略，就取决于 hook 的功能了。

事件响应函数是另一类经常在组件中声明的函数，在事件触发时执行，每次组件渲染时，它们也同样会每次重新被声明，然后替换掉之前旧的函数。

## 结语

函数组件，既是组件，也是函数。

- 组件体现在它能写成 `JSX` 语法，由 React 调用执行，渲染 UI。
- 而从语法和运行逻辑上，则是普通的 JavaScript 函数，要学会运用你的 JavaScript 知识分析你的组件代码，可以看看最后的两个思考题。

## 思考题

### 1. 修复这个计时器组件

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

### 2. 无法正常输入的 Input 组件

```jsx
import { useState } from "react";

export default function App() {
  const [inputValue, setInputValue] = useState("");

  function Input(props) {
    const [value, setValue] = useState("");
    function handleChange(e) {
      const v = e.target.value;
      setValue(v);
      setInputValue(v);
    }
    return <input value={value} onChange={handleChange}></input>;
  }

  return (
    <div>
      <Input />
      <div>你的输入：{inputValue}</div>
    </div>
  );
}
```
