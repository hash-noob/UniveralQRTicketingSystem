export const EVENTS = [
  {
    name: 'Blind Typing',
    types: ['Solo'],
    price: 30
  },
  {
    name: 'Code & Chaos',
    types: ['Solo'],
    price: 50
  },
  {
    name: 'Fandom Quiz',
    types: ['Solo', 'Duo', 'Trio', 'Quadro'],
    price: 30
  },
  {
    name: 'Frontend Blitz',
    types: ['Solo', 'Quadro'],
    price: 50
  },
  {
    name: 'Game Development Battles',
    types: ['Solo', 'Duo', 'Trio', 'Quadro'],
    price: 100
  },
  {
    name: 'Hackathon',
    types: ['Solo', 'Duo', 'Trio', 'Quadro'],
    price: 100
  },
  {
    name: 'Paper Presentation',
    types: ['Solo'],
    price: 50
  },
  {
    name: 'Poster Presentation',
    types: ['Solo', 'Quadro'],
    price: 100
  },
  {
    name: 'Prompt Craft',
    types: ['Solo', 'Quadro'],
    price: 50
  },
  {
    name: 'Treasure Hunt',
    types: ['Solo', 'Quadro'],
    price: 50
  },
  {
    name: 'Dedicate a Song',
    types: ['Solo'],
    price: 30
  },
  {
    name: 'Game Arcade',
    types: ['Solo', 'Duo', 'Trio', 'Quadro'],
    price: 50
  },
  {
    name: 'Ipl Auction',
    types: ['Solo'],
    price: 50
  },
  {
    name: 'Meme Contest',
    types: ['Solo'],
    price: 50
  },
  {
    name: 'Tug of War',
    types: ['Solo'],
    price: 20
  },
  {
    name: 'Open Mic',
    types: ['Solo'],
    price: 0
  }
];

export const PASS_TYPES = {
  regular: {
    name: 'Regular',
    multiplier: 1,
    description: 'Select specific events to attend',
    price: null // Price calculated based on selected events
  },
  Solo: {
    name: 'Solo Pass',
    description: 'Access to all events for one person',
    price: 410
  },
  Duo: {
    name: 'Duo Pass',
    description: 'Access to all events for two people',
    price: 775
  },
  Trio: {
    name: 'Trio Pass',
    description: 'Access to all events for three people',
    price: 1165
  },
  Quadro: {
    name: 'Quadro Pass',
    description: 'Access to all events for four people',
    price: 1550
  }
}; 