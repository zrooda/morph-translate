class DOMTransport {
	constructor(source, target, options) {
    this.refs = [];
    this.source = document.querySelectorAll(source);
    this.target = document.querySelectorAll(target);
    this.options = Object.assign({
      log: false,
      morph: false,
      morphProps: ['width', 'height', 'padding', 'color', 'background', 'border', 'fontSize', 'opacity'],
      duration: 300,
      easing: 'ease-in-out',
      stagger: 30,
      hideSource: true,
      hideTarget: true,
      removeClonesAfter: true
    }, options);
    this.runTheShow();
	}

  // Get a deep node clone with all styles
  getClone(source) {
    const clone = source.cloneNode(true),
        clones = Array.prototype.slice.call(clone.querySelectorAll('*')),
        sources = Array.prototype.slice.call(source.querySelectorAll('*'));
    clones.push(clone);
    sources.push(source);
    sources.forEach(function (node, i) {
      const currentClone = clones[i];
      currentClone.removeAttribute('id');
      currentClone.removeAttribute('class');
      currentClone.style.cssText = window.getComputedStyle(node).cssText;
    })
    return clone;
  }

  // Create styled node clones in a fragment
  getVisualCloneFragment(source) {
    const fragment = document.createDocumentFragment();
    source.forEach((node, i) => {
      this.options.log && console.info('cloning', node);
      const clone = this.getClone(node),
          sourceBounds = node.getBoundingClientRect();
      // Cache reference
      this.refs.push(clone);
      // Positioning
      clone.style.position = 'fixed';
      clone.style.left = sourceBounds.left + 'px';
      clone.style.top = sourceBounds.top + 'px';
      clone.style.zIndex = '1000';
      // Custom properties
      clone.style.transitionProperty = 'all';
      clone.style.transitionDuration = this.options.duration + 'ms';
      clone.style.transitionTimingFunction = this.options.easing;
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
  manageVisibility(showSource, showTarget) {
    this.source.forEach((node) => {
      this.options.log && console.info((showSource ? 'showing' : 'hiding') + ' original', node);
      node.style.visibility = showSource ? 'visible' : 'hidden';
    })
    this.target.forEach((node) => {
      this.options.log && console.info((showTarget ? 'showing' : 'hiding') + ' target', node);
      node.style.visibility = showTarget ? 'visible' : 'hidden';
    })
  }

  // Morph into target
  morphToPosition(source, target) {
    this.options.log && console.info('morphing', source, target);
    source.forEach((node, i) => {
      var currentTarget = target[i],
          targetStyles = window.getComputedStyle(currentTarget),
          sourceBounds = node.getBoundingClientRect(),
          targetBounds = currentTarget.getBoundingClientRect(),
          scaleX = targetBounds.width / currentTarget.offsetWidth,
          scaleY = targetBounds.height / currentTarget.offsetHeight,
          translateX = targetBounds.left + ((targetBounds.width - targetBounds.width / scaleX) / 2) - sourceBounds.left,
          translateY = targetBounds.top + ((targetBounds.height - targetBounds.height / scaleY) / 2) - sourceBounds.top;
      // Stagger delay
      node.style.transitionDelay = i * this.options.stagger + 'ms';
      // Transition all relevant properties to target state
      this.options.morphProps.forEach((property) => {
        node.style[property] = targetStyles[property];
      })
      node.style.transformOrigin = '50% 50% 0';
      node.style.transform = 'translate(' + translateX + 'px,' + translateY + 'px) scale(' + scaleX + ',' + scaleY + ')';
    })
  }

  tweenToPosition(source, target) {
    this.options.log && console.info('tweening', source, target);
    source.forEach((node, i) => {
      var sourceBounds = node.getBoundingClientRect(),
          targetBounds = target[i].getBoundingClientRect();
      node.style.transitionDelay = i * this.options.stagger + 'ms';
      node.style.transform = 'translate(' + (targetBounds.left - sourceBounds.left) + 'px,' + (targetBounds.top - sourceBounds.top) + 'px)';
    })
  }

  removeNodes (refs) {
    this.options.log && console.info('removing clones');
    refs.forEach((node) => {
      node.remove();
    })
  }

  runTheShow() {
    // Append clone fragment to DOM
    document.body.appendChild(this.getVisualCloneFragment(this.source));
    this.manageVisibility(!this.options.hideSource, !this.options.hideTarget);
    // Animate or morph to new location
    if (this.options.morph) {
      this.morphToPosition(this.refs, this.target);
    } else {
      this.tweenToPosition(this.refs, this.target);
    }
    // Clean after effect
    setTimeout(() => {
      if (this.options.removeClonesAfter) {
        this.options.log && console.info('cleaning up');
        this.manageVisibility(false, true);
        this.removeNodes(this.refs);
      }
      if (this.options.callback && typeof callback == 'function') {
        callback.call();
      }
    }, this.options.duration + this.options.stagger * (this.refs.length - 1) + 20);
  }
};

export default (source, target, options) => new DOMTransport(source, target, options);
