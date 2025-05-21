export const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'https://rps-api.cashcall.pro/';

export const choiceEmojis = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
} as const;

export const API_URL_BOT_SCORE = `${SOCKET_SERVER_URL}/bot/score`;