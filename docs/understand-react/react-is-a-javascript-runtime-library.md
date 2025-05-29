# React 是一个运行时 JavaScript 库

大家都说 “React 框架”，很多初学者认为，既然是框架，那就是庞大而复杂的。
但是，React 其实只是一个 JavaScript 库，它的基本功能和原理十分简单。

React 官方介绍是：

> React is a JavaScript library for building user interfaces.
>
> React 是一个用于构建用户界面的 JavaScript 库。

我们就从这句话开始，来重新理解 React。

## 一切都是运行时 JavaScript

当使用 React 时，一切都是 JavaScript，我们写的组件是，React、JSX、Hooks 也都是 JavaScript 代码。
这些代码，都遵循 JavaScript 的语法、执行规则。

另外需要强调的是，React 是运行时的，意味着，它不会也没有办法去分析你的代码，写代码的时候，和 React 的交互就是：

1. 你提供组件函数给 React 执行。
2. React 提供 API 给你调用，包括 `root.render`、`createContext`、`useState` 等。

**我们写的代码就是最终执行的代码**，整个过程是没有任何代码转化的（除了 JSX），这和我们调用 `lodash` 等 JavaScript 工具是类似的。

你现在可能不太理解这句话的含义，接下来看几个具体的现象和解释吧。

## React 是如何工作的

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

1. 编写组件。组件其实就是 JavaScript 函数，接收一个 `props` 参数，返回 JSX(ReactElement 对象)。因为组件函数最终由 React 调用的，需要约定格式。
2. 我们调用 `root.render` 告诉 React 在指定节点上渲染组件。
3. React 根据传入的 JSX，调用 `App({name: 'World'})`，得到 `<h1>Hello, World!</h1>`。
4. React 通过 DOM 操作（`appendChild`）把 `<h1>Hello, World!</h1>` 渲染到页面上。

<Tip>

JSX 也是 JavaScript 语法，`<type {...props}>{children}</type>` 等效于 `createElement(type, props, ...children)`。

</Tip>

<!-- TODO: link for code demo -->

这样看，看着是不是很简单？你自己三两下就可以写一个类似的工具库。

## 从 JavaScript 看 React

### 函数组件是类组件的语法糖？

在不少地方看过把 Hooks 看成是组件的生命周期函数，甚至误以为函数组件和 Hooks 的写法是类组件的语法糖。
虽然这二者能实现很多相同的效果，但作为一个运行时的 JavaScript 库，React 是没有能力把一个组件函数转化成类组件的。

事实上，这二者在组件生命周期上是有很大不同的。

- 类组件会用`new`进行实例化，并在各个节点调用对应的生命周期函数。
- 函数组件则是执行组件函数，通过 Hooks 收集状态和副作用，在合适的时机应用。

现在你不懂没关系，你只需要知道它们是不同的实现路径即可。

###

### 从 JavaScript 角度看 React

- 引用官方介绍：React is a JavaScript library for building user interfaces.
-
- 展开强调**运行时**:
  - React 只能执行代码，不能分析、修改代码。
  - react 库、我们写的组件代码都是 JavaScript 代码，遵循 JavaScript 语法、执行规则。
- 用运行时 JavaScript 解释一些概念和现象：
  - 解释 react 的基本工作原理
  - 为什么我们说 react 更灵活
  - 组件内的变量每次都会重新声明
  - HOC
  - 返回不同的 JSX，组件状态不会重置
