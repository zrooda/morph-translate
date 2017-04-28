const DOMTransport = (src, tgt, opts) => {
  // Defaults
  const refs = [],
        source = src instanceof HTMLElement ? [src] : Array.from(src),
        target = tgt instanceof HTMLElement ? [tgt] : Array.from(tgt),
        options = Object.assign({
          log: false,
          morph: false,
          morphProps: ['width', 'height', 'padding', 'color', 'background', 'border', 'fontSize', 'opacity'],
          duration: 300,
          easing: 'ease-in-out',
          stagger: 30,
          hideSource: true,
          hideTarget: true,
          removeClonesAfter: true
        }, opts);
  
  // Get a deep node clone with all styles
  function getClone(source) {
    const clone = source.cloneNode(true),
        clones = Array.prototype.slice.call(clone.querySelectorAll('*')),
        sources = Array.prototype.slice.call(source.querySelectorAll('*'));
    clones.push(clone);
    sources.push(source);
    sources.forEach((node, i) => {
      const currentClone = clones[i];
      currentClone.removeAttribute('id');
      currentClone.removeAttribute('class');
      currentClone.style.cssText = window.getComputedStyle(node).cssText;
    })
    return clone;
  }

  // Create styled node clones in a fragment
  function getVisualCloneFragment(source) {
    const fragment = document.createDocumentFragment();
    source.forEach((node, i) => {
      options.log && console.info('cloning', node);
      const clone = getClone(node),
          sourceBounds = node.getBoundingClientRect();
      // Cache reference
      refs.push(clone);
      // Positioning
      clone.style.position = 'fixed';
      clone.style.left = `${sourceBounds.left}px`;
      clone.style.top = `${sourceBounds.top}px`;
      clone.style.zIndex = '1000';
      // Custom properties
      clone.style.transitionProperty = 'all';
      clone.style.transitionDuration = `${options.duration}ms`;
      clone.style.transitionTimingFunction = options.easing;
      // clone.style.willChange = 'transform';
      // Conflicting properties
      clone.style.margin = 0;
      clone.style.transform = 'none';
      clone.style.webkitTextFillColor = 'initial';
      fragment.appendChild(clone);
    })
    return fragment;
  }

  // Manage visibility of source and target elements
  function manageVisibility(showSource, showTarget) {
    source.forEach((node) => {
      options.log && console.info(`${showSource ? 'showing' : 'hiding'} original`, node);
      node.style.visibility = showSource ? 'visible' : 'hidden';
    })
    target.forEach((node) => {
      options.log && console.info(`${showTarget ? 'showing' : 'hiding'} target`, node);
      node.style.visibility = showTarget ? 'visible' : 'hidden';
    })
  }

  // Morph into target
  function morphToPosition(source, target) {
    options.log && console.info('morphing', source, target);
    source.forEach((node, i) => {
      var currentTarget = target[i] || target,
          targetStyles = window.getComputedStyle(currentTarget),
          sourceBounds = node.getBoundingClientRect(),
          targetBounds = currentTarget.getBoundingClientRect(),
          scaleX = targetBounds.width / currentTarget.offsetWidth,
          scaleY = targetBounds.height / currentTarget.offsetHeight,
          translateX = targetBounds.left + ((targetBounds.width - targetBounds.width / scaleX) / 2) - sourceBounds.left,
          translateY = targetBounds.top + ((targetBounds.height - targetBounds.height / scaleY) / 2) - sourceBounds.top;
      // Stagger delay
      node.style.transitionDelay = i * options.stagger + 'ms';
      // Transition all relevant properties to target state
      options.morphProps.forEach((property) => {
        node.style[property] = targetStyles[property];
      })
      node.style.transformOrigin = '50% 50% 0';
      node.style.transform = `translate(${translateX}px,${translateY}px) scale(${scaleX},${scaleY})`;
    })
  }

  function tweenToPosition(source, target) {
    options.log && console.info('tweening', source, target);
    source.forEach((node, i) => {
      var sourceBounds = node.getBoundingClientRect(),
          targetBounds = target[i] ? target[i].getBoundingClientRect() : target.getBoundingClientRect();
      node.style.transitionDelay = i * options.stagger + 'ms';
      node.style.transform = `translate(${targetBounds.left - sourceBounds.left}px,${targetBounds.top - sourceBounds.top}px)`;
    })
  }

  function removeNodes (refs) {
    options.log && console.info('removing clones');
    refs.forEach((node) => {
      node.remove();
    })
  }

  function runTheShow() {
    // Append clone fragment to DOM
    document.body.appendChild(getVisualCloneFragment(source));
    manageVisibility(!options.hideSource, !options.hideTarget);
    // Animate or morph to new location
    if (options.morph) {
      morphToPosition(refs, target);
    } else {
      tweenToPosition(refs, target);
    }
    // Clean after effect
    setTimeout(() => {
      if (options.removeClonesAfter) {
        options.log && console.info('cleaning up');
        manageVisibility(false, true);
        removeNodes(refs);
      }
      if (options.callback && typeof callback == 'function') {
        callback.call();
      }
    }, options.duration + options.stagger * (refs.length - 1) + 20);
  }
  // Go!
  runTheShow();
}

export default DOMTransport;
