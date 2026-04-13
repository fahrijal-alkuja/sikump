import { ref, readonly } from 'vue'

interface AlertState {
  show: boolean
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface ConfirmState {
  show: boolean
  title: string
  message: string
  onConfirm: (() => void) | null
}

const alertState = ref<AlertState>({
  show: false,
  message: '',
  type: 'success'
})

const confirmState = ref<ConfirmState>({
  show: false,
  title: '',
  message: '',
  onConfirm: null
})

export const useAlert = () => {
  const showAlert = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    alertState.value = { show: true, message, type }
    setTimeout(() => {
      alertState.value.show = false
    }, 4000)
  }

  const askConfirm = (title: string, message: string, onConfirm: () => void) => {
    confirmState.value = {
      show: true,
      title,
      message,
      onConfirm
    }
  }

  const closeConfirm = () => {
    confirmState.value.show = false
    confirmState.value.onConfirm = null
  }

  const closeAlert = () => {
    alertState.value.show = false
  }

  return {
    alertState: readonly(alertState),
    confirmState: readonly(confirmState),
    showAlert,
    askConfirm,
    closeConfirm,
    closeAlert
  }
}
