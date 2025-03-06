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
