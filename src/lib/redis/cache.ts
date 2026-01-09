import * as redisConn from "./conn"
import { encodeMsgcounts, decodeMsgcounts } from "./miscs"
import type { Roomid, Districtid } from "../database/interfaces"
import logger from "../logger"

export const changeRoomMsgcount = async (roomid: Roomid, delta: number): 
  Promise<boolean> => {
    let TAG = "redis/cache/changeRoomMsgcount"
    let { region, district, room } = roomid
    let key = `${redisConn.redisns}:msgcounts:rooms:${region}:${district}`
    try {
      let client = await redisConn.getClient()
      await client.hIncrBy(key, `${room}`, delta)
      logger.debug({ roomid, delta }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        region: region,
        district: district,
        room: room,
        delta: delta,
        stack: err.stack,
        message: err.message,
      }
      logger.error(errmsg, `${TAG}#RUNTIME_ERROR`)
      return false
    }
  }

export const changeRoomMsgcounts = async (roomids: Roomid[], delta: number):
  Promise<boolean> => {
    let TAG = "redis/cache/changeRoomMsgcounts"
    try {
      let client = await redisConn.getClient()
      let promises: Promise<number | string>[] = []
      for ( let roomid of roomids ) {
        let { region, district, room } = roomid
        let key = `${redisConn.redisns}:msgcounts:rooms:${region}:${district}`
        promises.push(client.hIncrBy(key, `${room}`, delta))
      }
      await Promise.all(promises)
      logger.debug({ roomids: roomids.length, delta }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        roomids: roomids.length,
        delta: delta,
        stack: err.stack,
        message: err.message,
      }
      logger.error(errmsg, `${TAG}#RUNTIME_ERROR`)
      return false
    }
  }

export const changeDistrictMsgcount = async (districtid: Districtid, delta: number):
  Promise<boolean> => {
    let TAG = "redis/cache/changeDistrictMsgcount"
    let { region, district } = districtid
    let key = `${redisConn.redisns}:msgcounts:districts:${region}`
    try {
      let client = await redisConn.getClient()
      await client.hIncrBy(key, `${district}`, delta)
      logger.debug({ districtid, delta }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        region: region,
        district: district,
        delta: delta,
        stack: err.stack,
        message: err.message,
      }
      logger.error(errmsg, `${TAG}#RUNTIME_ERROR`)
      return false
    }
  }

export const changeDistrictMsgcounts = async (districtids: Districtid[], delta: number):
  Promise<boolean> => {
    let TAG = "redis/cache/changeDistrictMsgcounts"
    try {
      let client = await redisConn.getClient()
      let promises: Promise<number | string>[] = []
      for ( let districtid of districtids ) {
        let { region, district } = districtid
        let key = `${redisConn.redisns}:msgcounts:districts:${region}`
        promises.push(client.hIncrBy(key, `${district}`, delta))
      }
      await Promise.all(promises)
      logger.debug({ districtids: districtids.length, delta }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        districtids: districtids.length,
        delta: delta,
        stack: err.stack,
        message: err.message,
      }
      logger.error(errmsg, `${TAG}#RUNTIME_ERROR`)
      return false
    }
  }

export const updateRoomMsgcounts = async (districtid: Districtid, msgcounts: 
  Record<string | number, number>): Promise<boolean> => {
    let TAG = "redis/cache/updateRoomMsgcounts"
    let { region, district } = districtid
    let key = `${redisConn.redisns}:msgcounts:rooms:${region}:${district}`
    try {
      let client = await redisConn.getClient()
      await client.hSet(key, encodeMsgcounts(msgcounts))
      logger.debug({ districtid, msgcounts: !!msgcounts }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        region: region,
        district: district,
        msgcounts: !!msgcounts,
        stack: err.stack,
        message: err.message,
      }
      logger.error(errmsg, `${TAG}#RUNTIME_ERROR`)
      return false
    }
  }

export const updateDistrictMsgcounts = async (region: string, msgcounts:
  Record<string | number, number>): Promise<boolean> => {
    let TAG = "redis/cache/updateDistrictMsgcounts"
    let key = `${redisConn.redisns}:msgcounts:districts:${region}`
    try {
      let client = await redisConn.getClient()
      await client.hSet(key, encodeMsgcounts(msgcounts))
      logger.debug({ region, msgcounts: !!msgcounts }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        region: region,
        msgcounts: !!msgcounts,
        stack: err.stack,
        message: err.message,
      }
      logger.error(errmsg, `${TAG}#RUNTIME_ERROR`)
      return false
    }
  }

export const getRoomMsgcounts = async (districtid: Districtid): 
  Promise<{ error: boolean, data: Record<string, number> | undefined }> => {
    let TAG = "redis/cache/getRoomMsgcounts"
    let { region, district } = districtid
    let key = `${redisConn.redisns}:msgcounts:rooms:${region}:${district}`
    try {
      let client = await redisConn.getClient()
      let msgcounts = (await client.hGetAll(key)) as Record<string, any> 
      if ( !msgcounts?.timestamp ) {
        logger.debug({ districtid }, `${TAG}#ENTRY_NOT_FOUND`)
        return {
          error: false,
          data: undefined,
        }
      }
      logger.debug({ districtid }, `${TAG}#DONE`)
      return {
        error: false,
        data: decodeMsgcounts(msgcounts),
      }
    } catch (err) {
      let errmsg = {
        region: region,
        district: district,
        stack: err.stack,
        message: err.message,
      }
      logger.error(errmsg, `${TAG}#RUNTIME_ERROR`)
      return {
        error: true,
        data: undefined,
      }
    }
  }

export const getDistrictMsgcounts = async (region: string):
  Promise<{ error: boolean, data: Record<string, number> | undefined }> => {
    let TAG = "redis/cache/getDistrictMsgcounts"
    let key = `${redisConn.redisns}:msgcounts:districts:${region}`
    try {
      let client = await redisConn.getClient()
      let msgcounts = (await client.hGetAll(key)) as Record<string, any>
      if ( !msgcounts?.timestamp ) {
        logger.debug({ region }, `${TAG}#ENTRY_NOT_FOUND`)
        return {
          error: false,
          data: undefined,
        }
      }
      logger.debug({ region }, `${TAG}#DONE`)
      return {
        error: false,
        data: decodeMsgcounts(msgcounts),
      }
    } catch (err) {
      let errmsg = {
        region: region,
        stack: err.stack,
        message: err.message,
      }
      logger.error(errmsg, `${TAG}#RUNTIME_ERROR`)
      return {
        error: true,
        data: undefined,
      }
    }
  }

    


    
