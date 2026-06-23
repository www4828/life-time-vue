import { Module } from 'vuex'
import { Session } from '@/utils/storage'
import { ApisState, RootStateTypes } from '@/store/interface'
import { LoginService } from '@/api/login'
const loginServer=new LoginService();
const userInfosModule: Module<ApisState, RootStateTypes> = {
  namespaced: true,
  state: {
    apiMethod: ''
  },
  mutations: {
    getApiMethod(state: any, data: Array<string>) {
			state.apiMethod = data;
		},
  },
  actions: {
    async setApiMethod({ commit }, data: ApisState) {
      commit('getApiMethod', data)
    }
  },
}

export default userInfosModule
