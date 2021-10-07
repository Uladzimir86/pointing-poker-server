export interface IPlayer {
  photo?: string
  name?: string
  position?: string
  btnDelPlayer?: boolean
  above?: boolean
  id?: number
}

export interface IIssue {
  deleteButton?: boolean
  editButton?: boolean
  createButton?: boolean
  closeButton?: boolean
  currentCard?: boolean
  priority?: 'low' | 'medium' | 'high'
  number?: string
}

export interface IChatData {
  userName: string
  msg: string
}
