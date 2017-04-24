# dom-transport

`transport('.source', '.target', { options }, callback)`

![dom-transport example!](https://github.com/mystrdat/dom-transport/raw/master/example.gif)

- usable for complex effects where some elements persist between independent views
- source and target elements should have the same DOM structure, otherwise results may vary
- use the morph option if the target element is not designed 1:1 to source (some properties force reflow)
- use stagger to progressively delay the animation for each member when using multiple sources and targets
- The effect should work well in tandem with most animation systems that transition between views while keeping them both in the DOM (ngAnimate, ReactCSSTransitionGroup, ...)
- **Tip** If the target element isn't inserted in the DOM in it's final position when the transport function runs (you might be hiding it offscreen for other animation purposes), the transition will break visually. To work around this, position the target element hidden in it's final position in the first few frames of a keyframe animation or pre-`.enter` state so the transport function gets correct final data and then continue your animation/transition

### Options

`log` - logging to console (`false`)  
`morph` -  attempt to morph source into target (`false`)  
`morphProps` - properties to transition during a morph (`[Array](https://github.com/mystrdat/dom-transport/blob/master/index.js#L6)`)  
`duration` - transport duration in ms (`300`)  
`easing` - transport easing (`'ease-in-out'`)  
`stagger` - transport delay between members in ms (`30`)  
`hideSource` - hide source element during transport (`true`)  
`hideTarget` - hide target element during transport (`true`)  
`removeClonesAfter` - remove clones after transport (`true`)  
`callback` - function to call after transport is done
