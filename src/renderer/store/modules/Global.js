const state = {
  tableName: '',
  operate: {
    type: '',
    val: ''
  },
  errLine: -1
}

const mutations = {
  changeTableName(state, name) {
    state.tableName = name
  },
  changeOperate(state, obj) {
    state.operate = obj
  },
  changeErrLine(state, val) {
    state.errLine = val
  }
}

const actions = {
}

export default {
  state,
  mutations,
  actions
}
