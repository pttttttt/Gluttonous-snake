import { createStore } from "vuex"

export default createStore({
    state: {
        thisBranch: 0,
        historyBranch: localStorage.getItem('historyBranch')
    },
    mutations: {
        addition(state) {
            state.thisBranch++
                if (state.thisBranch > state.historyBranch) localStorage.setItem('historyBranch', state.thisBranch)
        },
        clear(state) {
            state.thisBranch = 0
        },
        renew(state) {
            state.historyBranch = localStorage.getItem('historyBranch')
        }
    },
    getters: {},
    actions: {},
    modules: {}
})