// @jsx h
import { h } from "nano-jsx";
import Counter from "./components/counter.tsx";

// Output the string representation of the Counter component
console.log("Counter component string representation:");
console.log(Counter.toString());

// Create an instance of the Counter component and output its string representation
const counterInstance = Counter();
console.log("\nCounter instance string representation:");
console.log(counterInstance.toString());
