interface IIssue {
  deleteButton?: boolean
  editButton?: boolean
  createButton?: boolean
  closeButton?: boolean
  currentCard?: boolean
  priority?: 'low' | 'medium' | 'high'
  number?: string
}
const issues: IIssue[] = 
  [
    {
      deleteButton: true,
      editButton: true,
      priority: 'high',
      number: '999'
    },
    {
      deleteButton: true,
      editButton: true,
      priority: 'high',
      number: '99'
    },
    {
      deleteButton: true,
      editButton: true,
      priority: 'high',
      number: '9'
    },
  ]

export default issues;