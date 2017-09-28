# babel-plugin-s2s-action-types

> generate action types


## Install

```
$ npm install --save-dev babel-plugin-s2s-action-types
```


## Usage

#### In:

```js
export type Action = Increment
```

#### Out:

```js
// @flow
export const INCREMENT: "app/counter/INCREMENT" = "app/counter/INCREMENT";

export const Actions = {
  INCREMENT
};

export type Increment = {
  type: typeof INCREMENT
};

export type Action = Increment;
```
