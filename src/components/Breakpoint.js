/* eslint-disable space-before-function-paren */

// https://github.com/weblinc/media-match
// https://github.com/apertureless/vue-breakpoints
// https://www.npmjs.com/package/custom-event-polyfill
// https://adamwathan.me/renderless-components-in-vuejs/
// https://forum.vuejs.org/t/v-if-removing-event-listeners/24735/2
// https://vuejs.org/v2/style-guide/#Private-property-names-essential
// https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
// https://gist.github.com/adi518/a2c1555009cb6f90b4dd41fd48962853/edit
// https://medium.com/@uiuxlab/the-most-used-responsive-breakpoints-in-2017-of-mine-9588e9bd3a8a
// https://forum.vuejs.org/t/vue-component-as-singleton-never-to-be-destroyed-and-mounted-again/25010
// https://github.com/chrisvfritz/7-secret-patterns/blob/master/slides-2018-03-03-spotlight-export.pdf
// https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window

import 'custom-event-polyfill'

import capitalize from 'capitalize'
import debounce from 'lodash.debounce'
import isNumber from 'lodash.isnumber'
import kebabcase from 'lodash.kebabcase'

import breakpoints from '@/assets/javascript/breakpoints'

export default {
  name: 'VBreakpoint',
  config: { breakpoints }, // Foreign key
  props: {
    value: {
      type: Object
    },
    breakpoints: {
      type: Object
    },
    debounceTime: {
      type: Number
    }
  },
  data: () => ({
    breakpoint: undefined,
    mutable: { breakpoints: {}, debounceTime: undefined }
  }),
  watch: {
    breakpoint(value) {
      // Vue Devtools has a bug where events
      // will not show up if they are fired
      // on page load, while in reality they do.
      this.$emit('input', this.scope)
      this.$emit('change', this.scope)

      // Emit namespaced event
      if (this.scope.breakpoint) {
        this.$emit(this.scope.breakpoint)
      }

      this.$emit('no-match', this.scope.noMatch)
      this.$emit('breakpoint', this.scope.breakpoint)
    }
  },
  beforeCreate() {
    if (window.matchMedia) {
      // Browser supported ✔
    } else {
      this.log('incompatible browser')
    }
  },
  created() {
    this.mutable.breakpoints = this.breakpoints || this.$options.config.breakpoints

    this.mutable.debounceTime = isNumber(this.debounceTime)
      ? this.debounceTime : this.$options.config.debounceTime

    this.match = debounce(this.match, this.mutable.debounceTime)
  },
  mounted() {
    // Attach listener to `$root` to avoid
    // more than one `resize` listener, which
    // can cause massive performance issues.
    if (this.$root.$_vBreakpoint) {
      this.breakpoint = this.$root.$_vBreakpoint.breakpoint
      this.$watch(
        '$root.$_vBreakpoint.breakpoint',
        breakpoint => (this.breakpoint = breakpoint)
      )
    } else {
      this.$root.$_vBreakpoint = this

      window.addEventListener('resize', this.match, false)
      window.dispatchEvent(new window.CustomEvent('resize'))
    }

    if (this.$slots.default && this.$slots.default.length > 1) {
      this.log('vue components are limited to 1 root element')
    }
  },
  beforeDestroy() {
    if (this.$root.$_vBreakpoint) {
      if (this.$root.$_vBreakpoint._uid === this._uid) {
        delete this.$root.$_vBreakpoint
      }
    }
  },
  destroyed() {
    window.removeEventListener('resize', this.match)
  },
  computed: {
    scope() {
      return {
        ...this.flags,
        vw: window.screen.width,
        vh: window.screen.height,
        viewportWidth: window.screen.width,
        viewportHeight: window.screen.height,
        iw: window.innerWidth,
        ih: window.innerHeight,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        breakpoint: this.breakpoint,
        noMatch: this.noMatch
      }
    },
    flags() {
      return Object.keys(this.mutable.breakpoints).reduce((flags, breakpoint) => {
        const flag = `is${capitalize(breakpoint)}`
        flags[flag] = breakpoint === this.breakpoint
        return flags
      }, {})
    },
    noMatch() {
      return this.breakpoint === null
    },
    namespace() {
      return capitalize.words(kebabcase(this.$options.name))
    }
  },
  methods: {
    match() {
      this.breakpoint = Object.entries(this.mutable.breakpoints).reduce(
        (noMatch, [breakpoint, mediaQuery]) => {
          if (window.matchMedia(mediaQuery).matches) {
            return breakpoint
          }
          return noMatch
        },
        null
      )
    },
    log(message) {
      const namespace = this.namespace
      const capitalized = capitalize(message)
      console.error(`[${namespace} warn]: ${capitalized}.`)
    }
  },
  render() {
    if (this.$scopedSlots.default) {
      return this.$scopedSlots.default(this.scope)
    }
    if (this.$slots.default && this.$slots.default.length) {
      return this.$slots.default[0]
    }
  }
}
