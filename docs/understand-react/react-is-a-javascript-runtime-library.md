# React 是一个运行时 JavaScript 库

大家都说 “React 框架”，很多初学者认为，既然是框架，那就是庞大而复杂的。
但是，React 其实只是一个 JavaScript 库，它的基本功能和原理十分简单。

React 官方介绍是：

> React is a JavaScript library for building user interfaces.
>
> React 是一个用于构建用户界面的 JavaScript 库。

我们就从这句话开始，来重新理解 React。

## 一切都是 JavaScript

当使用 React 时，一切都是 JavaScript，我们写的组件是，React、JSX、Hooks 也都是 JavaScript 代码。
这些代码，都遵循 JavaScript 的语法、执行规则。

你现在可能不太理解这句话的含义，看完本文，你就明白了。

## React 是如何工作的

所以，让我们从 JavaScript 的角度，来理解 React 的工作原理。

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

1. 编写组件。组件其实就是 JavaScript 函数，接收一个 `props` 参数，返回 JSX(ReactElement 对象)。
2. 调用 `root.render` 告诉 React 在指定节点上渲染组件。
3. 根据传入的 JSX，React 调用 `App({name: 'World'})`，得到 `<h1>Hello, World!</h1>`。
4. React 通过 DOM 操作（`appendChild`）把 `<h1>Hello, World!</h1>` 渲染到页面上。

<Tip>

如果 JSX 不容易理解，你可以替换成 `createElement(type, props, ...children)`。

</Tip>

这样看，看着是不是很简单？你自己三两下就可以写一个类似的工具库。

<details>
    <summary>点击查看实例实现</summary>

    ```js
    function createElement(type, props, ...children) {
      return {
        type,
        props: {
          ...props,
          children: children.map(child =>
            typeof child === "object" ? child : createTextElement(child)
          ),
        },
      }
    }

    function render(container,element){
        if(typeof element.type === "function" ){

        }
    }

    function createRoot(container) {
      return {
        render(element) {

          container.appendChild(element);
        },
      };
    }
    ```

</details>

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
