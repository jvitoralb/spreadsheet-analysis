import { createStore } from 'vuex'


const store = createStore({
    state: {
        crByYear: null,
        mrrByYear: null,
    },
    mutations: {
        SAVE_CR_BY_YEAR(state, cr) {
            state.crByYear = cr;
        },
        SAVE_MRR_BY_YEAR(state, mrr) {
            state.mrrByYear = mrr;
        },
    },
    getters: {
        getCr(state) {
            return state.crByYear;
        },
        getMrr(state) {
            return state.mrrByYear;
        }
    },
    actions: {
        setCrByYear(context, cr) {
            context.commit('SAVE_CR_BY_YEAR', cr);
        },
        setMrrByYear(context, mrr) {
            context.commit('SAVE_MRR_BY_YEAR', mrr);
        }
    }
})

export default store;