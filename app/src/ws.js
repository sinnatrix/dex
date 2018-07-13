
export const socket = new window.WebSocket(`ws://${window.location.host}/api/v1`)

export const send = socket.send.bind(socket)
