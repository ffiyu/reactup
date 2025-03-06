# JSX 与 React Element

前面说，组件即函数，现在，我们来看看组件函数的返回值：JSX。

## JSX 是 createElement 的语法糖

JSX 是 `React.createElement` 的语法糖。

```jsx
export default function Post(props) {
  const { title, content } = props;
  return (
    <div className="post">
      <h1 className="post-title">{title}</h1>
      <p className="post-content">{content}</p>
    </div>
  );
}
```

等价于：

```jsx
import React from "react";

export default function Post(props) {
  const { title, content } = props;
  return React.createElement(
    "div",
    { className: "post" },
    React.createElement("h1", { className: "post-title" }, title),
    React.createElement("p", { className: "post-content" }, content)
  );
}
```

React 在文档中也提到，可以不使用 JSX 语法，直接使用 `React.createElement`。不过，没有人手敲代码时这么做，只有工具生成的代码才会直接输出成 `React.createElement`，省去二次编译转化过程。

## JSX 的编译转化

JSX 是 JavaScript 的拓展语法，无法在浏览器中运行，需要通过 Babel 等工具进行编译转化。

[Babel 在线工具](https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=KYDwDg9gTgLgBAE2AMwIYFcA29noHYDGMAlhHnAAoQDOMAFGFBGNQJRwDeAUHHAWbU5wSMTMAA0fMjGB54AXzgBeOI2bUA3Fx5wowGOijk6O3gB4ExAG4A-U7zhmAFgEYbHEWPlmA9K7sODmZg7vxysjDePiH2vpa2Oqxa8kA&debug=false&forceAllTransforms=false&modules=false&shippedProposals=false&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=react&prettier=false&targets=&version=7.26.9&externalPlugins=&assumptions=%7B%7D) 能看到编译后的结果。

对上面的例子，得到的结果是：

```js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Post(props) {
  const { title, content } = props;
  return /*#__PURE__*/ _jsxs("div", {
    className: "post",
    children: [
      /*#__PURE__*/ _jsx("h1", {
        className: "post-title",
        children: title,
      }),
      /*#__PURE__*/ _jsx("p", {
        className: "post-content",
        children: content,
      }),
    ],
  });
}
```

可以看到，这里做了两步转化：

1. 自动从 `react` 中引入 `jsx/jsxs` 函数。
2. 把 JSX 语法转化为 `jsx/jsxs` 函数调用。

`jsx/jsxs` 函数的功能和 `React.createElement` 类似，都是创建并返回 React 元素（Element）对象。

顺便一提，在 React 17 之前，JSX 是直接编译成 `React.createElement` 的。

```js
export default function Post(props) {
  const { title, content } = props;
  return React.createElement(
    "div",
    { className: "post" },
    React.createElement("h1", { className: "post-title" }, title),
    React.createElement("p", { className: "post-content" }, content)
  );
}
```

注意，此时并没有自动引入 `React`，需要我们自己手动引入，否则运行时会报错找不到 React，用过 React 16 的同学应该都遇到过这个问题。

## React 元素对象

无论是`jsx/jsxs(...)`,还是 `React.createElement(...)`，结果都是 React 元素对象。
它的主要结构如下：

```js
{
  // 元素的类型。
  // html节点时，是字符串，比如 "div";
  // 自定义组件时，是函数或类的引用
  type: type,
  props: object, // 组件props，包括 children 属性
  //...（其他我们不关注的属性）
}
```

比如，

```jsx
<Post title={"Hello World"} content={"This is a post."} />
// 对应的元素对象大概长这样：
{
  type: Post,
  props: {
    title: 'Hello World',
    content: 'This is a post.',
  }
}

<h1>Hello World</h1>
// 对应的元素对象大概长这样：
{
  $$typeof: Symbol(react.element),
  type: 'h1',
  props: {
    children: ['Hello World'],
  }
}
```

这个就是我们经常听到的虚拟 DOM 节点了。React 元素对象有两个特点：

- **轻量**。相对浏览器 DOM，它的体积很小，创建和其他操作的成本更小。
- **不可变**。元素一旦创建，就不能再修改，随意修改元素会导致虚拟 DOM 比对算法失效

