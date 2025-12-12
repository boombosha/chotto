export const statuses: string[] = ['read', 'received', 'sent', 'pending', 'error']

export const getStatus = (status: string): string => {
  switch (status) {
    case 'read':
      return 'status--read'
    case 'received':
      return 'status--received'
    case 'pending':
      return 'status--pending'
    case 'error':
      return 'status--error'
    default:
      return ''
  }
}

export const getStatusTitle = (status: string, statusMsg?: string): string => {
  if (statusMsg) {
    return statusMsg;
  }
  
  switch (status) {
    case 'sent':
      return 'Отправлено'
    case 'received':
      return 'Доставлено'
    case 'read':
      return 'Прочитано'
    case 'pending':
      return 'Отправляется...'
    case 'error':
      return 'Ошибка отправки'
    default:
      return ''
  }
}