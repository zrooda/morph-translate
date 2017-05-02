const morphTranslate = (src, tgt, opts) => {
  // Defaults
  const refs = [],
        source = src instanceof HTMLElement ? [src] : Array.from(src),
        target = tgt instanceof HTMLElement ? [tgt] : Array.from(tgt),
        options = Object.assign({
          morph: false,
          morphChildren: true,
          morphProps: ['width', 'height', 'padding', 'color', 'background', 'border', 'fontSize', 'opacity'],
          duration: 500,
          easing: 'ease-in-out',
          stagger: 30,
          zIndex: 1000,
          hideSource: true,
          hideTarget: true,
          removeClonesAfter: true,
          willChange: false,
          log: false
        }, opts);
  
  // Create a deep node clone with all styles
  function createClone(source, index) {
    const clone = source.cloneNode(true),
        cloneNodes = Array.prototype.slice.call(clone.querySelectorAll('*')),
        sourceNodes = Array.prototype.slice.call(source.querySelectorAll('*'));
    cloneNodes.push(clone);
    sourceNodes.push(source);
    sourceNodes.forEach((node, i) => {
      const currentClone = cloneNodes[i];
      currentClone.removeAttribute('id');
      currentClone.removeAttribute('class');
      currentClone.style.cssText = window.getComputedStyle(node).cssText;
      if (node == source || options.morphChildren) {
        // Transition properties
        const changedProps = options.morphProps.map((x) => x.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()).join(', ');
        currentClone.style.willChange = options.willChange ? `transform, ${changedProps}` : 'auto';
        currentClone.style.transitionProperty = options.morph ? `transform, ${changedProps}` : 'transform';
        currentClone.style.transitionDuration = `${options.duration}ms`;
        currentClone.style.transitionDelay = `${index * options.stagger}ms`;
        currentClone.style.transitionTimingFunction = options.easing;
        // Conflicting properties
        currentClone.style.webkitTextFillColor = 'initial';
      }
    })
    return clone;
  }

  // Create styled node clones in a fragment
  function getVisualCloneFragment(source) {
    const fragment = document.createDocumentFragment();
    source.forEach((node, i) => {
      options.log && console.info('cloning', node);
      const clone = createClone(node, i),
            sourceBounds = node.getBoundingClientRect();
      // Cache reference
      refs.push(clone);
      // Positioning
      clone.style.position = 'fixed';
      clone.style.left = `${sourceBounds.left}px`;
      clone.style.top = `${sourceBounds.top}px`;
      clone.style.zIndex = options.zIndex;
      // Properties conflicting with positioning
      clone.style.margin = 0;
      clone.style.transform = 'none';
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
      const currentTarget = target[i] || target[0],
            targetStyles = window.getComputedStyle(currentTarget),
            sourceBounds = node.getBoundingClientRect(),
            targetBounds = currentTarget.getBoundingClientRect(),
            scaleX = targetBounds.width / currentTarget.offsetWidth,
            scaleY = targetBounds.height / currentTarget.offsetHeight,
            translateX = targetBounds.left + ((targetBounds.width - targetBounds.width / scaleX) / 2) - sourceBounds.left,
            translateY = targetBounds.top + ((targetBounds.height - targetBounds.height / scaleY) / 2) - sourceBounds.top;
      // Parent
      node.style.transformOrigin = '50% 50% 0';
      node.style.transform = `translate(${translateX}px,${translateY}px) scale(${scaleX},${scaleY})`;
      // Transition all relevant properties to target state
      options.morphProps.forEach((property) => {
        node.style[property] = targetStyles[property];
      })
      // Children
      if (options.morphChildren) {
        const sourceNodes = Array.prototype.slice.call(node.querySelectorAll('*')),
              targetNodes = Array.prototype.slice.call(currentTarget.querySelectorAll('*'));
        sourceNodes.forEach((child, n) => {
          const targetChild = targetNodes[n],
                targetChildStyles = window.getComputedStyle(targetChild);
          options.morphProps.forEach((property) => {
            child.style[property] = targetChildStyles[property];
          })
        })
      }
    })
  }

  // Translate into target
  function translateToPosition(source, target) {
    options.log && console.info('tweening', source, target);
    source.forEach((node, i) => {
      const sourceBounds = node.getBoundingClientRect(),
            targetBounds = target[i] ? target[i].getBoundingClientRect() : target[0].getBoundingClientRect();
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
      translateToPosition(refs, target);
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

export default morphTranslate;
