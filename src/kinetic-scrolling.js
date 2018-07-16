(function() {
    'use strict';

    var KScrolling = function(elem, options) {
        this.elem = elem;
        this.min = 0;
        this.max = parseInt(getComputedStyle(this.elem).height, 10) - innerHeight;
        this.indicator = '';
        this.reference = '';
        this.relative = (innerHeight - 30) / this.max;
        this.offset = 0;
        this.pressed = false;
        this.xform = 'transform';
        this.prefix = ['webkit', 'Moz', 'O', 'ms'];
        this.velocity = '';
        this.frame = '';
        this.timestamp = '';
        this.ticker = '';
        this.amplitude = '';
        this.target = '';
        this.timeConstant = 325;
        this.timer = '';

        bind(this.elem, 'touchstart', this.tap.bind(this));
        bind(this.elem, 'touchmove', this.drag.bind(this));
        bind(this.elem, 'touchend', this.release.bind(this));
    };

    /**
     * event listener
     *
     * @param {*} element element
     * @param {String} type event type
     * @param {Function} callback callback
     */
    function bind(elem, type, callback) {
        elem.addEventListener(type, callback, false);
    }

    /**
     * prevent
     *
     * @param {*} e
     */
    function prevent(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    KScrolling.prototype = {
        /**
         * start
         */
        tap: function(e) {
            this.pressed = true;
            this.reference = this.ypos(e);
            this.velocity = this.amplitude = 0;
            this.frame = this.offset;
            this.timestamp = Date.now();

            clearInterval(this.ticker);
            this.ticker = setInterval(this.track.bind(this), 0);
            prevent(e);
            return false;
        },

        /**
         * move
         */
        drag: function(e) {
            var y, delta;

            if (this.pressed) {
                y = this.ypos(e);
                delta = this.reference - y;

                if (delta > 2 || delta < -2) {
                    this.reference = y;
                    this.scroll(this.offset + delta);
                }
            }
            prevent(e);
            return false;
        },

        /**
         * stop
         */
        release: function(e) {
            this.pressed = false;

            clearInterval(this.ticker);

            if (this.velocity > 10 || this.velocity < -10) {
                this.amplitude = 0.8 * this.velocity;
                this.target = Math.round(this.offset + this.amplitude);
                this.timestamp = Date.now();
                requestAnimationFrame(this.autoScroll.bind(this));
            }

            if (this.offset > this.max) {
                this.offset = this.max;
                this.scroll(this.max);
            }
            prevent(e);
            return false;
        },

        /**
         * get client y
         */
        ypos: function(e) {
            if (e.targetTouches && e.targetTouches.length >= 1) {
                return e.targetTouches[0].clientY;
            }
            return e.clientY;
        },

        /**
         * scroll
         */
        scroll: function(d) {
            this.offset = d;
            this.elem.style[this.xform] = 'translateY(' + -this.offset + 'px)';
        },

        /**
         * track
         */
        track: function() {
            var now, elapsed, delta, v;

            now = Date.now();
            elapsed = now - this.timestamp;
            this.timestamp = now;
            delta = this.offset - this.frame;
            this.frame = this.offset;

            v = (1000 * delta) / (1 + elapsed);

            this.velocity = 0.8 * v + 0.2 * this.velocity;
        },

        /**
         * auto scroll
         */
        autoScroll: function() {
            var elapsed, delta;
            var self = this;

            if (this.amplitude) {
                elapsed = Date.now() - this.timestamp;
                delta = -this.amplitude * Math.exp(-elapsed / this.timeConstant);

                if (delta > 0.5 || delta < -0.5) {
                    this.timer = setTimeout(function() {
                        if (self.offset < 0) {
                            self.offset = 0;
                            self.scroll(0);
                        } else if (self.offset > self.max) {
                            self.offset = self.max;
                            self.scroll(self.max);
                        } else {
                            self.scroll(self.target + delta);
                            requestAnimationFrame(self.autoScroll.bind(self));
                        }
                    }, 0);
                } else {
                    this.scroll(this.target);
                    if (this.offset < 0) {
                        this.offset = 0;
                        this.scroll(0);
                    }
                    if (this.offset > this.max) {
                        this.offset = this.max;
                        this.scroll(this.max);
                    }
                }
            }
        }
    };

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = KScrolling;
    } else {
        window.KScrolling = KScrolling;
    }
})();
