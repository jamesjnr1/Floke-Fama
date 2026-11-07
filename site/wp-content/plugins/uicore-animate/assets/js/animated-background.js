window.addEventListener('DOMContentLoaded', () => {
  class animatedBackground extends elementorModules.frontend.handlers.Base {
    onInit(...args) {
      super.onInit(...args);
      if (this.getElementSettings('section_fluid_on') !== 'yes') {
        return;
      }

      // the beauty can be found in details :P
      this.hasMouseStarted = false;
      this.mouse = {
        x: 0.5,
        y: 0.5,
        vx: 0,
        vy: 0
      };
      this.targetMouse = {
        x: 0.5,
        y: 0.5
      };
      this.damping = 0.72;
      this.stiffness = 0.12;
      this.canvas = null;
      this.updateMousePosition = this.updateMousePosition.bind(this);
      this.initBackground();
    }

    /**
     * Global resize handler for the fluid animation
     */
    resize() {
      const el = this.$element[0];
      const {
        renderer,
        program
      } = el.animatedBackground;
      renderer.setSize(el.offsetWidth, el.offsetHeight);
      program.uniforms.uResolution.value = [el.offsetWidth, el.offsetHeight, el.offsetWidth / el.offsetHeight];
    }

    /**
     * Global mouse position for the fluid animation
     * @param {*} e
     */
    updateMousePosition(e) {
      const rect = this.$element[0].getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      //fix initial jump
      if (!this.hasMouseStarted) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.targetMouse.x = x;
        this.targetMouse.y = y;
        this.hasMouseStarted = true;
        return;
      }
      this.targetMouse.x = x;
      this.targetMouse.y = y;
    }

    /**
     * Global animation loop
     * @param {*} t
     */
    loop(t) {
      const el = this.$element[0];
      const {
        renderer,
        program,
        mesh
      } = el.animatedBackground;
      this.$element[0].animationId = requestAnimationFrame(this.loop.bind(this));
      program.uniforms.uTime.value = t * 0.001;
      const dx = this.targetMouse.x - this.mouse.x;
      const dy = this.targetMouse.y - this.mouse.y;

      // acceleration toward target
      this.mouse.vx += dx * this.stiffness;
      this.mouse.vy += dy * this.stiffness;

      // apply damping (friction)
      this.mouse.vx *= this.damping;
      this.mouse.vy *= this.damping;

      // update position
      this.mouse.x += this.mouse.vx;
      this.mouse.y += this.mouse.vy;
      program.uniforms.uMouse.value = [this.mouse.x, this.mouse.y];
      renderer.render({
        scene: mesh
      });
    }

    /**
     * Global destroy method
     */
    destroy() {
      const {
        gl,
        program,
        geometry,
        mesh
      } = this.$element[0].animatedBackground;

      //stop animation loop
      if (this.$element[0].animationId) {
        cancelAnimationFrame(this.$element[0].animationId);
      }
      //remove event listeners
      this.$element[0].removeEventListener('mousemove', this.updateMousePosition);
      window.removeEventListener('resize', this.resize);

      //clean up ogl resources
      try {
        var _mesh$delete;
        mesh === null || mesh === void 0 || (_mesh$delete = mesh.delete) === null || _mesh$delete === void 0 || _mesh$delete.call(mesh);
      } catch (e) {}
      try {
        gl.deleteProgram(program === null || program === void 0 ? void 0 : program.program);
      } catch (e) {}
      try {
        var _geometry$attributes;
        gl.deleteBuffer(geometry === null || geometry === void 0 || (_geometry$attributes = geometry.attributes) === null || _geometry$attributes === void 0 || (_geometry$attributes = _geometry$attributes.position) === null || _geometry$attributes === void 0 ? void 0 : _geometry$attributes.buffer);
      } catch (e) {}
      try {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      } catch (e) {}

      //cleanup references
      this.$element[0].animatedBackground = null;
    }

    /**
     * Initialize the fluid animation
     */
    initBackground() {
      var _this$$element$0$anim;
      const animation = this.getElementSettings('uicore_fluid_animation') || null;
      if (!animation) {
        return;
      }

      // Get proper function name
      const name = animation.replace('ui-fluid-', '').replace(/-([a-z])/g, g => g[1].toUpperCase());
      const functionName = 'uiAnimated_' + name.charAt(0).toUpperCase() + name.slice(1);
      this.createCanvas(animation);

      // Css based animations only need canvas
      if (typeof window[functionName] !== 'function') {
        return;
      }

      // Try to destroy existing animation
      if (this.$element[0].animatedBackground) {
        this.destroy();
      }
      const settings = this.getBGSettings();
      window[functionName](this.$element[0], this.canvas, settings); // Calls for the main animation function

      // Start loop and resize listeners if not custom
      if ((_this$$element$0$anim = this.$element[0].animatedBackground) !== null && _this$$element$0$anim !== void 0 && _this$$element$0$anim.custom) {
        return;
      }
      requestAnimationFrame(this.loop.bind(this));
      window.addEventListener("resize", this.resize.bind(this));
      this.resize();
      if (settings.mouseInteractive) {
        this.$element[0].addEventListener('mousemove', this.updateMousePosition);
      }
    }

    /**
     * Create a canvas element for the fluid animation
     * @param {string} animation
     */
    createCanvas(animation) {
      let canvas = this.$element[0].querySelector('.ui-e-fluid-canvas');

      //cleanup existing canvas
      if (canvas) {
        this.$element[0].removeChild(canvas);
        canvas = null;
      }

      // Check if we actually need the `canvas` tag
      const useDiv = animation.startsWith('ui-fluid-animation-') && animation !== 'ui-fluid-animation-6';
      canvas = useDiv ? document.createElement('div') : document.createElement('canvas');
      canvas.className = useDiv ? 'ui-fluid-gradient-wrapper ui-e-fluid-canvas' : 'ui-e-fluid-canvas';
      this.$element[0].insertBefore(canvas, this.$element[0].firstChild);
      if (useDiv) {
        const canvasChild = document.createElement('div');
        canvasChild.className = 'ui-fluid-gradient';
        canvas.appendChild(canvasChild);
      } else {
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
      }
      this.canvas = canvas;
    }
    getBGColorSettings() {
      const canvasStyle = getComputedStyle(this.canvas);
      const colorArray = [canvasStyle.getPropertyValue("--ui-fluid-1") || "#b96d04", canvasStyle.getPropertyValue("--ui-fluid-2") || "#dd7301", canvasStyle.getPropertyValue("--ui-fluid-3") || "#f7c632", canvasStyle.getPropertyValue("--ui-fluid-4") || "#934b14"].map(color => this.getResolvedRGB(color));
      const backgroundColor = this.getResolvedRGB(canvasStyle.getPropertyValue("--ui-fluid-bg") || "#000000");
      return {
        colorArray,
        backgroundColor
      };
    }
    getBGSettings() {
      var _this$getElementSetti, _this$getElementSetti2, _this$getElementSetti3, _this$getElementSetti4, _this$getElementSetti5, _this$getElementSetti6, _this$getElementSetti7, _this$getElementSetti8;
      // If settings popover is reset or not set yet, use default values
      let settings = this.getElementSettings('section_fluid_settings') !== 'yes' ? {
        ...this.getBGColorSettings(),
        scale: 10,
        intensity: 50,
        speed: 20,
        noise: 20,
        angle: 0,
        mouseInteractive: false,
        progress: 10
      } : {
        ...this.getBGColorSettings(),
        scale: (_this$getElementSetti = this.getElementSettings('section_fluid_scale')) !== null && _this$getElementSetti !== void 0 ? _this$getElementSetti : 10,
        intensity: (_this$getElementSetti2 = this.getElementSettings('section_fluid_intensity')) !== null && _this$getElementSetti2 !== void 0 ? _this$getElementSetti2 : 50,
        speed: this.getElementSettings('section_fluid_static') === 'yes' ? 0 : (_this$getElementSetti3 = this.getElementSettings('section_fluid_speed')) !== null && _this$getElementSetti3 !== void 0 ? _this$getElementSetti3 : 20,
        noise: (_this$getElementSetti4 = this.getElementSettings('section_fluid_noise')) !== null && _this$getElementSetti4 !== void 0 ? _this$getElementSetti4 : 20,
        angle: (_this$getElementSetti5 = this.getElementSettings('section_fluid_angle')) !== null && _this$getElementSetti5 !== void 0 ? _this$getElementSetti5 : 0,
        mouseInteractive: this.getElementSettings('section_fluid_interactive') === 'yes',
        progress: (_this$getElementSetti6 = this.getElementSettings('section_fluid_progress')) !== null && _this$getElementSetti6 !== void 0 ? _this$getElementSetti6 : 10,
        texture: this.getElementSettings('section_fluid_texture') || null,
        offsetX: (_this$getElementSetti7 = this.getElementSettings('section_fluid_offset_x')) !== null && _this$getElementSetti7 !== void 0 ? _this$getElementSetti7 : 0,
        offsetY: (_this$getElementSetti8 = this.getElementSettings('section_fluid_offset_y')) !== null && _this$getElementSetti8 !== void 0 ? _this$getElementSetti8 : 0
      };

      // Fluid image should always be interactive
      if (this.getElementSettings('uicore_fluid_animation') === 'liquid-image') {
        settings.mouseInteractive = true;
      }
      return settings;
    }
    getResolvedRGB(color) {
      const temp = document.createElement("div");
      temp.style.color = color;
      window.document.body.appendChild(temp);
      const computed = getComputedStyle(temp).color;
      window.document.body.removeChild(temp);
      const [r, g, b] = computed.match(/\d+/g).map(Number);
      return [r / 255, g / 255, b / 255];
    }
    updateSettings(propertyName) {
      const map = {
        'section_fluid_scale': {
          key: 'scale',
          default: 10
        },
        'section_fluid_intensity': {
          key: 'intensity',
          default: 50
        },
        'section_fluid_speed': {
          key: 'speed',
          default: 20
        },
        'section_fluid_noise': {
          key: 'noise',
          default: 0
        },
        'section_fluid_angle': {
          key: 'angle',
          default: 0
        },
        'section_fluid_interactive': {
          key: 'mouseInteractive',
          default: false
        },
        'section_fluid_static': {
          key: 'static',
          default: false
        },
        'section_fluid_progress': {
          key: 'progress',
          default: 10
        },
        'section_fluid_offset_x': {
          key: 'offsetX',
          default: 0
        },
        'section_fluid_offset_y': {
          key: 'offsetY',
          default: 0
        }
      };
      let normalized;
      const {
        normalizeSettings,
        program,
        customUpdateSettings
      } = this.$element[0].animatedBackground;
      if (map[propertyName]) {
        const {
          key,
          default: defaultValue
        } = map[propertyName];
        let value = this.getElementSettings(propertyName);

        // Object props check
        if (typeof value === 'object' && value !== null) {
          value = value.size === null || value.size === undefined || isNaN(value.size) ? defaultValue : value.size;
          // Switch props check
        } else if (key === 'mouseInteractive' || key === 'static') {
          value = value.toLowerCase() === 'yes';
          // Straight props check
        } else if (value === '' || value === null || value === undefined || isNaN(value)) {
          value = defaultValue;
        }
        normalized = normalizeSettings({
          [key]: value
        });
      }

      // Update colors (get them from css since those are not frontend settings)
      if (propertyName.startsWith('section_fluid_color')) {
        const {
          colorArray,
          backgroundColor
        } = this.getBGColorSettings();
        normalized = normalizeSettings({
          colorArray,
          backgroundColor
        });
      }
      if (normalized) {
        if (typeof customUpdateSettings === 'function') {
          customUpdateSettings(normalized);
          return;
        }
        for (const [k, v] of Object.entries(normalized)) {
          switch (k) {
            case "colorArray":
              program.uniforms.uColorStops.value = v;
              break;
            case "backgroundColor":
              program.uniforms.uBackgroundColor.value = v;
              break;
            case "speed":
              program.uniforms.uSpeed.value = v;
              break;
            case "intensity":
              program.uniforms.uIntensity.value = v;
              break;
            case "noise":
              program.uniforms.uNoise.value = v;
              break;
            case "scale":
              program.uniforms.uScale.value = v;
              break;
            case "angle":
              program.uniforms.uAngle.value = v;
              break;
            case 'progress':
              if (program.uniforms.uSpeed.value === 0) {
                program.uniforms.uProgress.value = v;
              }
              break;
            case 'mouseInteractive':
              if (v) {
                program.uniforms.uInteractive.value = 1;
                this.$element[0].addEventListener('mousemove', this.updateMousePosition);
              } else {
                program.uniforms.uInteractive.value = 0;
                this.$element[0].removeEventListener('mousemove', this.updateMousePosition);
              }
              break;
            case 'static':
              if (!v) {
                const speedSetting = this.getElementSettings('section_fluid_speed');
                program.uniforms.uSpeed.value = speedSetting ? normalizeSettings({
                  speed: speedSetting
                }) : 0.01;
              } else {
                program.uniforms.uSpeed.value = 0;
              }
              break;
            case 'offsetX':
              program.uniforms.uOffsetX.value = v;
              break;
            case 'offsetY':
              program.uniforms.uOffsetY.value = v;
              break;
          }
        }
      }
    }
    onElementChange(propertyName) {
      if (this.getElementSettings('section_fluid_on') !== 'yes' || ['animation-1', 'animation-2', 'animation-3', 'animation-4', 'animation-5'].some(suffix => propertyName.endsWith(suffix)) // Css based animations
      ) {
        return;
      }
      clearTimeout(this.updateTimeout);
      this.updateTimeout = setTimeout(() => {
        this.updateSettings(propertyName);
      }, 50);
    }
  }
  jQuery(window).on('elementor/frontend/init', () => {
    const addHandler = $element => {
      elementorFrontend.elementsHandler.addHandler(animatedBackground, {
        $element
      });
    };
    elementorFrontend.hooks.addAction('frontend/element_ready/section', addHandler);
    elementorFrontend.hooks.addAction('frontend/element_ready/container', addHandler);
  });
}, false);