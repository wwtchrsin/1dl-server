import type { WebSocket } from "ws"

export const clients = new Map<string, WebSocket>()

export const connidsByDeviceid = new Map<string, Set<string>>()

export const deviceidByConnid = new Map<string, string>()

export const connidsByLocation = new Map<string, Set<string>>()

export const locationByConnid = new Map<string, string>()

export const pingState = new Map<string, boolean>()
