import type { WebSocket } from "ws"

export const clients = new Map<string, WebSocket>()

export const connidsByLocation = new Map<string, Set<string>>()

export const locationByConnid = new Map<string, string>()

export const pingState = new Map<string, boolean>()
