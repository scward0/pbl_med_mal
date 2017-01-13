'use strict';

!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.3.0';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Stores generated unique ids for plugin instances
     */
    _uuids: [],

    /**
     * Returns a boolean for RTL support
     */
    rtl: function () {
      return $('html').attr('dir') === 'rtl';
    },
    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function (plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = plugin;
    },
    /**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
    registerPlugin: function (plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {
        plugin.$element.attr('data-' + pluginName, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
    unregisterPlugin: function (plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
    reInit: function (plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins,
              _this = this,
              fns = {
            'object': function (plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function () {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function () {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
     * returns a random base-36 uid with namespacing
     * @function
     * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
     * @param {String} namespace - name of plugin to be incorporated in uid, optional.
     * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
     * @returns {String} - unique id
     */
    GetYoDigits: function (length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function (elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
              opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function ($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      var elem = document.createElement('div'),
          end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    }
  };

  Foundation.util = {
    /**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
    throttle: function (func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function (method) {
    var type = typeof method,
        $meta = $('meta.foundation-mq'),
        $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {
      //needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {
      //an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {
        //make sure both the class and method exist
        if (this.length === 1) {
          //if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {
            //otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {
        //error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {
      //error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function () {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function () {},
          fBound = function () {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else if ('false' === str) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}(jQuery);
;'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets
  };

  /**
   * Compares the dimensions of an element to a container and determines collision events with container.
   * @function
   * @param {jQuery} element - jQuery object to test for collisions.
   * @param {jQuery} parent - jQuery object to use as bounding container.
   * @param {Boolean} lrOnly - set to true to check left and right values only.
   * @param {Boolean} tbOnly - set to true to check top and bottom values only.
   * @default if no parent object passed, detects collisions with `window`.
   * @returns {Boolean} - true if collision free, false if a collision in any direction.
   */
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);
;/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
     * Parses the (keyboard) event and returns a String that represents its key
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     * @param {Event} event - the event generated by the event handler
     * @return String key - String that represents the key pressed
     */
    parseKey: function (event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;

      // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
      key = key.replace(/_$/, '');

      return key;
    },


    /**
     * Handles the given (keyboard) event
     * @param {Event} event - the event generated by the event handler
     * @param {String} component - Foundation component's name, e.g. Slider or Reveal
     * @param {Objects} functions - collection of functions that are to be executed
     */
    handleKey: function (event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {
        // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        // execute function  if exists
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          // execute function when event was handled
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          // execute function when event was not handled
          functions.unhandled();
        }
      }
    },


    /**
     * Finds all focusable elements within the given `$element`
     * @param {jQuery} $element - jQuery object to search within
     * @return {jQuery} $focusable - all focusable elements within `$element`
     */
    findFocusable: function ($element) {
      if (!$element) {
        return false;
      }
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },


    /**
     * Returns the component name name
     * @param {Object} component - Foundation component, e.g. Slider or Reveal
     * @return String componentName
     */

    register: function (componentName, cmds) {
      commands[componentName] = cmds;
    },


    /**
     * Traps the focus in the given element.
     * @param  {jQuery} $element  jQuery object to trap the foucs into.
     */
    trapFocus: function ($element) {
      var $focusable = Foundation.Keyboard.findFocusable($element),
          $firstFocusable = $focusable.eq(0),
          $lastFocusable = $focusable.eq(-1);

      $element.on('keydown.zf.trapfocus', function (event) {
        if (event.target === $lastFocusable[0] && Foundation.Keyboard.parseKey(event) === 'TAB') {
          event.preventDefault();
          $firstFocusable.focus();
        } else if (event.target === $firstFocusable[0] && Foundation.Keyboard.parseKey(event) === 'SHIFT_TAB') {
          event.preventDefault();
          $lastFocusable.focus();
        }
      });
    },

    /**
     * Releases the trapped focus from the given element.
     * @param  {jQuery} $element  jQuery object to release the focus for.
     */
    releaseFocus: function ($element) {
      $element.off('keydown.zf.trapfocus');
    }
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {
      k[kcs[kc]] = kcs[kc];
    }return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);
;'use strict';

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function () {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')'
          });
        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },


    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function (size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },


    /**
     * Checks if the screen matches to a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
     */
    is: function (size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },


    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function (size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },


    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function () {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if (typeof matched === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },


    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function () {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),
            currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function (media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);
;'use strict';

!function ($) {

  /**
   * Motion module.
   * @module foundation.motion
   */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function (element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function (element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;
    // console.log('called');

    if (duration === 0) {
      fn.apply(elem);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      return;
    }

    function move(ts) {
      if (!start) start = ts;
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
   * Animates an element in or out using a CSS transition class.
   * @function
   * @private
   * @param {Boolean} isIn - Defines if the animation is in or out.
   * @param {Object} element - jQuery or HTML object to animate.
   * @param {String} animation - CSS class to use.
   * @param {Function} cb - Callback to run when animation is finished.
   */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);
;'use strict';

!function ($) {

  var Nest = {
    Feather: function (menu) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';

      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text()
          });
          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false });
          }

          $sub.addClass('submenu ' + subMenuClass).attr({
            'data-submenu': '',
            'role': 'menu'
          });
          if (type === 'drilldown') {
            $sub.attr({ 'aria-hidden': true });
          }
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },
    Burn: function (menu, type) {
      var //items = menu.find('li'),
      subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('>li, .menu, .menu > li').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };

  Foundation.Nest = Nest;
}(jQuery);
;'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,
        //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {
          cb();
        }
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      // Check if image is loaded
      if (this.complete || this.readyState === 4 || this.readyState === 'complete') {
        singleImageLoaded();
      }
      // Force load the image
      else {
          // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
          var src = $(this).attr('src');
          $(this).attr('src', src + '?' + new Date().getTime());
          $(this).one('load', function () {
            singleImageLoaded();
          });
        }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
;'use strict';

//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200
	};

	var startPosX,
	    startPosY,
	    startTime,
	    elapsedTime,
	    isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {
			e.preventDefault();
		}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function () {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function (event) {
			var touches = event.changedTouches,
			    first = touches[0],
			    eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup'
			},
			    type = eventTypes[event.type],
			    simulatedEvent;

			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = new window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY
				});
			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);

