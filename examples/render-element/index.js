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
