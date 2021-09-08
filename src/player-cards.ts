interface IPlayerCard {
  photo?: string
  name?: string
  position?: string
  btnDelPlayer?: boolean
  above?: boolean
}

const playerCards: IPlayerCard[] = [
    {
      photo: 'SD',
      name: 'Name',
      position: 'junior',
      btnDelPlayer: true,
      above: false,
    },
  ]

export default playerCards;
