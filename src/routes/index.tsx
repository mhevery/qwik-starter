import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import Home from "~/routes/home";

export default component$(() => {
  return (
    <>
      {/* I moved all logic to another file in-case you want to quickly delete and prototype something */}
      <Home />
      <div style={{ padding: "1rem" }}>Hello World</div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
