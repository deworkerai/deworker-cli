import { hello } from './command/hello';

export default function sayHello() {
  const output = hello();
  console.log(output);
}

sayHello();
