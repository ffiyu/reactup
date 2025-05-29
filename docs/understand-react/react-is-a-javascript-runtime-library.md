# React 是一个运行时 JavaScript 库

大家都说 “React 框架”，很多初学者认为，既然是框架，那就是庞大而复杂的。
但是，React 其实只是一个 JavaScript 库，它的基本功能和原理十分简单。

React 官方介绍是：

> React is a JavaScript library for building user interfaces.
>
> React 是一个用于构建用户界面的 JavaScript 库。

我们就从这句话开始，来重新理解 React。

## 一切都是运行时 JavaScript

当使用 React 时，一切都是 JavaScript，组件、JSX、Hooks 等都是 JavaScript 代码，它们都遵循 JavaScript 的语法和执行规则。

需要强调的一点是，**React 是运行时的**。意味着，它不会也没有办法去分析你的代码。使用 React 的过程是这样的：

1. 你提供组件函数给 React 执行。
2. React 提供 API 给你调用，包括 `root.render`、`createContext`、`useState` 等。

**我们写的代码就是最终执行的代码**，整个过程是没有任何代码转化的（JSX 另谈），这和我们调用 `lodash` 等 JavaScript 工具是类似的。学习 React 的第一步就是对它祛魅，把它当做一个普通的三方库来理解。

你现在可能不太理解为什么强调 React 是 JavaScript 库，接下来看几个具体的现象和解释吧。

## 从 JavaScript 看 React

### React 是如何工作的

让我们先来理解这个 JavaScript 库做了什么。

```js
import React from "react";
import ReactDOM from "react-dom/client";

function App(props) {
  const { name } = props;
  return <h1>Hello, {name}!</h1>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App name={"World"} />);
```

1. 编写组件。组件其实就是 JavaScript 函数，接收一个 `props` 参数，返回 JSX。因为组件函数是由 React 调用的，需要约定格式。
2. 我们调用 `root.render` 告诉 React 在指定节点上渲染组件。
3. React 根据传入的 JSX，调用 `App({name: 'World'})`，得到 `<h1>Hello, World!</h1>`。
4. React 通过 DOM 操作（`appendChild`）把 `<h1>Hello, World!</h1>` 渲染到页面上。

<Tip>

JSX 语法 `<type {...props}>{children}</type>` 等效于 `createElement(type, props, ...children)`，可以看做 JavaScript 语法，本文都这么认为。

</Tip>

<!-- TODO: link for code demo -->

这样看，看着是不是很简单？你自己三两下就可以写一个类似的工具库。

### 为什么组件不能这样写？

看这个组件：

```js
function Counter() {
  const count = 0;

  function handleClick() {
    count++;
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}> +1 </button>
    </div>
  );
}
```

你肯定知道它是有问题的，但你有没有想过，这个代码看起来挺优雅的，React 为什么不这么设计？

答案是做不到，因为 React 是建立在 JavaScript 上的。分析一下，`Counter` 是一个 JavaScript 函数，React 是运行时的，没办法分析它的代码，只能调用它，根本无法知道它具有内部变量 `count`，也无法知道 `handleClick` 更新了它，自然也就没有办法更新组件了，React 只能拿到它的返回值。

### 理解 Hooks

上面的 `Counter` 组件无法正常工作，因为 React 无法感知函数内部的局部变量及其变化，`useState` 就是用来解决这个问题的。

`useState` 是 React 提供的函数，它的作用包括：

1. 返回了一个组件内部状态变量。
2. React 会帮我们记住这个变量的值，保证后续调用组件函数的时候，如果没有更新过，就返回原来的值，如果更新过，就返回更新后的值。
3. 一个 setter 函数，用于更新状态变量，并触发组件重新渲染。

根据这个功能，相信你也能写一个类似的 `useState` 函数吧。

<!-- TODO：link -->

再说说 `useCallback`，普通情况下：

```js
function FC() {
  function onClick() {
    //...
  }
}
```

从 JavaScript 函数运行机制看，每次调用 `FC` 时，都会重新声明 `onClick` 函数，如果我们不希望重复声明，就可以使用 `useCallback`。这不是 React 有意这么设计，而是 JavaScript 的规则。

还记得 hooks 的规则吗？Hooks 只能在组件函数顶层调用。为什么 React 会这么要求？

原因还是 JavaScript。以 `useState` 为例，React 无法通过分析代码来确定状态属于哪个组件，而是`useState`在被执行时，把它关联到当前正在操作中的组件节点，如果 `useState` 不是在组件进行操作的过程中被执行的，React 就无能为力了。

###

