# dom-transport

`transport('.source', '.target', { options }, callback)`

![dom-transport example!](https://github.com/mystrdat/dom-transport/raw/master/example.gif)

- usable for complex effects where some elements persist between independent views
- source and target elements should have the same DOM structure, otherwise results may vary
- use the morph option if the target element is not designed 1:1 to source (more expensive)
- use stagger to progressively delay the animation for each member when using multiple sources and targets
- selectors are parsed using `document.querySelectorAll()`

### Options

`log` - logging to console (`false`)  
`morph` -  attempt to morph source into target (`false`)  
`morphProps` - properties to transition during a morph (`Array`)  
`duration` - transport duration in ms (`300`)  
`easing` - transport easing (`'ease-in-out'`)  
`stagger` - transport delay between members in ms (`30`)  
`hideSource` - hide source element during transport (`true`)  
`hideTarget` - hide target element during transport (`true`)  
`removeClonesAfter` - remove clones after transport (`true`)  
`callback` - function to call after transport is done
