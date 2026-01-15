import type { WebSocket } from "ws"

export const clients = new Map<string, WebSocket>()

export const usersByLocation = new Map<string, Set<string>>()

export const locationByUser = new Map<string, string>()

export const pingState = new Map<string, boolean>()
