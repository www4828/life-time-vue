import { Response } from '@/api/interface'
import { useDepartment } from './useDepartment'
import { LockCaseService } from '@/api/service/LockCase/LockCaseService'
import { NodeCodeKey } from '@/api/model/fileAttachmentModel'
import { layer } from '@layui/layer-vue'
import { useRoute } from 'vue-router'

export function useLock() {
  const { username } = useDepartment()
  const lockCaseService = new LockCaseService()
  const route = useRoute()
  const lockCase = (taskId: string): Promise<Response> => {
    // return lockCaseService.lock(taskId)
    return new Promise<any>((resolve, reject) => {
      lockCaseService
        .lock(taskId)
        .then((res) => {
          if (res.code === 200) {
            resolve(true)
          } else {
            reject(res)
          }
        })
        .catch((err) => {
          reject(false)
        })
    })
  }
  const unlockCase = (taskId: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      layer.closeAll()
      lockCaseService
        .unLock(taskId)
        .then((res) => {
          if (res.code === 200) {
            resolve(true)
          } else {
            resolve(false)
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
  const isLocked = async (
    taskId: string,
    nodeCode: NodeCodeKey
  ): Promise<boolean | string> => {
    let code = route.meta.nodeCode as string
    console.log('route.meta',route.meta);
    
    if (code.indexOf('B') > -1) {
      let flag = await checkTaskStatus(taskId)
      return new Promise((resolve) => {
        if (flag) {
          lockCaseService.isLock(taskId, nodeCode).then((res) => {
            if (res.code === 200 && res.message === 'false') {
              resolve(true)
            } else {
              resolve(res.data)
            }
          })
        } else {
          resolve('案件已经被其他用户操作，请刷新列表或者操作其他案件')
        }
      })
    } else {
      return new Promise((resolve) => {
        lockCaseService.isLock(taskId, nodeCode).then((res) => {
          if (res.code === 200 && res.message === 'false') {
            resolve(true)
          } else {
            resolve(res.data)
          }
        })
      })
    }
  }
  const hasLockCase = (): Promise<boolean | string> => {
    return new Promise((resolve) => {
      lockCaseService.hasLockCase(username).then((res) => {
        if (res.code === 200 && res.message === 'false') {
          resolve(true)
        } else {
          resolve(res.data)
        }
      })
    })
  }
  const unlockAll = (): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      layer.closeAll()
      lockCaseService
        .unLockAll()
        .then((res) => {
          if (res.code === 200) {
            resolve(true)
          } else {
            resolve(false)
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
  const checkTaskStatus = (taskId: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      lockCaseService
        .checkTaskStatus(
          route.meta.nodeCode as string,
          (route.query.flowName as string) || 'all',
          taskId
        )
        .then((res) => {
          if (res.code == 200 && res.data === 'success') {
            resolve(true)
          } else {
            resolve(false)
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
  return {
    lockCase,
    unlockCase,
    isLocked,
    hasLockCase,
    unlockAll,
  }
}
