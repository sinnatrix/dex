
export const socket = new window.WebSocket(`ws://${window.location.host}/api/`)

export const send = socket.send.bind(socket)
