# text-dimensions

Performant Calculation of the width and height of a text string using canvas (`OffscreenCanvas` if it is supported).

## Installation

```shell script
npm install text-dimensions
```
or

```shell script
yarn add text-dimensions
```

## Usage

```typescript
import TextDimensions from 'text-dimensions';

const dimensions = new TextDimensions('bold 12pt arial');

const { height, width } = dimensions.measureText('text-dimensions');

console.log('Width of text', width);
console.log('height of text', height);

// cleanup
dimensions.clean();
```

## Methods

- `.measureText(text: string, font?: string)`: return an object having the height and width of the text string.
- `.cleanup()`:  removes the canvas from the DOM if it was added.

## License 

MIT 
