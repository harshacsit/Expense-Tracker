import axiosClient from './axiosClient'

export const sendChatMessage = (houseId, message, history = []) =>
  axiosClient.post(`/houses/${houseId}/chat`, { message, history })
