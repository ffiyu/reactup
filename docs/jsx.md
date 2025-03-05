# JSX 即对象

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

React 在文档中也提到，可以不使用 JSX 语法，直接使用 `React.createElement`（不过应该没有人会这么做）。

## JSX 的编译转化

JSX 是 JavaScript 的拓展语法，无法在浏览器中运行，需要通过 Babel 等工具进行编译转化。

[Babel 在线工具](https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=KYDwDg9gTgLgBAE2AMwIYFcA29noHYDGMAlhHnAAoQDOMAFGFBGNQJRwDeAUHHAWbU5wSMTMAA0fMjGB54AXzgBeOI2bUA3Fx5wowGOijk6O3gB4ExAG4A-U7zhmAFgEYbHEWPlmA9K7sODmZg7vxysjDePiH2vpa2Oqxa8kA&debug=false&forceAllTransforms=false&modules=false&shippedProposals=false&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=react&prettier=false&targets=&version=7.26.9&externalPlugins=&assumptions=%7B%7D) 能看到编译后的结果。

对的例子，得到的结果是：

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

`jsx/jsxs` 函数的功能和 `React.createElement` 类似，都是创建并返回 React Element 对象。

## React Element

无论是`jsx/jsxs(...)`,还是 `React.createElement(...)`，结果都是 React Element 对象。
它的主要结构如下：

```js
{
  $$typeof: Symbol(react.element),  // 用于判断这个对象是否是 React Element
  // 元素的类型。
  // html节点时，是字符串，比如 "div";
  // 自定义组件时，是函数或类的引用
  type: type,
  props: object, // 组件props，包括 children 属性
  //...
}
```

比如，

```jsx
<Post title={"Hello World"} content={"This is a post."} />
// 最终生成的对象大概长这样：
{
  $$typeof: Symbol(react.element),
  type: Post,
  props: {
    title: 'Hello World',
    content: 'This is a post.',
  }
}

<h1>Hello World</h1>
// 最终生成的对象大概长这样：
{
  $$typeof: Symbol(react.element),
  type: 'h1',
  props: {
    children: ['Hello World'],
  }
}
```

##
