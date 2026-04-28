(function () {
  var t = localStorage.getItem("theme");
  if (t) {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(t);
  }
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);
})();