现在，我们知道了: **一段 JSX 就是一个 React 元素对象**。

以后看 JSX 语法时，就可以把它看成是一个对象，语法上，除了无法修改，和普通的 JavaScript 对象一样，可以赋值、传参、返回等。

元素无法修改，不过，`React.cloneElement(element, props, ...children)` 可以复制一个相同类型，但不同 props 的元素，有时候会用到。

## React 元素与渲染过程

前面说，JSX 创建了元素对象，但是，元素只是通过 `type` 属性保存了组件函数，**组件函数并没有在这个过程中被执行**。也就是说，`<Post />` 没有执行 `Post()` 函数。

你可能会奇怪，如果这个过程没有执行，那会在什么时候执行？答案是，在渲染时。具体点，**如果组件函数返回了元素，那 React 在渲染时，就会执行元素对应的组件函数**。

举个例子：

```jsx
import { createRoot } from "react-dom/client";

function App() {
  return <Post title="Hello World" content="This is a post." />;
}

createRoot(document.getElementById("root")).render(<App />);
```

我们已经知道，`<App />` 等效于 `{type:App,...}`，所以，整个 render 过程就是：

1. 执行 `render({type:App,...})`
2. 调用 `App()`，得到 `<Post />`，即 `{type:Post,...}`
3. 执行 `render({type:Post,...})`
4. 调用 `Post({title:'Hello World',content:'This is a post.'})`，得到 `<div className="post"><h1 className="post-title">Hello World</h1><p className="post-content">This is a post.</p></div>`
5. 执行 `render({type:'div',props:{children:[{type:'h1',...},{type:'p',...]}})`，创建对应的浏览器 DOM 节点
6. 挂载浏览器 DOM 节点，呈现出内容。

上面是简化版的，为了方便理解，实际的渲染过程会复杂很多。

## 实现 createElement 和 render

有了这些理解，最后，手动实现一个 `createElement` 和 `render` 函数，加深一下。

```jsx
// file: mreact.js

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
}

function render(element, container) {
  // null,undefined,false 不渲染
  if (element === null || element === undefined || element === false) {
    return;
  }

  const isElement = typeof element === "object" && "type" in element; // 这种判断实际中不严谨
  // 非 element 直接,直接以字符串渲染
  if (!isElement) {
    const textNode = document.createTextNode(String(element));
    container.appendChild(textNode);
    return;
  }

  //函数组件，则调用函数，递归渲染
  if (typeof element.type === "function") {
    const nextElement = element.type(element.props);
    render(nextElement, container);
    return;
  } else if (typeof element.type === "string") {
    // 基本元素类型，渲染对应的html元素
    const dom = document.createElement(element.type);
    const isProperty = (key) => key !== "children";
    Object.keys(element.props)
      .filter(isProperty)
      .forEach((name) => {
        dom[name] = element.props[name];
      });
    element.props.children.forEach((child) => render(child, dom));
    container.appendChild(dom);
    return;
  }
}

export default { render, createElement };
```

这样使用：

```js
// file: index.js

import mReact from "./mreact.js";

function Post(props) {
  const { title, content } = props;
  return mReact.createElement(
    "div",
    { className: "post" },
    mReact.createElement("h1", { className: "post-title" }, title),
    mReact.createElement("p", { className: "post-content" }, content)
  );
}

mReact.render(
  mReact.createElement(Post, {
    title: "Hello World",
    content: "This is a post.",
  }),
  document.getElementById("root")
);
```

## 总结

- JSX 是 `React.createElement` 的语法糖。
- JSX 语法需要经过 Babel 等工具编译转化。
- 一段 JSX 等效于一个 React Element 对象，也就是虚拟 DOM 对象。
- 创建 React Element 对象时，不会执行组件函数。
- 组件函数返回 React Element 对象，React 在渲染时，递归执行组件函数，创建 React Element，构造出虚拟 DOM 树。

## 拓展案例

[React 练习：实现一个 SelectPanel 组件](https://juejin.cn/post/7478497062449397787)
