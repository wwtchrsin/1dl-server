import * as redisConn from "./conn"
import { limits } from "../database/limits"
import { encodeMsgcounts, decodeMsgcounts } from "./miscs"
import type { Roomid, Districtid, DistrictStats } from "../database/interfaces"
import logger from "../logger"

export const changeRoomMsgcount = async (roomid: Roomid, delta: number): 
  Promise<boolean> => {
    let TAG = "redis/cache/changeRoomMsgcount"
    let { region, district, room } = roomid
    let key = `${redisConn.redisns}:msgcounts:rooms:${region}:${district}`
    try {
      let client = await redisConn.getClient()
      await client.hIncrBy(key, `${room}`, delta)
      logger.debug({ roomid }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        region: region,
        district: district,
        room: room,
        stack: err.stack,
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
      logger.debug({ districtid }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        region: region,
        district: district,
        stack: err.stack,
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
      logger.debug({ districtid }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        region: region,
        district: district,
        stack: err.stack,
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
      logger.debug({ region }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        region: region,
        stack: err.stack,
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
      let msgcounts = await client.hGetAll(key)
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
      let msgcounts = await client.hGetAll(key)
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
      }
      logger.error(errmsg, `${TAG}#RUNTIME_ERROR`)
      return {
        error: true,
        data: undefined,
      }
    }
  }

    


    
