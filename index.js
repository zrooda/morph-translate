function transport (source, target, options) {

  var refs = [],
      opts = {
        log: false,
        morph: false,
        duration: '300ms',
        easing: 'ease-in-out',
        stagger: '30ms',
        hideSource: true,
        hideTarget: true,
        cleanAfter: true
      };
  opts = Object.assign(opts, options);

  opts.log && console.info('transporting ' + source + ' > ' + target);
  source = document.querySelectorAll(source);
  target = document.querySelectorAll(target);

  // Get a deep node clone with all styles
  function getClone (source) {
    var clone = source.cloneNode(true),
        clones = Array.prototype.slice.call(clone.querySelectorAll('*')),
        sources = Array.prototype.slice.call(source.querySelectorAll('*'));
    clones.push(clone);
    sources.push(source);
    sources.forEach(function (node, i) {
      var currentClone = clones[i];
      currentClone.removeAttribute('id');
      currentClone.removeAttribute('class');
      currentClone.style.cssText = window.getComputedStyle(node).cssText;
    })
    return clone;
  }

  // Create styled node clones in a fragment
  function getVisualCloneFragment (source) {
    var fragment = document.createDocumentFragment();
    source.forEach(function (node, i) {
      opts.log && console.info('cloning', node);
      var clone = getClone(node),
          sourceBounds = node.getBoundingClientRect();
      // Cache reference
      refs.push(clone);
      // Positioning
      clone.style.position = 'fixed';
      clone.style.left = sourceBounds.left + 'px';
      clone.style.top = sourceBounds.top + 'px';
      clone.style.zIndex = '1000';
      // Custom properties
      clone.style.transitionProperty = 'all';
      clone.style.transitionDuration = opts.duration;
      clone.style.transitionEasingFunction = opts.easing;
      // clone.style.willChange = 'transform';
      // Conflicting properties
      clone.style.margin = 0;
      clone.style.transform = 'none';
      fragment.appendChild(clone);
    })
    return fragment;
  }

  // Manage visibility of source and target elements
  function manageVisibility (showSource, showTarget) {
    source.forEach(function (node) {
      opts.log && console.info((showSource ? 'showing' : 'hiding') + ' original', node);
      node.style.visibility = showSource ? 'visible' : 'hidden';
    })
    target.forEach(function (node) {
      opts.log && console.info((showTarget ? 'showing' : 'hiding') + ' target', node);
      node.style.visibility = showTarget ? 'visible' : 'hidden';
    })
  }

  function morphPosition (source, target) {
    opts.log && console.info('morphing', source, target);
    opts.log && console.warn('morphing is dirty check intensive!');
  }

  function tweenPosition (source, target) {
    opts.log && console.info('tweening', source, target);
    source.forEach(function (node, i) {
      var sourceBounds = node.getBoundingClientRect(),
          targetBounds = target[i].getBoundingClientRect();
      node.style.transitionDelay = i * parseInt(opts.stagger) + 'ms';
      node.style.transform = 'translate(' + (targetBounds.left - sourceBounds.left) + 'px,' + (targetBounds.top - sourceBounds.top) + 'px)';
    })
  }

  function removeNodes (refs) {
    opts.log && console.info('removing clones');
    refs.forEach(function (node) {
      node.remove();
    })
  }

  // Append clone fragment to DOM
  document.body.appendChild(getVisualCloneFragment(source));
  manageVisibility(!opts.hideSource, !opts.hideTarget);

  // Animate or morph to new location
  if (opts.morph) {
    morphPosition(refs, target);
  } else {
    tweenPosition(refs, target);
  }

  // Clean after effect
  if (opts.cleanAfter) {
    setTimeout(function () {
      opts.log && console.info('cleaning up');
      manageVisibility(true, true);
      removeNodes(refs);
    }, parseInt(opts.duration) + parseInt(opts.stagger) * (refs.length - 1) + 10);
  }
}
