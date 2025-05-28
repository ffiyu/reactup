# React 基本原理

## React 是一个运行时 JavaScript 库

- 引用官方介绍：React is a JavaScript library for building user interfaces.
- 展开强调**运行时**:
  - React 只能执行代码，不能分析、修改代码。
  - react 库、我们写的组件代码都是 JavaScript 代码，遵循 JavaScript 语法、执行规则。
- 用运行时 JavaScript 解释一些概念和现象：
  - 解释 react 的基本工作原理
  - 为什么我们说 react 更灵活
  - 组件内的变量每次都会重新声明
  - HOC
  - 返回不同的 JSX，组件状态不会重置

## 组件

## 函数组件与类组件

## 组件函数

### 什么是组件组件函数

### 组件 和 renderXxx

### renderXxx

### Render Prop（including Render Children）

## JSX 与 ReactElement

### react 与 jsx 语法

### jsx 语法的编译

### ReactElement 与 Fiber

## Render

### 建议模型：递归 dfs

### Fiber

### Reconciliation and Commit

### Reconciliation：循环、可中断、异步

### Commit：同步、Effects 执行

### Concurrency and Schedule

## Hooks

### 理解 Hooks 的本质

### Hooks 的规则

### useState

### useEffect and useLayoutEffect

### useRef

### useMemo and useCallback

### useContext

### useRef

## 杂项

## Ref

## Context

## Portals

## HOC
