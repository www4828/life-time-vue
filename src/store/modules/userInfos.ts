import { Module } from 'vuex'
import { Session } from '@/utils/storage'
import { UserInfosState, RootStateTypes } from '@/store/interface'
import { LoginService } from '@/api/login'
const loginServer=new LoginService();
const userInfosModule: Module<UserInfosState, RootStateTypes> = {
  namespaced: true,
  state: {
    userInfos: {
      clientId: '',
      clientName: '',
      description: '',
      token: '',
    },
  },
  mutations: {
    getUserInfos(state, data: any) {
      state.userInfos = data
    },
    initUserInfos(state) {
      state.userInfos = {
        clientId: '',
        clientName: '',
        description: '',
        token: '',
      }
    },
  },
  actions: {
    async setUserInfos({ commit }, data: UserInfosState) {
      if (data) {
        commit('getUserInfo', data)
      } else {
        if (Session.get('userInfo'))
          commit('getUserInfo', Session.get('userInfo'))
      }
    },
    LoginOut({ commit }) {
      return new Promise((resolve,reject)=>{
        loginServer.signOut().then((res)=>{
            commit('initUserInfos'); 
            Session.clear(); 
            resolve(res); 
        }); 
      });
    },
  },
}

export default userInfosModule
