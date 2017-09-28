# babel-plugin-s2s-state-root
[![Build Status](https://travis-ci.org/akameco/babel-plugin-s2s-state-root.svg?branch=master)](https://travis-ci.org/akameco/babel-plugin-s2s-state-root)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

> s2s plugin: compose state types


## Install

```
$ npm install --save-dev babel-plugin-s2s-state-root
```

### Example

#### IN:

```
```


#### OUT:

```
// @flow
import type { State as App } from "../../__fixtures__/app/reducer";
import type { State as Bob } from "../../__fixtures__/bob/reducer";

export type State = {
  App: App;
  Bob: Bob;
};
```


### Usage

```
{
  ['s2s-state-root', {
    input: 'containers/**/reducer.js',
    output: 'types/state.js',
    globOptions: {}
  }]
}
```

#### input

type: `string` <br>
required: true

glob pattern.

#### output

type: `string` <br>
required: true

outputh path.

#### globOptions

See https://github.com/isaacs/node-glob#options

## Related
- [**akameco/s2s**<br>Source to Source](https://github.com/akameco/s2s)
- [**akameco/babel-plugin-s2s-action-root**<br>compose flow + redux action types](https://github.com/akameco/babel-plugin-s2s-action-root)
- [**akameco/babel-plugin-s2s-reducer-root**<br>compose redux reducer](https://github.com/akameco/babel-plugin-s2s-reducer-root)
- [**akameco/babel-plugin-s2s-action-types**<br>generate redux action types](https://github.com/akameco/babel-plugin-s2s-action-types)
- [**akameco/babel-plugin-s2s-action-creater**<br>generate redux action creater](https://github.com/akameco/babel-plugin-s2s-action-creater)

## License

MIT © [akameco](http://akameco.github.io)
