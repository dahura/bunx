// @jsx h
import { h } from "nano-jsx";

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const Button = ({ ...props }) => (
  <button
    {...props}
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
  >
    {props.children}
  </button>
);

export default function Counter() {
  let count = 0;
  const increment = () => count++;
  const decrement = () => count--;

  return (
    <div className="p-4 max-w-md mx-auto border rounded shadow">
      <h1 className="text-2xl mb-4">Счётчик: {count}</h1>
      <div className="flex gap-2">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={decrement}
        >
          –
        </button>
        <button
          onClick={increment}
          className="bg-green-500 hover:bg-greenx-700 text-white font-bold py-2 px-4 rounded"
        >
          +
        </button>
      </div>
    </div>
  );
}
