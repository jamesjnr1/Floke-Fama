window.addEventListener('DOMContentLoaded', () => {
  class animatedBorder extends elementorModules.frontend.handlers.Base {
    bindEvents() {
      this.setVariables();
    }
    // getWidgetType() {
    //     return 'global';
    // }
    debounce(func, wait = 1, immediate = true) {
      let timeout;
      return function () {
        const context = this,
          args = arguments;
        const later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }
    onElementChange(prop) {
      //check if prop was uicon_animated_border or  the changed prop string contains border word in it
      if ((prop === 'uicore_animated_border' || prop.includes('border') || prop === 'uicore_animated_border_item') && !prop.includes('animated_border_color')) {
        this.debounce(this.setVariables(), 50);
      }
      return;
    }
    getChild() {
      var $el = this.$element;
      if (!this.$element.hasClass('e-con') && !this.$element.hasClass('ui-borderanim-rotate_item') && !this.$element.hasClass('ui-borderanim-hover_item')) {
        $el = elementorFrontend.config.experimentalFeatures.e_optimized_markup ? this.$element : this.$element.find('> .elementor-widget-container');
      }
      if (this.$element.hasClass('ui-borderanim-rotate_item') || this.$element.hasClass('ui-borderanim-hover_item')) {
        const type = this.getWidgetType();
        switch (type) {
          case 'uicore-icon-list':
            $el = this.$element.find('.ui-e-wrap');
            break;
          case 'uicore-advanced-post-carousel':
          case 'uicore-advanced-post-grid':
            $el = this.$element.find('.ui-e-item > article');
            break;
          default:
            $el = this.$element.find('.ui-e-wrap');
        }
      }
      return $el;
    }
    setVariables() {
      //check if element has the class that defines the animation or the item aniamtion
      if (!this.$element.hasClass('ui-borderanim-rotate') && !this.$element.hasClass('ui-borderanim-hover') && !this.$element.hasClass('ui-borderanim-rotate_item') && !this.$element.hasClass('ui-borderanim-hover_item')) {
        return;
      }
      var $el = this.getChild();
      $el.css('border-style', '');
      $el.css('border-color', '');
      $el.css('border-width', '');
      let _this = this;
      var delay = 0;
      if (elementorFrontend.isEditMode()) {
        delay = 5;
      }
      setTimeout(() => {
        var $el = this.getChild();

        // There's no child when animating widgets directly
        if (!$el.length) {
          $el = this.$element;
        }
        var borderWidthTop = Math.ceil(parseFloat($el.css('border-top-width').replace('px', ''))) + "px";
        var borderWidthRight = Math.ceil(parseFloat($el.css('border-right-width').replace('px', ''))) + "px";
        var borderWidthBottom = Math.ceil(parseFloat($el.css('border-bottom-width').replace('px', ''))) + "px";
        var borderWidthLeft = Math.ceil(parseFloat($el.css('border-left-width').replace('px', ''))) + "px";
        var borderRadius = $el.css('border-radius');
        var bordercolor = $el.css('border-color');
        if (_this.$element.hasClass('ui-borderanim-hover') || _this.$element.hasClass('ui-borderanim-hover_item')) {
          if (!_this.$element.hasClass('e-con')) {
            $el.css('border-color', 'transparent');
          }
          $el.css('z-index', 2);
          $el.css('position', 'relative');
          $el.css('margin', `${-borderWidthTop} ${-borderWidthRight} ${-borderWidthBottom} ${-borderWidthLeft}`);
          //set position relative on parent (for before and after element to work properly)
          $el.parent().css('position', 'relative');
          if (_this.$element.hasClass('ui-borderanim-hover_item')) {
            $el.css('border-width', 0); //remove border from item because the background is set on a child and this will make the border duble
          }
          _this.initHoverAnimation();
        }
        if (_this.$element.hasClass('ui-borderanim-rotate_item')) {
          $el.css('border-style', 'none');
        }

        //set them to after element
        _this.$element.css('--ui-borderanim-width-top', borderWidthTop);
        _this.$element.css('--ui-borderanim-width-right', borderWidthRight);
        _this.$element.css('--ui-borderanim-width-bottom', borderWidthBottom);
        _this.$element.css('--ui-borderanim-width-left', borderWidthLeft);
        _this.$element.css('--ui-borderanim-radius', borderRadius);
        _this.$element.css('--ui-borderanim-basecolor', bordercolor);
      }, delay);
    }
    initHoverAnimation() {
      //add handler but make sure is only added once
      if (window.innerWidth < 768 || window.uicore_hover_animation) {
        return;
      }
      document.addEventListener("mousemove", $event => {
        window.uicore_hover_animation = true;
        const proximity = 200;
        const hoverElements = [...jQuery(".ui-borderanim-hover"), ...this.getChild().parent()];
        hoverElements.forEach(element => {
          const rect = element.getBoundingClientRect();
          const x = $event.clientX - rect.left;
          const y = $event.clientY - rect.top;
          const distanceX = Math.max(0, Math.abs(x) - rect.width);
          const distanceY = Math.max(0, Math.abs(y) - rect.height);
          const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
          if (distance < proximity) {
            element.style.setProperty("--xPos", `${x}px`);
            element.style.setProperty("--yPos", `${y}px`);
            element.style.setProperty("--proximity", `${1 - distance / proximity}`);
          } else {
            element.style.setProperty("--proximity", `0`);
          }
        });
      });
    }
  }
  jQuery(window).on('elementor/frontend/init', () => {
    const addHandler = $element => {
      elementorFrontend.elementsHandler.addHandler(animatedBorder, {
        $element
      });
    };
    elementorFrontend.hooks.addAction('frontend/element_ready/global', addHandler);
    elementorFrontend.hooks.addAction('frontend/element_ready/section', addHandler);
    elementorFrontend.hooks.addAction('frontend/element_ready/container', addHandler);
  });
}, false);