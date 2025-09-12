import { eventHandler } from "h3";

// Learn more: https://nitro.build/guide/routing
export default eventHandler((event) => {
  return {
    name: "John Doe",
    age: 20,
    email: "john.doe@example.com",
  };
});
