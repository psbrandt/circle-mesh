# React Component for [This Demo](https://tympanus.net/Development/DecorativeBackgrounds/index.html)

## Install

```
npm install --save circle-mesh
```

## Usage

```jsx
const App = () => (
  <div className="App">
    <h1>Circle Mesh Demo</h1>
    <CircleMesh colors={[0xac1122, 0x96789f, 0x535353]} />
  </div>
);
```

You can also run the following to get the demo working:

```
$ git clone https://github.com/psbrandt/circle-mesh.git
$ npm install
$ npm run build
$ npm start
```

## Result

![](demo.png)

## Credits

All the work was done [here](https://tympanus.net/Development/DecorativeBackgrounds/index.html). This is just a thin React component wrapper.