<!--
TODO: move to rules of hooks
还有，顺序也是必须的。假设在某个组件的多次渲染中出现下面这种情况
```js
// 某次组件调用中
const [a, setA] = useState(0);
const [b, setB] = useState(0);
// ...
// 在后来的某个调用中
const [b, setB] = useState(0);
const [a, setA] = useState(0);
```
在你看来，变量名很清楚，`a` 就是 `a`，`b` 就是 `b`，但实际上，React 并不知道这是同一个变量，它会认为这是两个不同的变量，所以会报错。 -->

### 理解高阶组件

高阶组件（HOC）是一个函数，它接收一个组件作为参数，返回一个新的组件。

```js
// 这个 HOC 可以让组件支持 loading 状态
function withLoading(wrappedComponent) {
  return function EnhancedComponent(props) {
    const { loading, ...restProps } = props;

    if (loading) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
}

// 使用
const LoadableCard = withLoading(Card);
```

可以看出来，HOC 不是什么 React 功能，它是开发者对 JavaScript 函数式编程的一种应用：通过一个函数，把传入的函数进行包装，返回一个新的函数（通常在原函数的基础上增加某个特定功能），我们把这个转化函数称为高阶函数，所以你知道为啥叫高阶组件了吧。

对 React 来说，它不关注也没办法感知组件是纯手写的，还是通过函数式编程创建的，只要能正常调用和返回就可以了。

### 为什么说 React 很灵活？

在和其他框架的对比中，你一定听说过 React 更灵活，先不论它是否正确，我们来解释为什么大家会这么说。

因为 React 代码就是纯粹的 JavaScript 代码，你可以在代码中灵活运用各种 JavaScript 特性，包括函数式编程、闭包、递归等，上面的高阶组件就体现了这点。

再举个例子，假如要实现一个可自定义组件的 UI 套件，可以这样写：

```js
const UIKit = {};

// 外部可通过该函数自定义组件
export function registerComponent(name, component) {
  UIKit[name] = component;
}

// 内部设置默认组件
registerComponent("Button", () => {
  return <button>Click me</button>;
});

// 使用
<UIKit.Button />;
```

简单但有效，这就是 React 的魅力：用 JavaScript 构建界面。用 React 其实很考验一个人的 JavaScript 功底，一个 React 高手一定也是一个 JavaScript 高手。

### 函数组件是类组件的语法糖？

在不少地方看过把 Hooks 看成是组件的生命周期函数，有人甚至误以为函数组件 + Hooks 的写法是类组件的语法糖。
虽然这二者能实现很多相同的效果，但作为一个运行时的 JavaScript 库，React 是没有能力把一个组件函数转化成类组件的。

事实上，这二者在组件生命周期上是有很大不同的：

- 类组件会用 `new` 进行实例化，并在各个节点调用对应的生命周期函数。
- 函数组件则是执行组件函数，通过 Hooks 收集状态和副作用，在合适的时机应用。

现在你不太懂没关系，你只需要知道它们是不同的实现路径即可。

## 和其他框架对比

你可能会说，Vue 也是 JavaScript 框架。

```js
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

<div id="app">{{ message }}</div>

<script>
  const { createApp, ref } = Vue

  createApp({
    setup() {
      const message = ref('Hello vue!')
      return {
        message
      }
    }
  }).mount('#app')
</script>
```

按我的理解，Vue 组件是 JavaScript + 视图模板，模板 `<div id="app">{{ message }}</div>` 在语法上是字符串，Vue 会根据约定的语法在运行时进行解析（包括指令、变量值等），同时进行数据双向绑定，然后再渲染。

字符串模板加解析的策略能更精准确定数据和视图的关系，做到更好的按需更新 DOM 节点。但是字符串的模板，对需要解析和修改组件视图的场景很不友好，一直在灵活性上被 diss，所以 Vue3 也支持了 JSX 语法。

而 Svelte 则是需要预先编译的框架，代码会经过编译转化成 JavaScript，然后再运行。

像 Vue 一样运行时解析，或像 Svelte 提前编译，它们都可以实现自己的语法，一定程度上摆脱 JavaScript 的限制。但 React 不一样，它没有自创语法，没有代码转化过程，只是用 JavaScript 实现了功能。认识这点，才能更好地理解 React。

## React Compiler

然而，v19 版本开始，React 也在眼馋预编译的好处了，引入了 [React Compiler](https://react.dev/learn/react-compiler)，从官方介绍来看，现阶段主要自动应用缓存（memorize），即不用手动 `useMemo/React.memo`，从而提升性能。但现在应该很少项目会用它。

## 结语

本文想强调的只有一个点：React 是一个运行时 JavaScript 库。React 是建立在 JavaScript 上的，受限于 JavaScript 的运行机制，也能运用 JavaScript 的语言特性。

理解了这点，能解释很多 React 的设计和原理，更好地运用 React。在后续的章节中，也会经常提到这个点。