//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/
;'use strict';

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function (el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    var id = $(this).data('toggle');
    if (id) {
      triggers($(this), 'toggle');
    } else {
      $(this).trigger('toggle.zf.trigger');
    }
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).on('load', function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    mutateListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if (typeof pluginName === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function mutateListener(debounce) {
    var $nodes = $('[data-mutate]');
    if ($nodes.length && MutationObserver) {
      //trigger all listening elements and signal a mutate event
      //no IE 9 or 10
      $nodes.each(function () {
        $(this).triggerHandler('mutateme.zf.trigger');
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function (mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

      //trigger the event handler for the element depending on type
      switch (mutationRecordsList[0].type) {

        case "attributes":
          if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          }
          if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('resizeme.zf.trigger', [$target]);
          }
          if (mutationRecordsList[0].attributeName === "style") {
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          }
          break;

        case "childList":
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;
}(jQuery);

// function domMutationObserver(debounce) {
//   // !!! This is coming soon and needs more work; not active  !!! //
//   var timer,
//   nodes = document.querySelectorAll('[data-mutate]');
//   //
//   if (nodes.length) {
//     // var MutationObserver = (function () {
//     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
//     //   for (var i=0; i < prefixes.length; i++) {
//     //     if (prefixes[i] + 'MutationObserver' in window) {
//     //       return window[prefixes[i] + 'MutationObserver'];
//     //     }
//     //   }
//     //   return false;
//     // }());
//
//
//     //for the body, we need to listen for all changes effecting the style and class attributes
//     var bodyObserver = new MutationObserver(bodyMutation);
//     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
//
//
//     //body callback
//     function bodyMutation(mutate) {
//       //trigger all listening elements and signal a mutation event
//       if (timer) { clearTimeout(timer); }
//
//       timer = setTimeout(function() {
//         bodyObserver.disconnect();
//         $('[data-mutate]').attr('data-events',"mutate");
//       }, debounce || 150);
//     }
//   }
// }
;'use strict';

// Polyfill for requestAnimationFrame

(function () {
  if (!Date.now) Date.now = function () {
    return new Date().getTime();
  };

  var vendors = ['webkit', 'moz'];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    var vp = vendors[i];
    window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
  }
  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime = 0;
    window.requestAnimationFrame = function (callback) {
      var now = Date.now();
      var nextTime = Math.max(lastTime + 16, now);
      return setTimeout(function () {
        callback(lastTime = nextTime);
      }, nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
})();

var initClasses = ['mui-enter', 'mui-leave'];
var activeClasses = ['mui-enter-active', 'mui-leave-active'];

// Find the right "transitionend" event for this browser
var endEvent = function () {
  var transitions = {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'otransitionend'
  };
  var elem = window.document.createElement('div');

  for (var t in transitions) {
    if (typeof elem.style[t] !== 'undefined') {
      return transitions[t];
    }
  }

  return null;
}();

function animate(isIn, element, animation, cb) {
  element = $(element).eq(0);

  if (!element.length) return;

  if (endEvent === null) {
    isIn ? element.show() : element.hide();
    cb();
    return;
  }

  var initClass = isIn ? initClasses[0] : initClasses[1];
  var activeClass = isIn ? activeClasses[0] : activeClasses[1];

  // Set up the animation
  reset();
  element.addClass(animation);
  element.css('transition', 'none');
  requestAnimationFrame(function () {
    element.addClass(initClass);
    if (isIn) element.show();
  });

  // Start the animation
  requestAnimationFrame(function () {
    element[0].offsetWidth;
    element.css('transition', '');
    element.addClass(activeClass);
  });

  // Clean up the animation when it finishes
  element.one('transitionend', finish);

  // Hides the element (for out animations), resets the element, and runs a callback
  function finish() {
    if (!isIn) element.hide();
    reset();
    if (cb) cb.apply(element);
  }

  // Resets transitions and removes motion-specific classes
  function reset() {
    element[0].style.transitionDuration = 0;
    element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
  }
}

var MotionUI = {
  animateIn: function (element, animation, cb) {
    animate(true, element, animation, cb);
  },

  animateOut: function (element, animation, cb) {
    animate(false, element, animation, cb);
  }
};
;'use strict';

$(document).ready(function () {

  $('.slick').slick({
    dots: false,
    infinite: true,
    speed: 500,
    fade: true,
    cssEase: 'linear',
    arrows: false,
    autoplay: true,
    autoplaySpeed: 8000
  });

  $(window).scroll(function () {
    var hT = $('.footer').offset().top,
        hH = $('.footer').outerHeight(),
        wH = $(window).height(),
        wS = $(this).scrollTop(),
        windowWidth = $(window).width();

    if (windowWidth > 768) {
      $('.awards').addClass('hide');

      if (wS < hT + hH - wH - 300) {
        $('.awards').removeClass('animated slideInUp fadeIn');
        $('.awards').addClass('hide');
      }

      if (wS > hT + hH - wH - 300) {
        $('.awards').removeClass('hide');
        $('.awards').addClass('animated slideInUp fadeIn');
      }
    }
  });

  $('i.fa.fa-bars.fa-4x::before').click(function () {
    $('.nav-menu li a').addClass('animated zoomIn');
  });
  $('.cimg').click(function () {
    $('.nav-menu li a').removeClass('animated zoomIn');
  });
  $(".navcontent ul li a").mouseover(function () {
    $(this).addClass('animated pulse');
  });
  $(".navcontent ul li a").mouseout(function () {
    $(this).removeClass('animated pulse');
  });
  $(".practice-area").mouseover(function () {
    $(this).addClass('animated pulse');
  });
  $(".practice-area").mouseout(function () {
    $(this).removeClass('animated pulse');
  });
});
;'use strict';

jQuery('iframe[src*="youtube.com"]').wrap("<div class='flex-video widescreen'/>");
jQuery('iframe[src*="vimeo.com"]').wrap("<div class='flex-video widescreen vimeo'/>");
;"use strict";

jQuery(document).foundation();
;'use strict';

// Joyride demo
$('#start-jr').on('click', function () {
  $(document).foundation('joyride', 'start');
});
;"use strict";
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvdW5kYXRpb24uY29yZS5qcyIsImZvdW5kYXRpb24udXRpbC5ib3guanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQuanMiLCJmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeS5qcyIsImZvdW5kYXRpb24udXRpbC5tb3Rpb24uanMiLCJmb3VuZGF0aW9uLnV0aWwubmVzdC5qcyIsImZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLmpzIiwiZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzLmpzIiwibW90aW9uLXVpLmpzIiwiY3VzdG9tLmpzIiwiZmxleC12aWRlby5qcyIsImluaXQtZm91bmRhdGlvbi5qcyIsImpveXJpZGUtZGVtby5qcyIsIm9mZkNhbnZhcy5qcyJdLCJuYW1lcyI6WyIkIiwiRk9VTkRBVElPTl9WRVJTSU9OIiwiRm91bmRhdGlvbiIsInZlcnNpb24iLCJfcGx1Z2lucyIsIl91dWlkcyIsInJ0bCIsImF0dHIiLCJwbHVnaW4iLCJuYW1lIiwiY2xhc3NOYW1lIiwiZnVuY3Rpb25OYW1lIiwiYXR0ck5hbWUiLCJoeXBoZW5hdGUiLCJyZWdpc3RlclBsdWdpbiIsInBsdWdpbk5hbWUiLCJjb25zdHJ1Y3RvciIsInRvTG93ZXJDYXNlIiwidXVpZCIsIkdldFlvRGlnaXRzIiwiJGVsZW1lbnQiLCJkYXRhIiwidHJpZ2dlciIsInB1c2giLCJ1bnJlZ2lzdGVyUGx1Z2luIiwic3BsaWNlIiwiaW5kZXhPZiIsInJlbW92ZUF0dHIiLCJyZW1vdmVEYXRhIiwicHJvcCIsInJlSW5pdCIsInBsdWdpbnMiLCJpc0pRIiwiZWFjaCIsIl9pbml0IiwidHlwZSIsIl90aGlzIiwiZm5zIiwicGxncyIsImZvckVhY2giLCJwIiwiZm91bmRhdGlvbiIsIk9iamVjdCIsImtleXMiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJsZW5ndGgiLCJuYW1lc3BhY2UiLCJNYXRoIiwicm91bmQiLCJwb3ciLCJyYW5kb20iLCJ0b1N0cmluZyIsInNsaWNlIiwicmVmbG93IiwiZWxlbSIsImkiLCIkZWxlbSIsImZpbmQiLCJhZGRCYWNrIiwiJGVsIiwib3B0cyIsIndhcm4iLCJ0aGluZyIsInNwbGl0IiwiZSIsIm9wdCIsIm1hcCIsImVsIiwidHJpbSIsInBhcnNlVmFsdWUiLCJlciIsImdldEZuTmFtZSIsInRyYW5zaXRpb25lbmQiLCJ0cmFuc2l0aW9ucyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImVuZCIsInQiLCJzdHlsZSIsInNldFRpbWVvdXQiLCJ0cmlnZ2VySGFuZGxlciIsInV0aWwiLCJ0aHJvdHRsZSIsImZ1bmMiLCJkZWxheSIsInRpbWVyIiwiY29udGV4dCIsImFyZ3MiLCJhcmd1bWVudHMiLCJhcHBseSIsIm1ldGhvZCIsIiRtZXRhIiwiJG5vSlMiLCJhcHBlbmRUbyIsImhlYWQiLCJyZW1vdmVDbGFzcyIsIk1lZGlhUXVlcnkiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiLCJwbHVnQ2xhc3MiLCJ1bmRlZmluZWQiLCJSZWZlcmVuY2VFcnJvciIsIlR5cGVFcnJvciIsIndpbmRvdyIsImZuIiwiRGF0ZSIsIm5vdyIsImdldFRpbWUiLCJ2ZW5kb3JzIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidnAiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsInRlc3QiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJsYXN0VGltZSIsImNhbGxiYWNrIiwibmV4dFRpbWUiLCJtYXgiLCJjbGVhclRpbWVvdXQiLCJwZXJmb3JtYW5jZSIsInN0YXJ0IiwiRnVuY3Rpb24iLCJiaW5kIiwib1RoaXMiLCJhQXJncyIsImZUb0JpbmQiLCJmTk9QIiwiZkJvdW5kIiwiY29uY2F0IiwiZnVuY05hbWVSZWdleCIsInJlc3VsdHMiLCJleGVjIiwic3RyIiwiaXNOYU4iLCJwYXJzZUZsb2F0IiwicmVwbGFjZSIsImpRdWVyeSIsIkJveCIsIkltTm90VG91Y2hpbmdZb3UiLCJHZXREaW1lbnNpb25zIiwiR2V0T2Zmc2V0cyIsImVsZW1lbnQiLCJwYXJlbnQiLCJsck9ubHkiLCJ0Yk9ubHkiLCJlbGVEaW1zIiwidG9wIiwiYm90dG9tIiwibGVmdCIsInJpZ2h0IiwicGFyRGltcyIsIm9mZnNldCIsImhlaWdodCIsIndpZHRoIiwid2luZG93RGltcyIsImFsbERpcnMiLCJFcnJvciIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJwYXJSZWN0IiwicGFyZW50Tm9kZSIsIndpblJlY3QiLCJib2R5Iiwid2luWSIsInBhZ2VZT2Zmc2V0Iiwid2luWCIsInBhZ2VYT2Zmc2V0IiwicGFyZW50RGltcyIsImFuY2hvciIsInBvc2l0aW9uIiwidk9mZnNldCIsImhPZmZzZXQiLCJpc092ZXJmbG93IiwiJGVsZURpbXMiLCIkYW5jaG9yRGltcyIsImtleUNvZGVzIiwiY29tbWFuZHMiLCJLZXlib2FyZCIsImdldEtleUNvZGVzIiwicGFyc2VLZXkiLCJldmVudCIsImtleSIsIndoaWNoIiwia2V5Q29kZSIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInRvVXBwZXJDYXNlIiwic2hpZnRLZXkiLCJjdHJsS2V5IiwiYWx0S2V5IiwiaGFuZGxlS2V5IiwiY29tcG9uZW50IiwiZnVuY3Rpb25zIiwiY29tbWFuZExpc3QiLCJjbWRzIiwiY29tbWFuZCIsImx0ciIsImV4dGVuZCIsInJldHVyblZhbHVlIiwiaGFuZGxlZCIsInVuaGFuZGxlZCIsImZpbmRGb2N1c2FibGUiLCJmaWx0ZXIiLCJpcyIsInJlZ2lzdGVyIiwiY29tcG9uZW50TmFtZSIsInRyYXBGb2N1cyIsIiRmb2N1c2FibGUiLCIkZmlyc3RGb2N1c2FibGUiLCJlcSIsIiRsYXN0Rm9jdXNhYmxlIiwib24iLCJ0YXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsImZvY3VzIiwicmVsZWFzZUZvY3VzIiwib2ZmIiwia2NzIiwiayIsImtjIiwiZGVmYXVsdFF1ZXJpZXMiLCJsYW5kc2NhcGUiLCJwb3J0cmFpdCIsInJldGluYSIsInF1ZXJpZXMiLCJjdXJyZW50Iiwic2VsZiIsImV4dHJhY3RlZFN0eWxlcyIsImNzcyIsIm5hbWVkUXVlcmllcyIsInBhcnNlU3R5bGVUb09iamVjdCIsImhhc093blByb3BlcnR5IiwidmFsdWUiLCJfZ2V0Q3VycmVudFNpemUiLCJfd2F0Y2hlciIsImF0TGVhc3QiLCJzaXplIiwicXVlcnkiLCJnZXQiLCJtYXRjaE1lZGlhIiwibWF0Y2hlcyIsIm1hdGNoZWQiLCJuZXdTaXplIiwiY3VycmVudFNpemUiLCJzdHlsZU1lZGlhIiwibWVkaWEiLCJzY3JpcHQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImluZm8iLCJpZCIsImluc2VydEJlZm9yZSIsImdldENvbXB1dGVkU3R5bGUiLCJjdXJyZW50U3R5bGUiLCJtYXRjaE1lZGl1bSIsInRleHQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwic3R5bGVPYmplY3QiLCJyZWR1Y2UiLCJyZXQiLCJwYXJhbSIsInBhcnRzIiwidmFsIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiaXNBcnJheSIsImluaXRDbGFzc2VzIiwiYWN0aXZlQ2xhc3NlcyIsIk1vdGlvbiIsImFuaW1hdGVJbiIsImFuaW1hdGlvbiIsImNiIiwiYW5pbWF0ZSIsImFuaW1hdGVPdXQiLCJNb3ZlIiwiZHVyYXRpb24iLCJhbmltIiwicHJvZyIsIm1vdmUiLCJ0cyIsImlzSW4iLCJpbml0Q2xhc3MiLCJhY3RpdmVDbGFzcyIsInJlc2V0IiwiYWRkQ2xhc3MiLCJzaG93Iiwib2Zmc2V0V2lkdGgiLCJvbmUiLCJmaW5pc2giLCJoaWRlIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiTmVzdCIsIkZlYXRoZXIiLCJtZW51IiwiaXRlbXMiLCJzdWJNZW51Q2xhc3MiLCJzdWJJdGVtQ2xhc3MiLCJoYXNTdWJDbGFzcyIsIiRpdGVtIiwiJHN1YiIsImNoaWxkcmVuIiwiQnVybiIsIlRpbWVyIiwib3B0aW9ucyIsIm5hbWVTcGFjZSIsInJlbWFpbiIsImlzUGF1c2VkIiwicmVzdGFydCIsImluZmluaXRlIiwicGF1c2UiLCJvbkltYWdlc0xvYWRlZCIsImltYWdlcyIsInVubG9hZGVkIiwiY29tcGxldGUiLCJyZWFkeVN0YXRlIiwic2luZ2xlSW1hZ2VMb2FkZWQiLCJzcmMiLCJzcG90U3dpcGUiLCJlbmFibGVkIiwiZG9jdW1lbnRFbGVtZW50IiwibW92ZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJzdGFydFBvc1giLCJzdGFydFBvc1kiLCJzdGFydFRpbWUiLCJlbGFwc2VkVGltZSIsImlzTW92aW5nIiwib25Ub3VjaEVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvblRvdWNoTW92ZSIsIngiLCJ0b3VjaGVzIiwicGFnZVgiLCJ5IiwicGFnZVkiLCJkeCIsImR5IiwiZGlyIiwiYWJzIiwib25Ub3VjaFN0YXJ0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXQiLCJ0ZWFyZG93biIsInNwZWNpYWwiLCJzd2lwZSIsInNldHVwIiwibm9vcCIsImFkZFRvdWNoIiwiaGFuZGxlVG91Y2giLCJjaGFuZ2VkVG91Y2hlcyIsImZpcnN0IiwiZXZlbnRUeXBlcyIsInRvdWNoc3RhcnQiLCJ0b3VjaG1vdmUiLCJ0b3VjaGVuZCIsInNpbXVsYXRlZEV2ZW50IiwiTW91c2VFdmVudCIsInNjcmVlblgiLCJzY3JlZW5ZIiwiY2xpZW50WCIsImNsaWVudFkiLCJjcmVhdGVFdmVudCIsImluaXRNb3VzZUV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJwcmVmaXhlcyIsInRyaWdnZXJzIiwic3RvcFByb3BhZ2F0aW9uIiwiZmFkZU91dCIsImNoZWNrTGlzdGVuZXJzIiwiZXZlbnRzTGlzdGVuZXIiLCJyZXNpemVMaXN0ZW5lciIsInNjcm9sbExpc3RlbmVyIiwibXV0YXRlTGlzdGVuZXIiLCJjbG9zZW1lTGlzdGVuZXIiLCJ5ZXRpQm94ZXMiLCJwbHVnTmFtZXMiLCJsaXN0ZW5lcnMiLCJqb2luIiwicGx1Z2luSWQiLCJub3QiLCJkZWJvdW5jZSIsIiRub2RlcyIsIm5vZGVzIiwicXVlcnlTZWxlY3RvckFsbCIsImxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24iLCJtdXRhdGlvblJlY29yZHNMaXN0IiwiJHRhcmdldCIsImF0dHJpYnV0ZU5hbWUiLCJjbG9zZXN0IiwiZWxlbWVudE9ic2VydmVyIiwib2JzZXJ2ZSIsImF0dHJpYnV0ZXMiLCJjaGlsZExpc3QiLCJjaGFyYWN0ZXJEYXRhIiwic3VidHJlZSIsImF0dHJpYnV0ZUZpbHRlciIsIklIZWFyWW91IiwiZW5kRXZlbnQiLCJNb3Rpb25VSSIsInJlYWR5Iiwic2xpY2siLCJkb3RzIiwic3BlZWQiLCJmYWRlIiwiY3NzRWFzZSIsImFycm93cyIsImF1dG9wbGF5IiwiYXV0b3BsYXlTcGVlZCIsInNjcm9sbCIsImhUIiwiaEgiLCJvdXRlckhlaWdodCIsIndIIiwid1MiLCJzY3JvbGxUb3AiLCJ3aW5kb3dXaWR0aCIsImNsaWNrIiwibW91c2VvdmVyIiwibW91c2VvdXQiLCJ3cmFwIl0sIm1hcHBpbmdzIjoiOztBQUFBLENBQUMsVUFBU0EsQ0FBVCxFQUFZOztBQUViOztBQUVBLE1BQUlDLHFCQUFxQixPQUF6Qjs7QUFFQTtBQUNBO0FBQ0EsTUFBSUMsYUFBYTtBQUNmQyxhQUFTRixrQkFETTs7QUFHZjs7O0FBR0FHLGNBQVUsRUFOSzs7QUFRZjs7O0FBR0FDLFlBQVEsRUFYTzs7QUFhZjs7O0FBR0FDLFNBQUssWUFBVTtBQUNiLGFBQU9OLEVBQUUsTUFBRixFQUFVTyxJQUFWLENBQWUsS0FBZixNQUEwQixLQUFqQztBQUNELEtBbEJjO0FBbUJmOzs7O0FBSUFDLFlBQVEsVUFBU0EsTUFBVCxFQUFpQkMsSUFBakIsRUFBdUI7QUFDN0I7QUFDQTtBQUNBLFVBQUlDLFlBQWFELFFBQVFFLGFBQWFILE1BQWIsQ0FBekI7QUFDQTtBQUNBO0FBQ0EsVUFBSUksV0FBWUMsVUFBVUgsU0FBVixDQUFoQjs7QUFFQTtBQUNBLFdBQUtOLFFBQUwsQ0FBY1EsUUFBZCxJQUEwQixLQUFLRixTQUFMLElBQWtCRixNQUE1QztBQUNELEtBakNjO0FBa0NmOzs7Ozs7Ozs7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IjpbIiFmdW5jdGlvbigkKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgRk9VTkRBVElPTl9WRVJTSU9OID0gJzYuMy4wJztcblxuLy8gR2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4vLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XG52YXIgRm91bmRhdGlvbiA9IHtcbiAgdmVyc2lvbjogRk9VTkRBVElPTl9WRVJTSU9OLFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgaW5pdGlhbGl6ZWQgcGx1Z2lucy5cbiAgICovXG4gIF9wbHVnaW5zOiB7fSxcblxuICAvKipcbiAgICogU3RvcmVzIGdlbmVyYXRlZCB1bmlxdWUgaWRzIGZvciBwbHVnaW4gaW5zdGFuY2VzXG4gICAqL1xuICBfdXVpZHM6IFtdLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcbiAgICovXG4gIHJ0bDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcbiAgfSxcbiAgLyoqXG4gICAqIERlZmluZXMgYSBGb3VuZGF0aW9uIHBsdWdpbiwgYWRkaW5nIGl0IHRvIHRoZSBgRm91bmRhdGlvbmAgbmFtZXNwYWNlIGFuZCB0aGUgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUgd2hlbiByZWZsb3dpbmcuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHBsdWdpbi5cbiAgICovXG4gIHBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKSB7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBhZGRpbmcgdG8gZ2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4gICAgLy8gRXhhbXBsZXM6IEZvdW5kYXRpb24uUmV2ZWFsLCBGb3VuZGF0aW9uLk9mZkNhbnZhc1xuICAgIHZhciBjbGFzc05hbWUgPSAobmFtZSB8fCBmdW5jdGlvbk5hbWUocGx1Z2luKSk7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBzdG9yaW5nIHRoZSBwbHVnaW4sIGFsc28gdXNlZCB0byBjcmVhdGUgdGhlIGlkZW50aWZ5aW5nIGRhdGEgYXR0cmlidXRlIGZvciB0aGUgcGx1Z2luXG4gICAgLy8gRXhhbXBsZXM6IGRhdGEtcmV2ZWFsLCBkYXRhLW9mZi1jYW52YXNcbiAgICB2YXIgYXR0ck5hbWUgID0gaHlwaGVuYXRlKGNsYXNzTmFtZSk7XG5cbiAgICAvLyBBZGQgdG8gdGhlIEZvdW5kYXRpb24gb2JqZWN0IGFuZCB0aGUgcGx1Z2lucyBsaXN0IChmb3IgcmVmbG93aW5nKVxuICAgIHRoaXMuX3BsdWdpbnNbYXR0ck5hbWVdID0gdGhpc1tjbGFzc05hbWVdID0gcGx1Z2luO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFBvcHVsYXRlcyB0aGUgX3V1aWRzIGFycmF5IHdpdGggcG9pbnRlcnMgdG8gZWFjaCBpbmRpdmlkdWFsIHBsdWdpbiBpbnN0YW5jZS5cbiAgICogQWRkcyB0aGUgYHpmUGx1Z2luYCBkYXRhLWF0dHJpYnV0ZSB0byBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZWQgcGx1Z2lucyB0byBhbGxvdyB1c2Ugb2YgJChzZWxlY3RvcikuZm91bmRhdGlvbihtZXRob2QpIGNhbGxzLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBpbml0aWFsaXphdGlvbiBldmVudCBmb3IgZWFjaCBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiwgcGFzc2VkIGFzIGEgY2FtZWxDYXNlZCBzdHJpbmcuXG4gICAqIEBmaXJlcyBQbHVnaW4jaW5pdFxuICAgKi9cbiAgcmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSl7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSBuYW1lID8gaHlwaGVuYXRlKG5hbWUpIDogZnVuY3Rpb25OYW1lKHBsdWdpbi5jb25zdHJ1Y3RvcikudG9Mb3dlckNhc2UoKTtcbiAgICBwbHVnaW4udXVpZCA9IHRoaXMuR2V0WW9EaWdpdHMoNiwgcGx1Z2luTmFtZSk7XG5cbiAgICBpZighcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApKXsgcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWAsIHBsdWdpbi51dWlkKTsgfVxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKSl7IHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicsIHBsdWdpbik7IH1cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGluaXRpYWxpemVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jaW5pdFxuICAgICAgICAgICAqL1xuICAgIHBsdWdpbi4kZWxlbWVudC50cmlnZ2VyKGBpbml0LnpmLiR7cGx1Z2luTmFtZX1gKTtcblxuICAgIHRoaXMuX3V1aWRzLnB1c2gocGx1Z2luLnV1aWQpO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFJlbW92ZXMgdGhlIHBsdWdpbnMgdXVpZCBmcm9tIHRoZSBfdXVpZHMgYXJyYXkuXG4gICAqIFJlbW92ZXMgdGhlIHpmUGx1Z2luIGRhdGEgYXR0cmlidXRlLCBhcyB3ZWxsIGFzIHRoZSBkYXRhLXBsdWdpbi1uYW1lIGF0dHJpYnV0ZS5cbiAgICogQWxzbyBmaXJlcyB0aGUgZGVzdHJveWVkIGV2ZW50IGZvciB0aGUgcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgKiBAZmlyZXMgUGx1Z2luI2Rlc3Ryb3llZFxuICAgKi9cbiAgdW5yZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IGh5cGhlbmF0ZShmdW5jdGlvbk5hbWUocGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykuY29uc3RydWN0b3IpKTtcblxuICAgIHRoaXMuX3V1aWRzLnNwbGljZSh0aGlzLl91dWlkcy5pbmRleE9mKHBsdWdpbi51dWlkKSwgMSk7XG4gICAgcGx1Z2luLiRlbGVtZW50LnJlbW92ZUF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApLnJlbW92ZURhdGEoJ3pmUGx1Z2luJylcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXG4gICAgICAgICAgICovXG4gICAgICAgICAgLnRyaWdnZXIoYGRlc3Ryb3llZC56Zi4ke3BsdWdpbk5hbWV9YCk7XG4gICAgZm9yKHZhciBwcm9wIGluIHBsdWdpbil7XG4gICAgICBwbHVnaW5bcHJvcF0gPSBudWxsOy8vY2xlYW4gdXAgc2NyaXB0IHRvIHByZXAgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQ2F1c2VzIG9uZSBvciBtb3JlIGFjdGl2ZSBwbHVnaW5zIHRvIHJlLWluaXRpYWxpemUsIHJlc2V0dGluZyBldmVudCBsaXN0ZW5lcnMsIHJlY2FsY3VsYXRpbmcgcG9zaXRpb25zLCBldGMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwbHVnaW5zIC0gb3B0aW9uYWwgc3RyaW5nIG9mIGFuIGluZGl2aWR1YWwgcGx1Z2luIGtleSwgYXR0YWluZWQgYnkgY2FsbGluZyBgJChlbGVtZW50KS5kYXRhKCdwbHVnaW5OYW1lJylgLCBvciBzdHJpbmcgb2YgYSBwbHVnaW4gY2xhc3MgaS5lLiBgJ2Ryb3Bkb3duJ2BcbiAgICogQGRlZmF1bHQgSWYgbm8gYXJndW1lbnQgaXMgcGFzc2VkLCByZWZsb3cgYWxsIGN1cnJlbnRseSBhY3RpdmUgcGx1Z2lucy5cbiAgICovXG4gICByZUluaXQ6IGZ1bmN0aW9uKHBsdWdpbnMpe1xuICAgICB2YXIgaXNKUSA9IHBsdWdpbnMgaW5zdGFuY2VvZiAkO1xuICAgICB0cnl7XG4gICAgICAgaWYoaXNKUSl7XG4gICAgICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgJCh0aGlzKS5kYXRhKCd6ZlBsdWdpbicpLl9pbml0KCk7XG4gICAgICAgICB9KTtcbiAgICAgICB9ZWxzZXtcbiAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHBsdWdpbnMsXG4gICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICBmbnMgPSB7XG4gICAgICAgICAgICdvYmplY3QnOiBmdW5jdGlvbihwbGdzKXtcbiAgICAgICAgICAgICBwbGdzLmZvckVhY2goZnVuY3Rpb24ocCl7XG4gICAgICAgICAgICAgICBwID0gaHlwaGVuYXRlKHApO1xuICAgICAgICAgICAgICAgJCgnW2RhdGEtJysgcCArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAnc3RyaW5nJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICBwbHVnaW5zID0gaHlwaGVuYXRlKHBsdWdpbnMpO1xuICAgICAgICAgICAgICQoJ1tkYXRhLScrIHBsdWdpbnMgKyddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgfSxcbiAgICAgICAgICAgJ3VuZGVmaW5lZCc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgdGhpc1snb2JqZWN0J10oT2JqZWN0LmtleXMoX3RoaXMuX3BsdWdpbnMpKTtcbiAgICAgICAgICAgfVxuICAgICAgICAgfTtcbiAgICAgICAgIGZuc1t0eXBlXShwbHVnaW5zKTtcbiAgICAgICB9XG4gICAgIH1jYXRjaChlcnIpe1xuICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgfWZpbmFsbHl7XG4gICAgICAgcmV0dXJuIHBsdWdpbnM7XG4gICAgIH1cbiAgIH0sXG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSByYW5kb20gYmFzZS0zNiB1aWQgd2l0aCBuYW1lc3BhY2luZ1xuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlciBvZiByYW5kb20gYmFzZS0zNiBkaWdpdHMgZGVzaXJlZC4gSW5jcmVhc2UgZm9yIG1vcmUgcmFuZG9tIHN0cmluZ3MuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgLSBuYW1lIG9mIHBsdWdpbiB0byBiZSBpbmNvcnBvcmF0ZWQgaW4gdWlkLCBvcHRpb25hbC5cbiAgICogQGRlZmF1bHQge1N0cmluZ30gJycgLSBpZiBubyBwbHVnaW4gbmFtZSBpcyBwcm92aWRlZCwgbm90aGluZyBpcyBhcHBlbmRlZCB0byB0aGUgdWlkLlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSAtIHVuaXF1ZSBpZFxuICAgKi9cbiAgR2V0WW9EaWdpdHM6IGZ1bmN0aW9uKGxlbmd0aCwgbmFtZXNwYWNlKXtcbiAgICBsZW5ndGggPSBsZW5ndGggfHwgNjtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCgoTWF0aC5wb3coMzYsIGxlbmd0aCArIDEpIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDM2LCBsZW5ndGgpKSkudG9TdHJpbmcoMzYpLnNsaWNlKDEpICsgKG5hbWVzcGFjZSA/IGAtJHtuYW1lc3BhY2V9YCA6ICcnKTtcbiAgfSxcbiAgLyoqXG4gICAqIEluaXRpYWxpemUgcGx1Z2lucyBvbiBhbnkgZWxlbWVudHMgd2l0aGluIGBlbGVtYCAoYW5kIGBlbGVtYCBpdHNlbGYpIHRoYXQgYXJlbid0IGFscmVhZHkgaW5pdGlhbGl6ZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0galF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBlbGVtZW50IHRvIGNoZWNrIGluc2lkZS4gQWxzbyBjaGVja3MgdGhlIGVsZW1lbnQgaXRzZWxmLCB1bmxlc3MgaXQncyB0aGUgYGRvY3VtZW50YCBvYmplY3QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBwbHVnaW5zIC0gQSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZS4gTGVhdmUgdGhpcyBvdXQgdG8gaW5pdGlhbGl6ZSBldmVyeXRoaW5nLlxuICAgKi9cbiAgcmVmbG93OiBmdW5jdGlvbihlbGVtLCBwbHVnaW5zKSB7XG5cbiAgICAvLyBJZiBwbHVnaW5zIGlzIHVuZGVmaW5lZCwganVzdCBncmFiIGV2ZXJ5dGhpbmdcbiAgICBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwbHVnaW5zID0gT2JqZWN0LmtleXModGhpcy5fcGx1Z2lucyk7XG4gICAgfVxuICAgIC8vIElmIHBsdWdpbnMgaXMgYSBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYW4gYXJyYXkgd2l0aCBvbmUgaXRlbVxuICAgIGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAnc3RyaW5nJykge1xuICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcGx1Z2luXG4gICAgJC5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwbHVnaW5cbiAgICAgIHZhciBwbHVnaW4gPSBfdGhpcy5fcGx1Z2luc1tuYW1lXTtcblxuICAgICAgLy8gTG9jYWxpemUgdGhlIHNlYXJjaCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIGVsZW0sIGFzIHdlbGwgYXMgZWxlbSBpdHNlbGYsIHVubGVzcyBlbGVtID09PSBkb2N1bWVudFxuICAgICAgdmFyICRlbGVtID0gJChlbGVtKS5maW5kKCdbZGF0YS0nK25hbWUrJ10nKS5hZGRCYWNrKCdbZGF0YS0nK25hbWUrJ10nKTtcblxuICAgICAgLy8gRm9yIGVhY2ggcGx1Z2luIGZvdW5kLCBpbml0aWFsaXplIGl0XG4gICAgICAkZWxlbS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgLy8gRG9uJ3QgZG91YmxlLWRpcCBvbiBwbHVnaW5zXG4gICAgICAgIGlmICgkZWwuZGF0YSgnemZQbHVnaW4nKSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGluaXRpYWxpemUgXCIrbmFtZStcIiBvbiBhbiBlbGVtZW50IHRoYXQgYWxyZWFkeSBoYXMgYSBGb3VuZGF0aW9uIHBsdWdpbi5cIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpKXtcbiAgICAgICAgICB2YXIgdGhpbmcgPSAkZWwuYXR0cignZGF0YS1vcHRpb25zJykuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uKGUsIGkpe1xuICAgICAgICAgICAgdmFyIG9wdCA9IGUuc3BsaXQoJzonKS5tYXAoZnVuY3Rpb24oZWwpeyByZXR1cm4gZWwudHJpbSgpOyB9KTtcbiAgICAgICAgICAgIGlmKG9wdFswXSkgb3B0c1tvcHRbMF1dID0gcGFyc2VWYWx1ZShvcHRbMV0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAkZWwuZGF0YSgnemZQbHVnaW4nLCBuZXcgcGx1Z2luKCQodGhpcyksIG9wdHMpKTtcbiAgICAgICAgfWNhdGNoKGVyKXtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyKTtcbiAgICAgICAgfWZpbmFsbHl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcbiAgZ2V0Rm5OYW1lOiBmdW5jdGlvbk5hbWUsXG4gIHRyYW5zaXRpb25lbmQ6IGZ1bmN0aW9uKCRlbGVtKXtcbiAgICB2YXIgdHJhbnNpdGlvbnMgPSB7XG4gICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgJ01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAnT1RyYW5zaXRpb24nOiAnb3RyYW5zaXRpb25lbmQnXG4gICAgfTtcbiAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICBlbmQ7XG5cbiAgICBmb3IgKHZhciB0IGluIHRyYW5zaXRpb25zKXtcbiAgICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBlbmQgPSB0cmFuc2l0aW9uc1t0XTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoZW5kKXtcbiAgICAgIHJldHVybiBlbmQ7XG4gICAgfWVsc2V7XG4gICAgICBlbmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICRlbGVtLnRyaWdnZXJIYW5kbGVyKCd0cmFuc2l0aW9uZW5kJywgWyRlbGVtXSk7XG4gICAgICB9LCAxKTtcbiAgICAgIHJldHVybiAndHJhbnNpdGlvbmVuZCc7XG4gICAgfVxuICB9XG59O1xuXG5Gb3VuZGF0aW9uLnV0aWwgPSB7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiBmb3IgYXBwbHlpbmcgYSBkZWJvdW5jZSBlZmZlY3QgdG8gYSBmdW5jdGlvbiBjYWxsLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhdCBlbmQgb2YgdGltZW91dC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gVGltZSBpbiBtcyB0byBkZWxheSB0aGUgY2FsbCBvZiBgZnVuY2AuXG4gICAqIEByZXR1cm5zIGZ1bmN0aW9uXG4gICAqL1xuICB0aHJvdHRsZTogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5KSB7XG4gICAgdmFyIHRpbWVyID0gbnVsbDtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgIGlmICh0aW1lciA9PT0gbnVsbCkge1xuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxuLy8gVE9ETzogY29uc2lkZXIgbm90IG1ha2luZyB0aGlzIGEgalF1ZXJ5IGZ1bmN0aW9uXG4vLyBUT0RPOiBuZWVkIHdheSB0byByZWZsb3cgdnMuIHJlLWluaXRpYWxpemVcbi8qKlxuICogVGhlIEZvdW5kYXRpb24galF1ZXJ5IG1ldGhvZC5cbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBtZXRob2QgLSBBbiBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0aGUgY3VycmVudCBqUXVlcnkgb2JqZWN0LlxuICovXG52YXIgZm91bmRhdGlvbiA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiBtZXRob2QsXG4gICAgICAkbWV0YSA9ICQoJ21ldGEuZm91bmRhdGlvbi1tcScpLFxuICAgICAgJG5vSlMgPSAkKCcubm8tanMnKTtcblxuICBpZighJG1ldGEubGVuZ3RoKXtcbiAgICAkKCc8bWV0YSBjbGFzcz1cImZvdW5kYXRpb24tbXFcIj4nKS5hcHBlbmRUbyhkb2N1bWVudC5oZWFkKTtcbiAgfVxuICBpZigkbm9KUy5sZW5ndGgpe1xuICAgICRub0pTLnJlbW92ZUNsYXNzKCduby1qcycpO1xuICB9XG5cbiAgaWYodHlwZSA9PT0gJ3VuZGVmaW5lZCcpey8vbmVlZHMgdG8gaW5pdGlhbGl6ZSB0aGUgRm91bmRhdGlvbiBvYmplY3QsIG9yIGFuIGluZGl2aWR1YWwgcGx1Z2luLlxuICAgIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5faW5pdCgpO1xuICAgIEZvdW5kYXRpb24ucmVmbG93KHRoaXMpO1xuICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7Ly9hbiBpbmRpdmlkdWFsIG1ldGhvZCB0byBpbnZva2Ugb24gYSBwbHVnaW4gb3IgZ3JvdXAgb2YgcGx1Z2luc1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTsvL2NvbGxlY3QgYWxsIHRoZSBhcmd1bWVudHMsIGlmIG5lY2Vzc2FyeVxuICAgIHZhciBwbHVnQ2xhc3MgPSB0aGlzLmRhdGEoJ3pmUGx1Z2luJyk7Ly9kZXRlcm1pbmUgdGhlIGNsYXNzIG9mIHBsdWdpblxuXG4gICAgaWYocGx1Z0NsYXNzICE9PSB1bmRlZmluZWQgJiYgcGx1Z0NsYXNzW21ldGhvZF0gIT09IHVuZGVmaW5lZCl7Ly9tYWtlIHN1cmUgYm90aCB0aGUgY2xhc3MgYW5kIG1ldGhvZCBleGlzdFxuICAgICAgaWYodGhpcy5sZW5ndGggPT09IDEpey8vaWYgdGhlcmUncyBvbmx5IG9uZSwgY2FsbCBpdCBkaXJlY3RseS5cbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseShwbHVnQ2xhc3MsIGFyZ3MpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBlbCl7Ly9vdGhlcndpc2UgbG9vcCB0aHJvdWdoIHRoZSBqUXVlcnkgY29sbGVjdGlvbiBhbmQgaW52b2tlIHRoZSBtZXRob2Qgb24gZWFjaFxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KCQoZWwpLmRhdGEoJ3pmUGx1Z2luJyksIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9ZWxzZXsvL2Vycm9yIGZvciBubyBjbGFzcyBvciBubyBtZXRob2RcbiAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyBtZXRob2QgKyBcIicgaXMgbm90IGFuIGF2YWlsYWJsZSBtZXRob2QgZm9yIFwiICsgKHBsdWdDbGFzcyA/IGZ1bmN0aW9uTmFtZShwbHVnQ2xhc3MpIDogJ3RoaXMgZWxlbWVudCcpICsgJy4nKTtcbiAgICB9XG4gIH1lbHNley8vZXJyb3IgZm9yIGludmFsaWQgYXJndW1lbnQgdHlwZVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFdlJ3JlIHNvcnJ5LCAke3R5cGV9IGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlci4gWW91IG11c3QgdXNlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWV0aG9kIHlvdSB3aXNoIHRvIGludm9rZS5gKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbndpbmRvdy5Gb3VuZGF0aW9uID0gRm91bmRhdGlvbjtcbiQuZm4uZm91bmRhdGlvbiA9IGZvdW5kYXRpb247XG5cbi8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbihmdW5jdGlvbigpIHtcbiAgaWYgKCFEYXRlLm5vdyB8fCAhd2luZG93LkRhdGUubm93KVxuICAgIHdpbmRvdy5EYXRlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICAgIHZhciB2cCA9IHZlbmRvcnNbaV07XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9ICh3aW5kb3dbdnArJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IHdpbmRvd1t2cCsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ10pO1xuICB9XG4gIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgfHwgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSkge1xuICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUaW1lIC0gbm93KTtcbiAgICB9O1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcbiAgfVxuICAvKipcbiAgICogUG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdywgcmVxdWlyZWQgYnkgckFGXG4gICAqL1xuICBpZighd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2Uubm93KXtcbiAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XG4gICAgICBzdGFydDogRGF0ZS5ub3coKSxcbiAgICAgIG5vdzogZnVuY3Rpb24oKXsgcmV0dXJuIERhdGUubm93KCkgLSB0aGlzLnN0YXJ0OyB9XG4gICAgfTtcbiAgfVxufSkoKTtcbmlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihvVGhpcykge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1XG4gICAgICAvLyBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgIH1cblxuICAgIHZhciBhQXJncyAgID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgZlRvQmluZCA9IHRoaXMsXG4gICAgICAgIGZOT1AgICAgPSBmdW5jdGlvbigpIHt9LFxuICAgICAgICBmQm91bmQgID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1BcbiAgICAgICAgICAgICAgICAgPyB0aGlzXG4gICAgICAgICAgICAgICAgIDogb1RoaXMsXG4gICAgICAgICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIH07XG5cbiAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcbiAgICAgIC8vIG5hdGl2ZSBmdW5jdGlvbnMgZG9uJ3QgaGF2ZSBhIHByb3RvdHlwZVxuICAgICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICB9XG4gICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG5cbiAgICByZXR1cm4gZkJvdW5kO1xuICB9O1xufVxuLy8gUG9seWZpbGwgdG8gZ2V0IHRoZSBuYW1lIG9mIGEgZnVuY3Rpb24gaW4gSUU5XG5mdW5jdGlvbiBmdW5jdGlvbk5hbWUoZm4pIHtcbiAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccyhbXihdezEsfSlcXCgvO1xuICAgIHZhciByZXN1bHRzID0gKGZ1bmNOYW1lUmVnZXgpLmV4ZWMoKGZuKS50b1N0cmluZygpKTtcbiAgICByZXR1cm4gKHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAxKSA/IHJlc3VsdHNbMV0udHJpbSgpIDogXCJcIjtcbiAgfVxuICBlbHNlIGlmIChmbi5wcm90b3R5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmbi5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBmbi5wcm90b3R5cGUuY29uc3RydWN0b3IubmFtZTtcbiAgfVxufVxuZnVuY3Rpb24gcGFyc2VWYWx1ZShzdHIpe1xuICBpZiAoJ3RydWUnID09PSBzdHIpIHJldHVybiB0cnVlO1xuICBlbHNlIGlmICgnZmFsc2UnID09PSBzdHIpIHJldHVybiBmYWxzZTtcbiAgZWxzZSBpZiAoIWlzTmFOKHN0ciAqIDEpKSByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICByZXR1cm4gc3RyO1xufVxuLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2Vcbi8vIFRoYW5rIHlvdTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODk1NTU4MFxuZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuRm91bmRhdGlvbi5Cb3ggPSB7XG4gIEltTm90VG91Y2hpbmdZb3U6IEltTm90VG91Y2hpbmdZb3UsXG4gIEdldERpbWVuc2lvbnM6IEdldERpbWVuc2lvbnMsXG4gIEdldE9mZnNldHM6IEdldE9mZnNldHNcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgZGltZW5zaW9ucyBvZiBhbiBlbGVtZW50IHRvIGEgY29udGFpbmVyIGFuZCBkZXRlcm1pbmVzIGNvbGxpc2lvbiBldmVudHMgd2l0aCBjb250YWluZXIuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB0ZXN0IGZvciBjb2xsaXNpb25zLlxuICogQHBhcmFtIHtqUXVlcnl9IHBhcmVudCAtIGpRdWVyeSBvYmplY3QgdG8gdXNlIGFzIGJvdW5kaW5nIGNvbnRhaW5lci5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbHJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgbGVmdCBhbmQgcmlnaHQgdmFsdWVzIG9ubHkuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRiT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIHRvcCBhbmQgYm90dG9tIHZhbHVlcyBvbmx5LlxuICogQGRlZmF1bHQgaWYgbm8gcGFyZW50IG9iamVjdCBwYXNzZWQsIGRldGVjdHMgY29sbGlzaW9ucyB3aXRoIGB3aW5kb3dgLlxuICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiBjb2xsaXNpb24gZnJlZSwgZmFsc2UgaWYgYSBjb2xsaXNpb24gaW4gYW55IGRpcmVjdGlvbi5cbiAqL1xuZnVuY3Rpb24gSW1Ob3RUb3VjaGluZ1lvdShlbGVtZW50LCBwYXJlbnQsIGxyT25seSwgdGJPbmx5KSB7XG4gIHZhciBlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodDtcblxuICBpZiAocGFyZW50KSB7XG4gICAgdmFyIHBhckRpbXMgPSBHZXREaW1lbnNpb25zKHBhcmVudCk7XG5cbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gcGFyRGltcy5oZWlnaHQgKyBwYXJEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gcGFyRGltcy53aWR0aCArIHBhckRpbXMub2Zmc2V0LmxlZnQpO1xuICB9XG4gIGVsc2Uge1xuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0ICsgZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IGVsZURpbXMud2luZG93RGltcy53aWR0aCk7XG4gIH1cblxuICB2YXIgYWxsRGlycyA9IFtib3R0b20sIHRvcCwgbGVmdCwgcmlnaHRdO1xuXG4gIGlmIChsck9ubHkpIHtcbiAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQgPT09IHRydWU7XG4gIH1cblxuICBpZiAodGJPbmx5KSB7XG4gICAgcmV0dXJuIHRvcCA9PT0gYm90dG9tID09PSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGFsbERpcnMuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xufTtcblxuLyoqXG4gKiBVc2VzIG5hdGl2ZSBtZXRob2RzIHRvIHJldHVybiBhbiBvYmplY3Qgb2YgZGltZW5zaW9uIHZhbHVlcy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnkgfHwgSFRNTH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3Qgb3IgRE9NIGVsZW1lbnQgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGltZW5zaW9ucy4gQ2FuIGJlIGFueSBlbGVtZW50IG90aGVyIHRoYXQgZG9jdW1lbnQgb3Igd2luZG93LlxuICogQHJldHVybnMge09iamVjdH0gLSBuZXN0ZWQgb2JqZWN0IG9mIGludGVnZXIgcGl4ZWwgdmFsdWVzXG4gKiBUT0RPIC0gaWYgZWxlbWVudCBpcyB3aW5kb3csIHJldHVybiBvbmx5IHRob3NlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gR2V0RGltZW5zaW9ucyhlbGVtLCB0ZXN0KXtcbiAgZWxlbSA9IGVsZW0ubGVuZ3RoID8gZWxlbVswXSA6IGVsZW07XG5cbiAgaWYgKGVsZW0gPT09IHdpbmRvdyB8fCBlbGVtID09PSBkb2N1bWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO1xuICB9XG5cbiAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgcGFyUmVjdCA9IGVsZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgIHdpblggPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgIG9mZnNldDoge1xuICAgICAgdG9wOiByZWN0LnRvcCArIHdpblksXG4gICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5YXG4gICAgfSxcbiAgICBwYXJlbnREaW1zOiB7XG4gICAgICB3aWR0aDogcGFyUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogcGFyUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiBwYXJSZWN0LnRvcCArIHdpblksXG4gICAgICAgIGxlZnQ6IHBhclJlY3QubGVmdCArIHdpblhcbiAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd0RpbXM6IHtcbiAgICAgIHdpZHRoOiB3aW5SZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB3aW5SZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHdpblksXG4gICAgICAgIGxlZnQ6IHdpblhcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBvZiB0b3AgYW5kIGxlZnQgaW50ZWdlciBwaXhlbCB2YWx1ZXMgZm9yIGR5bmFtaWNhbGx5IHJlbmRlcmVkIGVsZW1lbnRzLFxuICogc3VjaCBhczogVG9vbHRpcCwgUmV2ZWFsLCBhbmQgRHJvcGRvd25cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCBiZWluZyBwb3NpdGlvbmVkLlxuICogQHBhcmFtIHtqUXVlcnl9IGFuY2hvciAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50J3MgYW5jaG9yIHBvaW50LlxuICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gYSBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGRlc2lyZWQgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIHJlbGF0aXZlIHRvIGl0J3MgYW5jaG9yXG4gKiBAcGFyYW0ge051bWJlcn0gdk9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCB2ZXJ0aWNhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IGhPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgaG9yaXpvbnRhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtCb29sZWFufSBpc092ZXJmbG93IC0gaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQsIHNldHMgdG8gdHJ1ZSB0byBkZWZhdWx0IHRoZSBlbGVtZW50IHRvIGZ1bGwgd2lkdGggLSBhbnkgZGVzaXJlZCBvZmZzZXQuXG4gKiBUT0RPIGFsdGVyL3Jld3JpdGUgdG8gd29yayB3aXRoIGBlbWAgdmFsdWVzIGFzIHdlbGwvaW5zdGVhZCBvZiBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gR2V0T2Zmc2V0cyhlbGVtZW50LCBhbmNob3IsIHBvc2l0aW9uLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KSB7XG4gIHZhciAkZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICAkYW5jaG9yRGltcyA9IGFuY2hvciA/IEdldERpbWVuc2lvbnMoYW5jaG9yKSA6IG51bGw7XG5cbiAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgIGNhc2UgJ3RvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIHRvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IGlzT3ZlcmZsb3cgPyBoT2Zmc2V0IDogKCgkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICgkYW5jaG9yRGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGxlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciByaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCArIDEsXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXInOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQgKyAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpLFxuICAgICAgICB0b3A6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyAoJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JldmVhbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICRlbGVEaW1zLndpZHRoKSAvIDIsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgdk9mZnNldFxuICAgICAgfVxuICAgIGNhc2UgJ3JldmVhbCBmdWxsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCAtICRlbGVEaW1zLndpZHRoLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IChGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICB9XG59XG5cbn0oalF1ZXJ5KTtcbiIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICogVGhpcyB1dGlsIHdhcyBjcmVhdGVkIGJ5IE1hcml1cyBPbGJlcnR6ICpcbiAqIFBsZWFzZSB0aGFuayBNYXJpdXMgb24gR2l0SHViIC9vd2xiZXJ0eiAqXG4gKiBvciB0aGUgd2ViIGh0dHA6Ly93d3cubWFyaXVzb2xiZXJ0ei5kZS8gKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3Qga2V5Q29kZXMgPSB7XG4gIDk6ICdUQUInLFxuICAxMzogJ0VOVEVSJyxcbiAgMjc6ICdFU0NBUEUnLFxuICAzMjogJ1NQQUNFJyxcbiAgMzc6ICdBUlJPV19MRUZUJyxcbiAgMzg6ICdBUlJPV19VUCcsXG4gIDM5OiAnQVJST1dfUklHSFQnLFxuICA0MDogJ0FSUk9XX0RPV04nXG59XG5cbnZhciBjb21tYW5kcyA9IHt9XG5cbnZhciBLZXlib2FyZCA9IHtcbiAga2V5czogZ2V0S2V5Q29kZXMoa2V5Q29kZXMpLFxuXG4gIC8qKlxuICAgKiBQYXJzZXMgdGhlIChrZXlib2FyZCkgZXZlbnQgYW5kIHJldHVybnMgYSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIGl0cyBrZXlcbiAgICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcmV0dXJuIFN0cmluZyBrZXkgLSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIHRoZSBrZXkgcHJlc3NlZFxuICAgKi9cbiAgcGFyc2VLZXkoZXZlbnQpIHtcbiAgICB2YXIga2V5ID0ga2V5Q29kZXNbZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZV0gfHwgU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC53aGljaCkudG9VcHBlckNhc2UoKTtcblxuICAgIC8vIFJlbW92ZSB1bi1wcmludGFibGUgY2hhcmFjdGVycywgZS5nLiBmb3IgYGZyb21DaGFyQ29kZWAgY2FsbHMgZm9yIENUUkwgb25seSBldmVudHNcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXFxXKy8sICcnKTtcblxuICAgIGlmIChldmVudC5zaGlmdEtleSkga2V5ID0gYFNISUZUXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkpIGtleSA9IGBDVFJMXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmFsdEtleSkga2V5ID0gYEFMVF8ke2tleX1gO1xuXG4gICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHVuZGVyc2NvcmUsIGluIGNhc2Ugb25seSBtb2RpZmllcnMgd2VyZSB1c2VkIChlLmcuIG9ubHkgYENUUkxfQUxUYClcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXyQvLCAnJyk7XG5cbiAgICByZXR1cm4ga2V5O1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBnaXZlbiAoa2V5Ym9hcmQpIGV2ZW50XG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQncyBuYW1lLCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHBhcmFtIHtPYmplY3RzfSBmdW5jdGlvbnMgLSBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyB0aGF0IGFyZSB0byBiZSBleGVjdXRlZFxuICAgKi9cbiAgaGFuZGxlS2V5KGV2ZW50LCBjb21wb25lbnQsIGZ1bmN0aW9ucykge1xuICAgIHZhciBjb21tYW5kTGlzdCA9IGNvbW1hbmRzW2NvbXBvbmVudF0sXG4gICAgICBrZXlDb2RlID0gdGhpcy5wYXJzZUtleShldmVudCksXG4gICAgICBjbWRzLFxuICAgICAgY29tbWFuZCxcbiAgICAgIGZuO1xuXG4gICAgaWYgKCFjb21tYW5kTGlzdCkgcmV0dXJuIGNvbnNvbGUud2FybignQ29tcG9uZW50IG5vdCBkZWZpbmVkIScpO1xuXG4gICAgaWYgKHR5cGVvZiBjb21tYW5kTGlzdC5sdHIgPT09ICd1bmRlZmluZWQnKSB7IC8vIHRoaXMgY29tcG9uZW50IGRvZXMgbm90IGRpZmZlcmVudGlhdGUgYmV0d2VlbiBsdHIgYW5kIHJ0bFxuICAgICAgICBjbWRzID0gY29tbWFuZExpc3Q7IC8vIHVzZSBwbGFpbiBsaXN0XG4gICAgfSBlbHNlIHsgLy8gbWVyZ2UgbHRyIGFuZCBydGw6IGlmIGRvY3VtZW50IGlzIHJ0bCwgcnRsIG92ZXJ3cml0ZXMgbHRyIGFuZCB2aWNlIHZlcnNhXG4gICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0Lmx0ciwgY29tbWFuZExpc3QucnRsKTtcblxuICAgICAgICBlbHNlIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QucnRsLCBjb21tYW5kTGlzdC5sdHIpO1xuICAgIH1cbiAgICBjb21tYW5kID0gY21kc1trZXlDb2RlXTtcblxuICAgIGZuID0gZnVuY3Rpb25zW2NvbW1hbmRdO1xuICAgIGlmIChmbiAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiAgaWYgZXhpc3RzXG4gICAgICB2YXIgcmV0dXJuVmFsdWUgPSBmbi5hcHBseSgpO1xuICAgICAgaWYgKGZ1bmN0aW9ucy5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMuaGFuZGxlZChyZXR1cm5WYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChmdW5jdGlvbnMudW5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMudW5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgbm90IGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMudW5oYW5kbGVkKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgZ2l2ZW4gYCRlbGVtZW50YFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHNlYXJjaCB3aXRoaW5cbiAgICogQHJldHVybiB7alF1ZXJ5fSAkZm9jdXNhYmxlIC0gYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gYCRlbGVtZW50YFxuICAgKi9cbiAgZmluZEZvY3VzYWJsZSgkZWxlbWVudCkge1xuICAgIGlmKCEkZWxlbWVudCkge3JldHVybiBmYWxzZTsgfVxuICAgIHJldHVybiAkZWxlbWVudC5maW5kKCdhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSwgYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XSwgKltjb250ZW50ZWRpdGFibGVdJykuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEkKHRoaXMpLmlzKCc6dmlzaWJsZScpIHx8ICQodGhpcykuYXR0cigndGFiaW5kZXgnKSA8IDApIHsgcmV0dXJuIGZhbHNlOyB9IC8vb25seSBoYXZlIHZpc2libGUgZWxlbWVudHMgYW5kIHRob3NlIHRoYXQgaGF2ZSBhIHRhYmluZGV4IGdyZWF0ZXIgb3IgZXF1YWwgMFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbXBvbmVudCBuYW1lIG5hbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50LCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHJldHVybiBTdHJpbmcgY29tcG9uZW50TmFtZVxuICAgKi9cblxuICByZWdpc3Rlcihjb21wb25lbnROYW1lLCBjbWRzKSB7XG4gICAgY29tbWFuZHNbY29tcG9uZW50TmFtZV0gPSBjbWRzO1xuICB9LCAgXG5cbiAgLyoqXG4gICAqIFRyYXBzIHRoZSBmb2N1cyBpbiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byB0cmFwIHRoZSBmb3VjcyBpbnRvLlxuICAgKi9cbiAgdHJhcEZvY3VzKCRlbGVtZW50KSB7XG4gICAgdmFyICRmb2N1c2FibGUgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUoJGVsZW1lbnQpLFxuICAgICAgICAkZmlyc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKDApLFxuICAgICAgICAkbGFzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoLTEpO1xuXG4gICAgJGVsZW1lbnQub24oJ2tleWRvd24uemYudHJhcGZvY3VzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgPT09ICRsYXN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkZmlyc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGZpcnN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnU0hJRlRfVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkbGFzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICAvKipcbiAgICogUmVsZWFzZXMgdGhlIHRyYXBwZWQgZm9jdXMgZnJvbSB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byByZWxlYXNlIHRoZSBmb2N1cyBmb3IuXG4gICAqL1xuICByZWxlYXNlRm9jdXMoJGVsZW1lbnQpIHtcbiAgICAkZWxlbWVudC5vZmYoJ2tleWRvd24uemYudHJhcGZvY3VzJyk7XG4gIH1cbn1cblxuLypcbiAqIENvbnN0YW50cyBmb3IgZWFzaWVyIGNvbXBhcmluZy5cbiAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICovXG5mdW5jdGlvbiBnZXRLZXlDb2RlcyhrY3MpIHtcbiAgdmFyIGsgPSB7fTtcbiAgZm9yICh2YXIga2MgaW4ga2NzKSBrW2tjc1trY11dID0ga2NzW2tjXTtcbiAgcmV0dXJuIGs7XG59XG5cbkZvdW5kYXRpb24uS2V5Ym9hcmQgPSBLZXlib2FyZDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXG5jb25zdCBkZWZhdWx0UXVlcmllcyA9IHtcbiAgJ2RlZmF1bHQnIDogJ29ubHkgc2NyZWVuJyxcbiAgbGFuZHNjYXBlIDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxuICBwb3J0cmFpdCA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICByZXRpbmEgOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xufTtcblxudmFyIE1lZGlhUXVlcnkgPSB7XG4gIHF1ZXJpZXM6IFtdLFxuXG4gIGN1cnJlbnQ6ICcnLFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbWVkaWEgcXVlcnkgaGVscGVyLCBieSBleHRyYWN0aW5nIHRoZSBicmVha3BvaW50IGxpc3QgZnJvbSB0aGUgQ1NTIGFuZCBhY3RpdmF0aW5nIHRoZSBicmVha3BvaW50IHdhdGNoZXIuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBleHRyYWN0ZWRTdHlsZXMgPSAkKCcuZm91bmRhdGlvbi1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcbiAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZWRRdWVyaWVzKSB7XG4gICAgICBpZihuYW1lZFF1ZXJpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgIHZhbHVlOiBgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICR7bmFtZWRRdWVyaWVzW2tleV19KWBcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKTtcblxuICAgIHRoaXMuX3dhdGNoZXIoKTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCdzIHNtYWxsZXIuXG4gICAqL1xuICBhdExlYXN0KHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gbWF0Y2hlcyB0byBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2ssIGVpdGhlciAnc21hbGwgb25seScgb3IgJ3NtYWxsJy4gT21pdHRpbmcgJ29ubHknIGZhbGxzIGJhY2sgdG8gdXNpbmcgYXRMZWFzdCgpIG1ldGhvZC5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0IGRvZXMgbm90LlxuICAgKi9cbiAgaXMoc2l6ZSkge1xuICAgIHNpemUgPSBzaXplLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgIGlmKHNpemUubGVuZ3RoID4gMSAmJiBzaXplWzFdID09PSAnb25seScpIHtcbiAgICAgIGlmKHNpemVbMF0gPT09IHRoaXMuX2dldEN1cnJlbnRTaXplKCkpIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hdExlYXN0KHNpemVbMF0pO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1lZGlhIHF1ZXJ5IG9mIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBnZXQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gLSBUaGUgbWVkaWEgcXVlcnkgb2YgdGhlIGJyZWFrcG9pbnQsIG9yIGBudWxsYCBpZiB0aGUgYnJlYWtwb2ludCBkb2Vzbid0IGV4aXN0LlxuICAgKi9cbiAgZ2V0KHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgaWYodGhpcy5xdWVyaWVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgKi9cbiAgX2dldEN1cnJlbnRTaXplKCkge1xuICAgIHZhciBtYXRjaGVkO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5LnZhbHVlKS5tYXRjaGVzKSB7XG4gICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1hdGNoZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZC5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlcyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLCB3aGljaCBmaXJlcyBhbiBldmVudCBvbiB0aGUgd2luZG93IHdoZW5ldmVyIHRoZSBicmVha3BvaW50IGNoYW5nZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3dhdGNoZXIoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYubWVkaWFxdWVyeScsICgpID0+IHtcbiAgICAgIHZhciBuZXdTaXplID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSwgY3VycmVudFNpemUgPSB0aGlzLmN1cnJlbnQ7XG5cbiAgICAgIGlmIChuZXdTaXplICE9PSBjdXJyZW50U2l6ZSkge1xuICAgICAgICAvLyBDaGFuZ2UgdGhlIGN1cnJlbnQgbWVkaWEgcXVlcnlcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV3U2l6ZTtcblxuICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgICQod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgY3VycmVudFNpemVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuLy8gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2VcbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gIGlmICghc3R5bGVNZWRpYSkge1xuICAgIHZhciBzdHlsZSAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICBzY3JpcHQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgc2NyaXB0ICYmIHNjcmlwdC5wYXJlbnROb2RlICYmIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuICAgIC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgaW5mbyA9ICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG4gICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgIG1hdGNoTWVkaXVtKG1lZGlhKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gYEBtZWRpYSAke21lZGlhfXsgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9YDtcblxuICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgfTtcbiAgfVxufSgpKTtcblxuLy8gVGhhbmsgeW91OiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZ1xuZnVuY3Rpb24gcGFyc2VTdHlsZVRvT2JqZWN0KHN0cikge1xuICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcblxuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xuXG4gIGlmICghc3RyKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24ocmV0LCBwYXJhbSkge1xuICAgIHZhciBwYXJ0cyA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG4gICAgdmFyIGtleSA9IHBhcnRzWzBdO1xuICAgIHZhciB2YWwgPSBwYXJ0c1sxXTtcbiAgICBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5KTtcblxuICAgIC8vIG1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG4gICAgLy8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuICAgIHZhbCA9IHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZVVSSUNvbXBvbmVudCh2YWwpO1xuXG4gICAgaWYgKCFyZXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgcmV0W2tleV0gPSB2YWw7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJldFtrZXldKSkge1xuICAgICAgcmV0W2tleV0ucHVzaCh2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXRba2V5XSA9IFtyZXRba2V5XSwgdmFsXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSwge30pO1xuXG4gIHJldHVybiBzdHlsZU9iamVjdDtcbn1cblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIE1vdGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ubW90aW9uXG4gKi9cblxuY29uc3QgaW5pdENsYXNzZXMgICA9IFsnbXVpLWVudGVyJywgJ211aS1sZWF2ZSddO1xuY29uc3QgYWN0aXZlQ2xhc3NlcyA9IFsnbXVpLWVudGVyLWFjdGl2ZScsICdtdWktbGVhdmUtYWN0aXZlJ107XG5cbmNvbnN0IE1vdGlvbiA9IHtcbiAgYW5pbWF0ZUluOiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZSh0cnVlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfSxcblxuICBhbmltYXRlT3V0OiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZShmYWxzZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH1cbn1cblxuZnVuY3Rpb24gTW92ZShkdXJhdGlvbiwgZWxlbSwgZm4pe1xuICB2YXIgYW5pbSwgcHJvZywgc3RhcnQgPSBudWxsO1xuICAvLyBjb25zb2xlLmxvZygnY2FsbGVkJyk7XG5cbiAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG4gICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZSh0cyl7XG4gICAgaWYoIXN0YXJ0KSBzdGFydCA9IHRzO1xuICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0LCB0cyk7XG4gICAgcHJvZyA9IHRzIC0gc3RhcnQ7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG5cbiAgICBpZihwcm9nIDwgZHVyYXRpb24peyBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlLCBlbGVtKTsgfVxuICAgIGVsc2V7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbSk7XG4gICAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICB9XG4gIH1cbiAgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSk7XG59XG5cbi8qKlxuICogQW5pbWF0ZXMgYW4gZWxlbWVudCBpbiBvciBvdXQgdXNpbmcgYSBDU1MgdHJhbnNpdGlvbiBjbGFzcy5cbiAqIEBmdW5jdGlvblxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbiAtIERlZmluZXMgaWYgdGhlIGFuaW1hdGlvbiBpcyBpbiBvciBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvciBIVE1MIG9iamVjdCB0byBhbmltYXRlLlxuICogQHBhcmFtIHtTdHJpbmd9IGFuaW1hdGlvbiAtIENTUyBjbGFzcyB0byB1c2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIENhbGxiYWNrIHRvIHJ1biB3aGVuIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cbiAqL1xuZnVuY3Rpb24gYW5pbWF0ZShpc0luLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gIGVsZW1lbnQgPSAkKGVsZW1lbnQpLmVxKDApO1xuXG4gIGlmICghZWxlbWVudC5sZW5ndGgpIHJldHVybjtcblxuICB2YXIgaW5pdENsYXNzID0gaXNJbiA/IGluaXRDbGFzc2VzWzBdIDogaW5pdENsYXNzZXNbMV07XG4gIHZhciBhY3RpdmVDbGFzcyA9IGlzSW4gPyBhY3RpdmVDbGFzc2VzWzBdIDogYWN0aXZlQ2xhc3Nlc1sxXTtcblxuICAvLyBTZXQgdXAgdGhlIGFuaW1hdGlvblxuICByZXNldCgpO1xuXG4gIGVsZW1lbnRcbiAgICAuYWRkQ2xhc3MoYW5pbWF0aW9uKVxuICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgZWxlbWVudC5hZGRDbGFzcyhpbml0Q2xhc3MpO1xuICAgIGlmIChpc0luKSBlbGVtZW50LnNob3coKTtcbiAgfSk7XG5cbiAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGg7XG4gICAgZWxlbWVudFxuICAgICAgLmNzcygndHJhbnNpdGlvbicsICcnKVxuICAgICAgLmFkZENsYXNzKGFjdGl2ZUNsYXNzKTtcbiAgfSk7XG5cbiAgLy8gQ2xlYW4gdXAgdGhlIGFuaW1hdGlvbiB3aGVuIGl0IGZpbmlzaGVzXG4gIGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlbGVtZW50KSwgZmluaXNoKTtcblxuICAvLyBIaWRlcyB0aGUgZWxlbWVudCAoZm9yIG91dCBhbmltYXRpb25zKSwgcmVzZXRzIHRoZSBlbGVtZW50LCBhbmQgcnVucyBhIGNhbGxiYWNrXG4gIGZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICBpZiAoIWlzSW4pIGVsZW1lbnQuaGlkZSgpO1xuICAgIHJlc2V0KCk7XG4gICAgaWYgKGNiKSBjYi5hcHBseShlbGVtZW50KTtcbiAgfVxuXG4gIC8vIFJlc2V0cyB0cmFuc2l0aW9ucyBhbmQgcmVtb3ZlcyBtb3Rpb24tc3BlY2lmaWMgY2xhc3Nlc1xuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBlbGVtZW50WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IDA7XG4gICAgZWxlbWVudC5yZW1vdmVDbGFzcyhgJHtpbml0Q2xhc3N9ICR7YWN0aXZlQ2xhc3N9ICR7YW5pbWF0aW9ufWApO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTW92ZSA9IE1vdmU7XG5Gb3VuZGF0aW9uLk1vdGlvbiA9IE1vdGlvbjtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBOZXN0ID0ge1xuICBGZWF0aGVyKG1lbnUsIHR5cGUgPSAnemYnKSB7XG4gICAgbWVudS5hdHRyKCdyb2xlJywgJ21lbnViYXInKTtcblxuICAgIHZhciBpdGVtcyA9IG1lbnUuZmluZCgnbGknKS5hdHRyKHsncm9sZSc6ICdtZW51aXRlbSd9KSxcbiAgICAgICAgc3ViTWVudUNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudWAsXG4gICAgICAgIHN1Ykl0ZW1DbGFzcyA9IGAke3N1Yk1lbnVDbGFzc30taXRlbWAsXG4gICAgICAgIGhhc1N1YkNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudS1wYXJlbnRgO1xuXG4gICAgaXRlbXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuXG4gICAgICBpZiAoJHN1Yi5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW1cbiAgICAgICAgICAuYWRkQ2xhc3MoaGFzU3ViQ2xhc3MpXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGFzcG9wdXAnOiB0cnVlLFxuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiAkaXRlbS5jaGlsZHJlbignYTpmaXJzdCcpLnRleHQoKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIE5vdGU6ICBEcmlsbGRvd25zIGJlaGF2ZSBkaWZmZXJlbnRseSBpbiBob3cgdGhleSBoaWRlLCBhbmQgc28gbmVlZFxuICAgICAgICAgIC8vIGFkZGl0aW9uYWwgYXR0cmlidXRlcy4gIFdlIHNob3VsZCBsb29rIGlmIHRoaXMgcG9zc2libHkgb3Zlci1nZW5lcmFsaXplZFxuICAgICAgICAgIC8vIHV0aWxpdHkgKE5lc3QpIGlzIGFwcHJvcHJpYXRlIHdoZW4gd2UgcmV3b3JrIG1lbnVzIGluIDYuNFxuICAgICAgICAgIGlmKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgICAkaXRlbS5hdHRyKHsnYXJpYS1leHBhbmRlZCc6IGZhbHNlfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICRzdWJcbiAgICAgICAgICAuYWRkQ2xhc3MoYHN1Ym1lbnUgJHtzdWJNZW51Q2xhc3N9YClcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnZGF0YS1zdWJtZW51JzogJycsXG4gICAgICAgICAgICAncm9sZSc6ICdtZW51J1xuICAgICAgICAgIH0pO1xuICAgICAgICBpZih0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICRzdWIuYXR0cih7J2FyaWEtaGlkZGVuJzogdHJ1ZX0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICgkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtLmFkZENsYXNzKGBpcy1zdWJtZW51LWl0ZW0gJHtzdWJJdGVtQ2xhc3N9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgQnVybihtZW51LCB0eXBlKSB7XG4gICAgdmFyIC8vaXRlbXMgPSBtZW51LmZpbmQoJ2xpJyksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIG1lbnVcbiAgICAgIC5maW5kKCc+bGksIC5tZW51LCAubWVudSA+IGxpJylcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHtzdWJNZW51Q2xhc3N9ICR7c3ViSXRlbUNsYXNzfSAke2hhc1N1YkNsYXNzfSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmVgKVxuICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpLmNzcygnZGlzcGxheScsICcnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCAgICAgIG1lbnUuZmluZCgnLicgKyBzdWJNZW51Q2xhc3MgKyAnLCAuJyArIHN1Ykl0ZW1DbGFzcyArICcsIC5oYXMtc3VibWVudSwgLmlzLXN1Ym1lbnUtaXRlbSwgLnN1Ym1lbnUsIFtkYXRhLXN1Ym1lbnVdJylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUNsYXNzKHN1Yk1lbnVDbGFzcyArICcgJyArIHN1Ykl0ZW1DbGFzcyArICcgaGFzLXN1Ym1lbnUgaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUnKVxuICAgIC8vICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykpO1xuICAgIC8vIGl0ZW1zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAvLyAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgLy8gICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuICAgIC8vICAgaWYoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdpcy1zdWJtZW51LWl0ZW0gJyArIHN1Ykl0ZW1DbGFzcyk7XG4gICAgLy8gICB9XG4gICAgLy8gICBpZigkc3ViLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdoYXMtc3VibWVudScpO1xuICAgIC8vICAgICAkc3ViLnJlbW92ZUNsYXNzKCdzdWJtZW51ICcgKyBzdWJNZW51Q2xhc3MpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpO1xuICAgIC8vICAgfVxuICAgIC8vIH0pO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTmVzdCA9IE5lc3Q7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuZnVuY3Rpb24gVGltZXIoZWxlbSwgb3B0aW9ucywgY2IpIHtcbiAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgIGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiwvL29wdGlvbnMgaXMgYW4gb2JqZWN0IGZvciBlYXNpbHkgYWRkaW5nIGZlYXR1cmVzIGxhdGVyLlxuICAgICAgbmFtZVNwYWNlID0gT2JqZWN0LmtleXMoZWxlbS5kYXRhKCkpWzBdIHx8ICd0aW1lcicsXG4gICAgICByZW1haW4gPSAtMSxcbiAgICAgIHN0YXJ0LFxuICAgICAgdGltZXI7XG5cbiAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuXG4gIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHJlbWFpbiA9IC0xO1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGhpcy5zdGFydCgpO1xuICB9XG5cbiAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAvLyBpZighZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiA8PSAwID8gZHVyYXRpb24gOiByZW1haW47XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCBmYWxzZSk7XG4gICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgaWYob3B0aW9ucy5pbmZpbml0ZSl7XG4gICAgICAgIF90aGlzLnJlc3RhcnQoKTsvL3JlcnVuIHRoZSB0aW1lci5cbiAgICAgIH1cbiAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICAgIH0sIHJlbWFpbik7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnN0YXJ0LnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG5cbiAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xuICAgIC8vaWYoZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgdHJ1ZSk7XG4gICAgdmFyIGVuZCA9IERhdGUubm93KCk7XG4gICAgcmVtYWluID0gcmVtYWluIC0gKGVuZCAtIHN0YXJ0KTtcbiAgICBlbGVtLnRyaWdnZXIoYHRpbWVycGF1c2VkLnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogUnVucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuXG4gKiBAcGFyYW0ge09iamVjdH0gaW1hZ2VzIC0gSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gKi9cbmZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKGltYWdlcywgY2FsbGJhY2spe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIGltYWdlcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIC8vIENoZWNrIGlmIGltYWdlIGlzIGxvYWRlZFxuICAgIGlmICh0aGlzLmNvbXBsZXRlIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09IDQpIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpKSB7XG4gICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgIH1cbiAgICAvLyBGb3JjZSBsb2FkIHRoZSBpbWFnZVxuICAgIGVsc2Uge1xuICAgICAgLy8gZml4IGZvciBJRS4gU2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vc25pcHBldHMvanF1ZXJ5L2ZpeGluZy1sb2FkLWluLWllLWZvci1jYWNoZWQtaW1hZ2VzL1xuICAgICAgdmFyIHNyYyA9ICQodGhpcykuYXR0cignc3JjJyk7XG4gICAgICAkKHRoaXMpLmF0dHIoJ3NyYycsIHNyYyArICc/JyArIChuZXcgRGF0ZSgpLmdldFRpbWUoKSkpO1xuICAgICAgJCh0aGlzKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2luZ2xlSW1hZ2VMb2FkZWQoKSB7XG4gICAgdW5sb2FkZWQtLTtcbiAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG59XG5cbkZvdW5kYXRpb24uVGltZXIgPSBUaW1lcjtcbkZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQgPSBvbkltYWdlc0xvYWRlZDtcblxufShqUXVlcnkpO1xuIiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKldvcmsgaW5zcGlyZWQgYnkgbXVsdGlwbGUganF1ZXJ5IHN3aXBlIHBsdWdpbnMqKlxuLy8qKkRvbmUgYnkgWW9oYWkgQXJhcmF0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKGZ1bmN0aW9uKCQpIHtcblxuICAkLnNwb3RTd2lwZSA9IHtcbiAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgIGVuYWJsZWQ6ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcbiAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2UsXG4gICAgbW92ZVRocmVzaG9sZDogNzUsXG4gICAgdGltZVRocmVzaG9sZDogMjAwXG4gIH07XG5cbiAgdmFyICAgc3RhcnRQb3NYLFxuICAgICAgICBzdGFydFBvc1ksXG4gICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgZWxhcHNlZFRpbWUsXG4gICAgICAgIGlzTW92aW5nID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gb25Ub3VjaEVuZCgpIHtcbiAgICAvLyAgYWxlcnQodGhpcyk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQpO1xuICAgIGlzTW92aW5nID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBvblRvdWNoTW92ZShlKSB7XG4gICAgaWYgKCQuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0KSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICAgIGlmKGlzTW92aW5nKSB7XG4gICAgICB2YXIgeCA9IGUudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgIHZhciB5ID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgdmFyIGR4ID0gc3RhcnRQb3NYIC0geDtcbiAgICAgIHZhciBkeSA9IHN0YXJ0UG9zWSAtIHk7XG4gICAgICB2YXIgZGlyO1xuICAgICAgZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0VGltZTtcbiAgICAgIGlmKE1hdGguYWJzKGR4KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcbiAgICAgICAgZGlyID0gZHggPiAwID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICAgIH1cbiAgICAgIC8vIGVsc2UgaWYoTWF0aC5hYnMoZHkpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgLy8gICBkaXIgPSBkeSA+IDAgPyAnZG93bicgOiAndXAnO1xuICAgICAgLy8gfVxuICAgICAgaWYoZGlyKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb25Ub3VjaEVuZC5jYWxsKHRoaXMpO1xuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ3N3aXBlJywgZGlyKS50cmlnZ2VyKGBzd2lwZSR7ZGlyfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hTdGFydChlKSB7XG4gICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgc3RhcnRQb3NYID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgc3RhcnRQb3NZID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgaXNNb3ZpbmcgPSB0cnVlO1xuICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyICYmIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgZmFsc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGVhcmRvd24oKSB7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcbiAgfVxuXG4gICQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHsgc2V0dXA6IGluaXQgfTtcblxuICAkLmVhY2goWydsZWZ0JywgJ3VwJywgJ2Rvd24nLCAncmlnaHQnXSwgZnVuY3Rpb24gKCkge1xuICAgICQuZXZlbnQuc3BlY2lhbFtgc3dpcGUke3RoaXN9YF0gPSB7IHNldHVwOiBmdW5jdGlvbigpe1xuICAgICAgJCh0aGlzKS5vbignc3dpcGUnLCAkLm5vb3ApO1xuICAgIH0gfTtcbiAgfSk7XG59KShqUXVlcnkpO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1ldGhvZCBmb3IgYWRkaW5nIHBzdWVkbyBkcmFnIGV2ZW50cyB0byBlbGVtZW50cyAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuIWZ1bmN0aW9uKCQpe1xuICAkLmZuLmFkZFRvdWNoID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSxlbCl7XG4gICAgICAkKGVsKS5iaW5kKCd0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbCcsZnVuY3Rpb24oKXtcbiAgICAgICAgLy93ZSBwYXNzIHRoZSBvcmlnaW5hbCBldmVudCBvYmplY3QgYmVjYXVzZSB0aGUgalF1ZXJ5IGV2ZW50XG4gICAgICAgIC8vb2JqZWN0IGlzIG5vcm1hbGl6ZWQgdG8gdzNjIHNwZWNzIGFuZCBkb2VzIG5vdCBwcm92aWRlIHRoZSBUb3VjaExpc3RcbiAgICAgICAgaGFuZGxlVG91Y2goZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgaGFuZGxlVG91Y2ggPSBmdW5jdGlvbihldmVudCl7XG4gICAgICB2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxuICAgICAgICAgIGZpcnN0ID0gdG91Y2hlc1swXSxcbiAgICAgICAgICBldmVudFR5cGVzID0ge1xuICAgICAgICAgICAgdG91Y2hzdGFydDogJ21vdXNlZG93bicsXG4gICAgICAgICAgICB0b3VjaG1vdmU6ICdtb3VzZW1vdmUnLFxuICAgICAgICAgICAgdG91Y2hlbmQ6ICdtb3VzZXVwJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHlwZSA9IGV2ZW50VHlwZXNbZXZlbnQudHlwZV0sXG4gICAgICAgICAgc2ltdWxhdGVkRXZlbnRcbiAgICAgICAgO1xuXG4gICAgICBpZignTW91c2VFdmVudCcgaW4gd2luZG93ICYmIHR5cGVvZiB3aW5kb3cuTW91c2VFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IG5ldyB3aW5kb3cuTW91c2VFdmVudCh0eXBlLCB7XG4gICAgICAgICAgJ2J1YmJsZXMnOiB0cnVlLFxuICAgICAgICAgICdjYW5jZWxhYmxlJzogdHJ1ZSxcbiAgICAgICAgICAnc2NyZWVuWCc6IGZpcnN0LnNjcmVlblgsXG4gICAgICAgICAgJ3NjcmVlblknOiBmaXJzdC5zY3JlZW5ZLFxuICAgICAgICAgICdjbGllbnRYJzogZmlyc3QuY2xpZW50WCxcbiAgICAgICAgICAnY2xpZW50WSc6IGZpcnN0LmNsaWVudFlcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50Jyk7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50LmluaXRNb3VzZUV2ZW50KHR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMSwgZmlyc3Quc2NyZWVuWCwgZmlyc3Quc2NyZWVuWSwgZmlyc3QuY2xpZW50WCwgZmlyc3QuY2xpZW50WSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAvKmxlZnQqLywgbnVsbCk7XG4gICAgICB9XG4gICAgICBmaXJzdC50YXJnZXQuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XG4gICAgfTtcbiAgfTtcbn0oalF1ZXJ5KTtcblxuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKipGcm9tIHRoZSBqUXVlcnkgTW9iaWxlIExpYnJhcnkqKlxuLy8qKm5lZWQgdG8gcmVjcmVhdGUgZnVuY3Rpb25hbGl0eSoqXG4vLyoqYW5kIHRyeSB0byBpbXByb3ZlIGlmIHBvc3NpYmxlKipcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vKiBSZW1vdmluZyB0aGUgalF1ZXJ5IGZ1bmN0aW9uICoqKipcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4oZnVuY3Rpb24oICQsIHdpbmRvdywgdW5kZWZpbmVkICkge1xuXG5cdHZhciAkZG9jdW1lbnQgPSAkKCBkb2N1bWVudCApLFxuXHRcdC8vIHN1cHBvcnRUb3VjaCA9ICQubW9iaWxlLnN1cHBvcnQudG91Y2gsXG5cdFx0dG91Y2hTdGFydEV2ZW50ID0gJ3RvdWNoc3RhcnQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoc3RhcnRcIiA6IFwibW91c2Vkb3duXCIsXG5cdFx0dG91Y2hTdG9wRXZlbnQgPSAndG91Y2hlbmQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoZW5kXCIgOiBcIm1vdXNldXBcIixcblx0XHR0b3VjaE1vdmVFdmVudCA9ICd0b3VjaG1vdmUnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNobW92ZVwiIDogXCJtb3VzZW1vdmVcIjtcblxuXHQvLyBzZXR1cCBuZXcgZXZlbnQgc2hvcnRjdXRzXG5cdCQuZWFjaCggKCBcInRvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIFwiICtcblx0XHRcInN3aXBlIHN3aXBlbGVmdCBzd2lwZXJpZ2h0XCIgKS5zcGxpdCggXCIgXCIgKSwgZnVuY3Rpb24oIGksIG5hbWUgKSB7XG5cblx0XHQkLmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggZm4gKSB7XG5cdFx0XHRyZXR1cm4gZm4gPyB0aGlzLmJpbmQoIG5hbWUsIGZuICkgOiB0aGlzLnRyaWdnZXIoIG5hbWUgKTtcblx0XHR9O1xuXG5cdFx0Ly8galF1ZXJ5IDwgMS44XG5cdFx0aWYgKCAkLmF0dHJGbiApIHtcblx0XHRcdCQuYXR0ckZuWyBuYW1lIF0gPSB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0ZnVuY3Rpb24gdHJpZ2dlckN1c3RvbUV2ZW50KCBvYmosIGV2ZW50VHlwZSwgZXZlbnQsIGJ1YmJsZSApIHtcblx0XHR2YXIgb3JpZ2luYWxUeXBlID0gZXZlbnQudHlwZTtcblx0XHRldmVudC50eXBlID0gZXZlbnRUeXBlO1xuXHRcdGlmICggYnViYmxlICkge1xuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBldmVudCwgdW5kZWZpbmVkLCBvYmogKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JC5ldmVudC5kaXNwYXRjaC5jYWxsKCBvYmosIGV2ZW50ICk7XG5cdFx0fVxuXHRcdGV2ZW50LnR5cGUgPSBvcmlnaW5hbFR5cGU7XG5cdH1cblxuXHQvLyBhbHNvIGhhbmRsZXMgdGFwaG9sZFxuXG5cdC8vIEFsc28gaGFuZGxlcyBzd2lwZWxlZnQsIHN3aXBlcmlnaHRcblx0JC5ldmVudC5zcGVjaWFsLnN3aXBlID0ge1xuXG5cdFx0Ly8gTW9yZSB0aGFuIHRoaXMgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQsIGFuZCB3ZSB3aWxsIHN1cHByZXNzIHNjcm9sbGluZy5cblx0XHRzY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkOiAzMCxcblxuXHRcdC8vIE1vcmUgdGltZSB0aGFuIHRoaXMsIGFuZCBpdCBpc24ndCBhIHN3aXBlLlxuXHRcdGR1cmF0aW9uVGhyZXNob2xkOiAxMDAwLFxuXG5cdFx0Ly8gU3dpcGUgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBtb3JlIHRoYW4gdGhpcy5cblx0XHRob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Ly8gU3dpcGUgdmVydGljYWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbGVzcyB0aGFuIHRoaXMuXG5cdFx0dmVydGljYWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHRnZXRMb2NhdGlvbjogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdHZhciB3aW5QYWdlWCA9IHdpbmRvdy5wYWdlWE9mZnNldCxcblx0XHRcdFx0d2luUGFnZVkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG5cdFx0XHRcdHggPSBldmVudC5jbGllbnRYLFxuXHRcdFx0XHR5ID0gZXZlbnQuY2xpZW50WTtcblxuXHRcdFx0aWYgKCBldmVudC5wYWdlWSA9PT0gMCAmJiBNYXRoLmZsb29yKCB5ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWSApIHx8XG5cdFx0XHRcdGV2ZW50LnBhZ2VYID09PSAwICYmIE1hdGguZmxvb3IoIHggKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gaU9TNCBjbGllbnRYL2NsaWVudFkgaGF2ZSB0aGUgdmFsdWUgdGhhdCBzaG91bGQgaGF2ZSBiZWVuXG5cdFx0XHRcdC8vIGluIHBhZ2VYL3BhZ2VZLiBXaGlsZSBwYWdlWC9wYWdlLyBoYXZlIHRoZSB2YWx1ZSAwXG5cdFx0XHRcdHggPSB4IC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSB5IC0gd2luUGFnZVk7XG5cdFx0XHR9IGVsc2UgaWYgKCB5IDwgKCBldmVudC5wYWdlWSAtIHdpblBhZ2VZKSB8fCB4IDwgKCBldmVudC5wYWdlWCAtIHdpblBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gU29tZSBBbmRyb2lkIGJyb3dzZXJzIGhhdmUgdG90YWxseSBib2d1cyB2YWx1ZXMgZm9yIGNsaWVudFgvWVxuXHRcdFx0XHQvLyB3aGVuIHNjcm9sbGluZy96b29taW5nIGEgcGFnZS4gRGV0ZWN0YWJsZSBzaW5jZSBjbGllbnRYL2NsaWVudFlcblx0XHRcdFx0Ly8gc2hvdWxkIG5ldmVyIGJlIHNtYWxsZXIgdGhhbiBwYWdlWC9wYWdlWSBtaW51cyBwYWdlIHNjcm9sbFxuXHRcdFx0XHR4ID0gZXZlbnQucGFnZVggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IGV2ZW50LnBhZ2VZIC0gd2luUGFnZVk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHg6IHgsXG5cdFx0XHRcdHk6IHlcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdLFxuXHRcdFx0XHRcdFx0b3JpZ2luOiAkKCBldmVudC50YXJnZXQgKVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF1cblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRoYW5kbGVTd2lwZTogZnVuY3Rpb24oIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICkge1xuXHRcdFx0aWYgKCBzdG9wLnRpbWUgLSBzdGFydC50aW1lIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLmR1cmF0aW9uVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMSBdIC0gc3RvcC5jb29yZHNbIDEgXSApIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLnZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQgKSB7XG5cdFx0XHRcdHZhciBkaXJlY3Rpb24gPSBzdGFydC5jb29yZHNbMF0gPiBzdG9wLmNvb3Jkc1sgMCBdID8gXCJzd2lwZWxlZnRcIiA6IFwic3dpcGVyaWdodFwiO1xuXG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgXCJzd2lwZVwiLCAkLkV2ZW50KCBcInN3aXBlXCIsIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0pLCB0cnVlICk7XG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgZGlyZWN0aW9uLCQuRXZlbnQoIGRpcmVjdGlvbiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSApLCB0cnVlICk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fSxcblxuXHRcdC8vIFRoaXMgc2VydmVzIGFzIGEgZmxhZyB0byBlbnN1cmUgdGhhdCBhdCBtb3N0IG9uZSBzd2lwZSBldmVudCBldmVudCBpc1xuXHRcdC8vIGluIHdvcmsgYXQgYW55IGdpdmVuIHRpbWVcblx0XHRldmVudEluUHJvZ3Jlc3M6IGZhbHNlLFxuXG5cdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cyxcblx0XHRcdFx0dGhpc09iamVjdCA9IHRoaXMsXG5cdFx0XHRcdCR0aGlzID0gJCggdGhpc09iamVjdCApLFxuXHRcdFx0XHRjb250ZXh0ID0ge307XG5cblx0XHRcdC8vIFJldHJpZXZlIHRoZSBldmVudHMgZGF0YSBmb3IgdGhpcyBlbGVtZW50IGFuZCBhZGQgdGhlIHN3aXBlIGNvbnRleHRcblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggIWV2ZW50cyApIHtcblx0XHRcdFx0ZXZlbnRzID0geyBsZW5ndGg6IDAgfTtcblx0XHRcdFx0JC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiwgZXZlbnRzICk7XG5cdFx0XHR9XG5cdFx0XHRldmVudHMubGVuZ3RoKys7XG5cdFx0XHRldmVudHMuc3dpcGUgPSBjb250ZXh0O1xuXG5cdFx0XHRjb250ZXh0LnN0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0XHRcdC8vIEJhaWwgaWYgd2UncmUgYWxyZWFkeSB3b3JraW5nIG9uIGEgc3dpcGUgZXZlbnRcblx0XHRcdFx0aWYgKCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gdHJ1ZTtcblxuXHRcdFx0XHR2YXIgc3RvcCxcblx0XHRcdFx0XHRzdGFydCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdGFydCggZXZlbnQgKSxcblx0XHRcdFx0XHRvcmlnVGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdFx0XHRcdGVtaXR0ZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0aWYgKCAhc3RhcnQgfHwgZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c3RvcCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdG9wKCBldmVudCApO1xuXHRcdFx0XHRcdGlmICggIWVtaXR0ZWQgKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhhbmRsZVN3aXBlKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApO1xuXHRcdFx0XHRcdFx0aWYgKCBlbWl0dGVkICkge1xuXG5cdFx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHByZXZlbnQgc2Nyb2xsaW5nXG5cdFx0XHRcdFx0aWYgKCBNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZCApIHtcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNvbnRleHQuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5tb3ZlID0gbnVsbDtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkZG9jdW1lbnQub24oIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKVxuXHRcdFx0XHRcdC5vbmUoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdH07XG5cdFx0XHQkdGhpcy5vbiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0fSxcblxuXHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsIGNvbnRleHQ7XG5cblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggZXZlbnRzICkge1xuXHRcdFx0XHRjb250ZXh0ID0gZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRkZWxldGUgZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRldmVudHMubGVuZ3RoLS07XG5cdFx0XHRcdGlmICggZXZlbnRzLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0XHQkLnJlbW92ZURhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBjb250ZXh0ICkge1xuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RhcnQgKSB7XG5cdFx0XHRcdFx0JCggdGhpcyApLm9mZiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0Lm1vdmUgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5zdG9wICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0JC5lYWNoKHtcblx0XHRzd2lwZWxlZnQ6IFwic3dpcGUubGVmdFwiLFxuXHRcdHN3aXBlcmlnaHQ6IFwic3dpcGUucmlnaHRcIlxuXHR9LCBmdW5jdGlvbiggZXZlbnQsIHNvdXJjZUV2ZW50ICkge1xuXG5cdFx0JC5ldmVudC5zcGVjaWFsWyBldmVudCBdID0ge1xuXHRcdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkuYmluZCggc291cmNlRXZlbnQsICQubm9vcCApO1xuXHRcdFx0fSxcblx0XHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLnVuYmluZCggc291cmNlRXZlbnQgKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcbn0pKCBqUXVlcnksIHRoaXMgKTtcbiovXG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcHJlZml4ZXMgPSBbJ1dlYktpdCcsICdNb3onLCAnTycsICdNcycsICcnXTtcbiAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmAgaW4gd2luZG93KSB7XG4gICAgICByZXR1cm4gd2luZG93W2Ake3ByZWZpeGVzW2ldfU11dGF0aW9uT2JzZXJ2ZXJgXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSgpKTtcblxuY29uc3QgdHJpZ2dlcnMgPSAoZWwsIHR5cGUpID0+IHtcbiAgZWwuZGF0YSh0eXBlKS5zcGxpdCgnICcpLmZvckVhY2goaWQgPT4ge1xuICAgICQoYCMke2lkfWApWyB0eXBlID09PSAnY2xvc2UnID8gJ3RyaWdnZXInIDogJ3RyaWdnZXJIYW5kbGVyJ10oYCR7dHlwZX0uemYudHJpZ2dlcmAsIFtlbF0pO1xuICB9KTtcbn07XG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLW9wZW5dIHdpbGwgcmV2ZWFsIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtb3Blbl0nLCBmdW5jdGlvbigpIHtcbiAgdHJpZ2dlcnMoJCh0aGlzKSwgJ29wZW4nKTtcbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NlXSB3aWxsIGNsb3NlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuLy8gSWYgdXNlZCB3aXRob3V0IGEgdmFsdWUgb24gW2RhdGEtY2xvc2VdLCB0aGUgZXZlbnQgd2lsbCBidWJibGUsIGFsbG93aW5nIGl0IHRvIGNsb3NlIGEgcGFyZW50IGNvbXBvbmVudC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ2Nsb3NlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICdjbG9zZScpO1xuICB9XG4gIGVsc2Uge1xuICAgICQodGhpcykudHJpZ2dlcignY2xvc2UuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS10b2dnbGVdIHdpbGwgdG9nZ2xlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZScpO1xuICBpZiAoaWQpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAndG9nZ2xlJyk7XG4gIH0gZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCd0b2dnbGUuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zYWJsZV0gd2lsbCByZXNwb25kIHRvIGNsb3NlLnpmLnRyaWdnZXIgZXZlbnRzLlxuJChkb2N1bWVudCkub24oJ2Nsb3NlLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2FibGVdJywgZnVuY3Rpb24oZSl7XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGxldCBhbmltYXRpb24gPSAkKHRoaXMpLmRhdGEoJ2Nsb3NhYmxlJyk7XG5cbiAgaWYoYW5pbWF0aW9uICE9PSAnJyl7XG4gICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZU91dCgkKHRoaXMpLCBhbmltYXRpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICB9KTtcbiAgfWVsc2V7XG4gICAgJCh0aGlzKS5mYWRlT3V0KCkudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gIH1cbn0pO1xuXG4kKGRvY3VtZW50KS5vbignZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlLWZvY3VzXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZS1mb2N1cycpO1xuICAkKGAjJHtpZH1gKS50cmlnZ2VySGFuZGxlcigndG9nZ2xlLnpmLnRyaWdnZXInLCBbJCh0aGlzKV0pO1xufSk7XG5cbi8qKlxuKiBGaXJlcyBvbmNlIGFmdGVyIGFsbCBvdGhlciBzY3JpcHRzIGhhdmUgbG9hZGVkXG4qIEBmdW5jdGlvblxuKiBAcHJpdmF0ZVxuKi9cbiQod2luZG93KS5vbignbG9hZCcsICgpID0+IHtcbiAgY2hlY2tMaXN0ZW5lcnMoKTtcbn0pO1xuXG5mdW5jdGlvbiBjaGVja0xpc3RlbmVycygpIHtcbiAgZXZlbnRzTGlzdGVuZXIoKTtcbiAgcmVzaXplTGlzdGVuZXIoKTtcbiAgc2Nyb2xsTGlzdGVuZXIoKTtcbiAgbXV0YXRlTGlzdGVuZXIoKTtcbiAgY2xvc2VtZUxpc3RlbmVyKCk7XG59XG5cbi8vKioqKioqKiogb25seSBmaXJlcyB0aGlzIGZ1bmN0aW9uIG9uY2Ugb24gbG9hZCwgaWYgdGhlcmUncyBzb21ldGhpbmcgdG8gd2F0Y2ggKioqKioqKipcbmZ1bmN0aW9uIGNsb3NlbWVMaXN0ZW5lcihwbHVnaW5OYW1lKSB7XG4gIHZhciB5ZXRpQm94ZXMgPSAkKCdbZGF0YS15ZXRpLWJveF0nKSxcbiAgICAgIHBsdWdOYW1lcyA9IFsnZHJvcGRvd24nLCAndG9vbHRpcCcsICdyZXZlYWwnXTtcblxuICBpZihwbHVnaW5OYW1lKXtcbiAgICBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ3N0cmluZycpe1xuICAgICAgcGx1Z05hbWVzLnB1c2gocGx1Z2luTmFtZSk7XG4gICAgfWVsc2UgaWYodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwbHVnaW5OYW1lWzBdID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMuY29uY2F0KHBsdWdpbk5hbWUpO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcignUGx1Z2luIG5hbWVzIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgfVxuICBpZih5ZXRpQm94ZXMubGVuZ3RoKXtcbiAgICBsZXQgbGlzdGVuZXJzID0gcGx1Z05hbWVzLm1hcCgobmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIGBjbG9zZW1lLnpmLiR7bmFtZX1gO1xuICAgIH0pLmpvaW4oJyAnKTtcblxuICAgICQod2luZG93KS5vZmYobGlzdGVuZXJzKS5vbihsaXN0ZW5lcnMsIGZ1bmN0aW9uKGUsIHBsdWdpbklkKXtcbiAgICAgIGxldCBwbHVnaW4gPSBlLm5hbWVzcGFjZS5zcGxpdCgnLicpWzBdO1xuICAgICAgbGV0IHBsdWdpbnMgPSAkKGBbZGF0YS0ke3BsdWdpbn1dYCkubm90KGBbZGF0YS15ZXRpLWJveD1cIiR7cGx1Z2luSWR9XCJdYCk7XG5cbiAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICBsZXQgX3RoaXMgPSAkKHRoaXMpO1xuXG4gICAgICAgIF90aGlzLnRyaWdnZXJIYW5kbGVyKCdjbG9zZS56Zi50cmlnZ2VyJywgW190aGlzXSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNpemVMaXN0ZW5lcihkZWJvdW5jZSl7XG4gIGxldCB0aW1lcixcbiAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXJlc2l6ZV0nKTtcbiAgaWYoJG5vZGVzLmxlbmd0aCl7XG4gICAgJCh3aW5kb3cpLm9mZigncmVzaXplLnpmLnRyaWdnZXInKVxuICAgIC5vbigncmVzaXplLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICBpZighTXV0YXRpb25PYnNlcnZlcil7Ly9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHJlc2l6ZSBldmVudFxuICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInJlc2l6ZVwiKTtcbiAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsvL2RlZmF1bHQgdGltZSB0byBlbWl0IHJlc2l6ZSBldmVudFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNjcm9sbExpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtc2Nyb2xsXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYudHJpZ2dlcicpXG4gICAgLm9uKCdzY3JvbGwuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYodGltZXIpeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgc2Nyb2xsIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwic2Nyb2xsXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgc2Nyb2xsIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbXV0YXRlTGlzdGVuZXIoZGVib3VuY2UpIHtcbiAgICBsZXQgJG5vZGVzID0gJCgnW2RhdGEtbXV0YXRlXScpO1xuICAgIGlmICgkbm9kZXMubGVuZ3RoICYmIE11dGF0aW9uT2JzZXJ2ZXIpe1xuXHRcdFx0Ly90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIG11dGF0ZSBldmVudFxuICAgICAgLy9ubyBJRSA5IG9yIDEwXG5cdFx0XHQkbm9kZXMuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInKTtcblx0XHRcdH0pO1xuICAgIH1cbiB9XG5cbmZ1bmN0aW9uIGV2ZW50c0xpc3RlbmVyKCkge1xuICBpZighTXV0YXRpb25PYnNlcnZlcil7IHJldHVybiBmYWxzZTsgfVxuICBsZXQgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1yZXNpemVdLCBbZGF0YS1zY3JvbGxdLCBbZGF0YS1tdXRhdGVdJyk7XG5cbiAgLy9lbGVtZW50IGNhbGxiYWNrXG4gIHZhciBsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uID0gZnVuY3Rpb24gKG11dGF0aW9uUmVjb3Jkc0xpc3QpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gJChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnRhcmdldCk7XG5cblx0ICAvL3RyaWdnZXIgdGhlIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBlbGVtZW50IGRlcGVuZGluZyBvbiB0eXBlXG4gICAgICBzd2l0Y2ggKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udHlwZSkge1xuXG4gICAgICAgIGNhc2UgXCJhdHRyaWJ1dGVzXCI6XG4gICAgICAgICAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInNjcm9sbFwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG5cdFx0ICBcdCR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInLCBbJHRhcmdldCwgd2luZG93LnBhZ2VZT2Zmc2V0XSk7XG5cdFx0ICB9XG5cdFx0ICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwicmVzaXplXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcblx0XHQgIFx0JHRhcmdldC50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0XSk7XG5cdFx0ICAgfVxuXHRcdCAgaWYgKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJzdHlsZVwiKSB7XG5cdFx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIik7XG5cdFx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuXHRcdCAgfVxuXHRcdCAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImNoaWxkTGlzdFwiOlxuXHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKTtcblx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvL25vdGhpbmdcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuICAgICAgLy9mb3IgZWFjaCBlbGVtZW50IHRoYXQgbmVlZHMgdG8gbGlzdGVuIGZvciByZXNpemluZywgc2Nyb2xsaW5nLCBvciBtdXRhdGlvbiBhZGQgYSBzaW5nbGUgb2JzZXJ2ZXJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG5vZGVzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB2YXIgZWxlbWVudE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbik7XG4gICAgICAgIGVsZW1lbnRPYnNlcnZlci5vYnNlcnZlKG5vZGVzW2ldLCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZUZpbHRlcjogW1wiZGF0YS1ldmVudHNcIiwgXCJzdHlsZVwiXSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFtQSF1cbi8vIEZvdW5kYXRpb24uQ2hlY2tXYXRjaGVycyA9IGNoZWNrV2F0Y2hlcnM7XG5Gb3VuZGF0aW9uLklIZWFyWW91ID0gY2hlY2tMaXN0ZW5lcnM7XG4vLyBGb3VuZGF0aW9uLklTZWVZb3UgPSBzY3JvbGxMaXN0ZW5lcjtcbi8vIEZvdW5kYXRpb24uSUZlZWxZb3UgPSBjbG9zZW1lTGlzdGVuZXI7XG5cbn0oalF1ZXJ5KTtcblxuLy8gZnVuY3Rpb24gZG9tTXV0YXRpb25PYnNlcnZlcihkZWJvdW5jZSkge1xuLy8gICAvLyAhISEgVGhpcyBpcyBjb21pbmcgc29vbiBhbmQgbmVlZHMgbW9yZSB3b3JrOyBub3QgYWN0aXZlICAhISEgLy9cbi8vICAgdmFyIHRpbWVyLFxuLy8gICBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLW11dGF0ZV0nKTtcbi8vICAgLy9cbi8vICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuLy8gICAgIC8vIHZhciBNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbi8vICAgICAvLyAgIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuLy8gICAgIC8vICAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbi8vICAgICAvLyAgICAgaWYgKHByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInIGluIHdpbmRvdykge1xuLy8gICAgIC8vICAgICAgIHJldHVybiB3aW5kb3dbcHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlciddO1xuLy8gICAgIC8vICAgICB9XG4vLyAgICAgLy8gICB9XG4vLyAgICAgLy8gICByZXR1cm4gZmFsc2U7XG4vLyAgICAgLy8gfSgpKTtcbi8vXG4vL1xuLy8gICAgIC8vZm9yIHRoZSBib2R5LCB3ZSBuZWVkIHRvIGxpc3RlbiBmb3IgYWxsIGNoYW5nZXMgZWZmZWN0aW5nIHRoZSBzdHlsZSBhbmQgY2xhc3MgYXR0cmlidXRlc1xuLy8gICAgIHZhciBib2R5T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihib2R5TXV0YXRpb24pO1xuLy8gICAgIGJvZHlPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTp0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6W1wic3R5bGVcIiwgXCJjbGFzc1wiXX0pO1xuLy9cbi8vXG4vLyAgICAgLy9ib2R5IGNhbGxiYWNrXG4vLyAgICAgZnVuY3Rpb24gYm9keU11dGF0aW9uKG11dGF0ZSkge1xuLy8gICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIG11dGF0aW9uIGV2ZW50XG4vLyAgICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuLy9cbi8vICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbi8vICAgICAgICAgYm9keU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbi8vICAgICAgICAgJCgnW2RhdGEtbXV0YXRlXScpLmF0dHIoJ2RhdGEtZXZlbnRzJyxcIm11dGF0ZVwiKTtcbi8vICAgICAgIH0sIGRlYm91bmNlIHx8IDE1MCk7XG4vLyAgICAgfVxuLy8gICB9XG4vLyB9XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbihmdW5jdGlvbigpIHtcbiAgaWYgKCFEYXRlLm5vdylcbiAgICBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG5cbiAgdmFyIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKytpKSB7XG4gICAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAod2luZG93W3ZwKydDYW5jZWxBbmltYXRpb25GcmFtZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3dbdnArJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddKTtcbiAgfVxuICBpZiAoL2lQKGFkfGhvbmV8b2QpLipPUyA2Ly50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuICAgIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdmFyIG5leHRUaW1lID0gTWF0aC5tYXgobGFzdFRpbWUgKyAxNiwgbm93KTtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGxhc3RUaW1lID0gbmV4dFRpbWUpOyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0VGltZSAtIG5vdyk7XG4gICAgfTtcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XG4gIH1cbn0pKCk7XG5cbnZhciBpbml0Q2xhc3NlcyAgID0gWydtdWktZW50ZXInLCAnbXVpLWxlYXZlJ107XG52YXIgYWN0aXZlQ2xhc3NlcyA9IFsnbXVpLWVudGVyLWFjdGl2ZScsICdtdWktbGVhdmUtYWN0aXZlJ107XG5cbi8vIEZpbmQgdGhlIHJpZ2h0IFwidHJhbnNpdGlvbmVuZFwiIGV2ZW50IGZvciB0aGlzIGJyb3dzZXJcbnZhciBlbmRFdmVudCA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHRyYW5zaXRpb25zID0ge1xuICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICdNb3pUcmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICdPVHJhbnNpdGlvbic6ICdvdHJhbnNpdGlvbmVuZCdcbiAgfVxuICB2YXIgZWxlbSA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICBmb3IgKHZhciB0IGluIHRyYW5zaXRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBlbGVtLnN0eWxlW3RdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHRyYW5zaXRpb25zW3RdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufSkoKTtcblxuZnVuY3Rpb24gYW5pbWF0ZShpc0luLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gIGVsZW1lbnQgPSAkKGVsZW1lbnQpLmVxKDApO1xuXG4gIGlmICghZWxlbWVudC5sZW5ndGgpIHJldHVybjtcblxuICBpZiAoZW5kRXZlbnQgPT09IG51bGwpIHtcbiAgICBpc0luID8gZWxlbWVudC5zaG93KCkgOiBlbGVtZW50LmhpZGUoKTtcbiAgICBjYigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBpbml0Q2xhc3MgPSBpc0luID8gaW5pdENsYXNzZXNbMF0gOiBpbml0Q2xhc3Nlc1sxXTtcbiAgdmFyIGFjdGl2ZUNsYXNzID0gaXNJbiA/IGFjdGl2ZUNsYXNzZXNbMF0gOiBhY3RpdmVDbGFzc2VzWzFdO1xuXG4gIC8vIFNldCB1cCB0aGUgYW5pbWF0aW9uXG4gIHJlc2V0KCk7XG4gIGVsZW1lbnQuYWRkQ2xhc3MoYW5pbWF0aW9uKTtcbiAgZWxlbWVudC5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgZWxlbWVudC5hZGRDbGFzcyhpbml0Q2xhc3MpO1xuICAgIGlmIChpc0luKSBlbGVtZW50LnNob3coKTtcbiAgfSk7XG5cbiAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aDtcbiAgICBlbGVtZW50LmNzcygndHJhbnNpdGlvbicsICcnKTtcbiAgICBlbGVtZW50LmFkZENsYXNzKGFjdGl2ZUNsYXNzKTtcbiAgfSk7XG5cbiAgLy8gQ2xlYW4gdXAgdGhlIGFuaW1hdGlvbiB3aGVuIGl0IGZpbmlzaGVzXG4gIGVsZW1lbnQub25lKCd0cmFuc2l0aW9uZW5kJywgZmluaXNoKTtcblxuICAvLyBIaWRlcyB0aGUgZWxlbWVudCAoZm9yIG91dCBhbmltYXRpb25zKSwgcmVzZXRzIHRoZSBlbGVtZW50LCBhbmQgcnVucyBhIGNhbGxiYWNrXG4gIGZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICBpZiAoIWlzSW4pIGVsZW1lbnQuaGlkZSgpO1xuICAgIHJlc2V0KCk7XG4gICAgaWYgKGNiKSBjYi5hcHBseShlbGVtZW50KTtcbiAgfVxuXG4gIC8vIFJlc2V0cyB0cmFuc2l0aW9ucyBhbmQgcmVtb3ZlcyBtb3Rpb24tc3BlY2lmaWMgY2xhc3Nlc1xuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBlbGVtZW50WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IDA7XG4gICAgZWxlbWVudC5yZW1vdmVDbGFzcyhpbml0Q2xhc3MgKyAnICcgKyBhY3RpdmVDbGFzcyArICcgJyArIGFuaW1hdGlvbik7XG4gIH1cbn1cblxudmFyIE1vdGlvblVJID0ge1xuICBhbmltYXRlSW46IGZ1bmN0aW9uKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBhbmltYXRlKHRydWUsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9LFxuXG4gIGFuaW1hdGVPdXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBhbmltYXRlKGZhbHNlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfVxufVxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcblxuICAkKCcuc2xpY2snKS5zbGljayh7XG4gICAgZG90czogZmFsc2UsXG4gICAgaW5maW5pdGU6IHRydWUsXG4gICAgc3BlZWQ6IDUwMCxcbiAgICBmYWRlOiB0cnVlLFxuICAgIGNzc0Vhc2U6ICdsaW5lYXInLFxuICAgIGFycm93czogZmFsc2UsXG4gICAgYXV0b3BsYXk6IHRydWUsXG4gICAgYXV0b3BsYXlTcGVlZDogODAwMCxcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLnNjcm9sbChmdW5jdGlvbigpIHtcbiAgICB2YXIgaFQgPSAkKCcuZm9vdGVyJykub2Zmc2V0KCkudG9wLFxuICAgICAgICAgaEggPSAkKCcuZm9vdGVyJykub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgIHdIID0gJCh3aW5kb3cpLmhlaWdodCgpLFxuICAgICAgICAgd1MgPSAkKHRoaXMpLnNjcm9sbFRvcCgpLFxuICAgICAgICAgd2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcblxuICAgIGlmKHdpbmRvd1dpZHRoID4gNzY4KXtcbiAgICAgICQoJy5hd2FyZHMnKS5hZGRDbGFzcygnaGlkZScpO1xuXG4gICAgICBpZiAod1MgPCAoaFQraEgtd0gtMzAwKSl7XG4gICAgICAgICQoJy5hd2FyZHMnKS5yZW1vdmVDbGFzcygnYW5pbWF0ZWQgc2xpZGVJblVwIGZhZGVJbicpO1xuICAgICAgICAkKCcuYXdhcmRzJykuYWRkQ2xhc3MoJ2hpZGUnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHdTID4gKGhUK2hILXdILTMwMCkpe1xuICAgICAgICAkKCcuYXdhcmRzJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcbiAgICAgICAgJCgnLmF3YXJkcycpLmFkZENsYXNzKCdhbmltYXRlZCBzbGlkZUluVXAgZmFkZUluJyk7XG4gICAgICB9XG4gICAgfVxuICB9KSA7XG5cbiAgJCgnaS5mYS5mYS1iYXJzLmZhLTR4OjpiZWZvcmUnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICQoJy5uYXYtbWVudSBsaSBhJykuYWRkQ2xhc3MoJ2FuaW1hdGVkIHpvb21JbicpO1xuICB9KTtcbiAgJCgnLmNpbWcnKS5jbGljayhmdW5jdGlvbigpe1xuICAgICQoJy5uYXYtbWVudSBsaSBhJykucmVtb3ZlQ2xhc3MoJ2FuaW1hdGVkIHpvb21JbicpO1xuICB9KTtcbiAgJChcIi5uYXZjb250ZW50IHVsIGxpIGFcIikubW91c2VvdmVyKGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5hZGRDbGFzcygnYW5pbWF0ZWQgcHVsc2UnKTtcbiAgfSk7XG4gICQoXCIubmF2Y29udGVudCB1bCBsaSBhXCIpLm1vdXNlb3V0KGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYW5pbWF0ZWQgcHVsc2UnKTtcbiAgfSk7XG4gICQoXCIucHJhY3RpY2UtYXJlYVwiKS5tb3VzZW92ZXIoZnVuY3Rpb24oKXtcbiAgICAkKHRoaXMpLmFkZENsYXNzKCdhbmltYXRlZCBwdWxzZScpO1xuICB9KTtcbiAgJChcIi5wcmFjdGljZS1hcmVhXCIpLm1vdXNlb3V0KGZ1bmN0aW9uKCl7XG4gICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYW5pbWF0ZWQgcHVsc2UnKTtcbiAgfSk7XG59KTtcbiIsImpRdWVyeSggJ2lmcmFtZVtzcmMqPVwieW91dHViZS5jb21cIl0nKS53cmFwKFwiPGRpdiBjbGFzcz0nZmxleC12aWRlbyB3aWRlc2NyZWVuJy8+XCIpO1xualF1ZXJ5KCAnaWZyYW1lW3NyYyo9XCJ2aW1lby5jb21cIl0nKS53cmFwKFwiPGRpdiBjbGFzcz0nZmxleC12aWRlbyB3aWRlc2NyZWVuIHZpbWVvJy8+XCIpO1xuIiwialF1ZXJ5KGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG4iLCIvLyBKb3lyaWRlIGRlbW9cbiQoJyNzdGFydC1qcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAkKGRvY3VtZW50KS5mb3VuZGF0aW9uKCdqb3lyaWRlJywnc3RhcnQnKTtcbn0pOyIsIiJdfQ==
