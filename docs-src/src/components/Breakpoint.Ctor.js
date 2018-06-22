// https://github.com/bkzl/vue-fraction-grid/issues/13

import ShowAt from './ShowAt'
import HideAt from './HideAt'
import Breakpoint from './Breakpoint'

export class Ctor {
  constructor(Vue, config = {}) {
    return {
      VShowAt: Vue.extend({ extends: ShowAt, config }),
      VHideAt: Vue.extend({ extends: HideAt, config }),
      VBreakpoint: Vue.extend({ extends: Breakpoint, config })
    }
  }
}