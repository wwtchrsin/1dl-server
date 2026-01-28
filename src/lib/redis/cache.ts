import * as redisConn from "./conn"
import { encodeMsgcounts, decodeMsgcounts } from "./miscs"
import type { Zoneid, Districtid } from "../database/interfaces"
import logger from "../logger"

export const changeZoneMsgcount = async (zoneid: Zoneid, delta: number): 
  Promise<boolean> => {
    let TAG = "redis/cache/changeZoneMsgcount"
    let { region, district, zone } = zoneid
    let key = `${redisConn.redisns}:msgcounts:zones:${region}:${district}`
    try {
      let client = await redisConn.getClient()
      await client.hIncrBy(key, `${zone}`, delta)
      logger.debug({ zoneid, delta }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        region: region,
        district: district,
        zone: zone,
        delta: delta,
        stack: err.stack,
        message: err.message,
      }
      logger.error(errmsg, `${TAG}#RUNTIME_ERROR`)
      return false
    }
  }

export const changeZoneMsgcounts = async (zoneids: Zoneid[], delta: number):
  Promise<boolean> => {
    let TAG = "redis/cache/changeZoneMsgcounts"
    try {
      let client = await redisConn.getClient()
      let promises: Promise<number | string>[] = []
      for ( let zoneid of zoneids ) {
        let { region, district, zone } = zoneid
        let key = `${redisConn.redisns}:msgcounts:zones:${region}:${district}`
        promises.push(client.hIncrBy(key, `${zone}`, delta))
      }
      await Promise.all(promises)
      logger.debug({ zoneids: zoneids.length, delta }, `${TAG}#DONE`)
      return true
    } catch (err) {
      let errmsg = {
        zoneids: zoneids.length,
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

export const updateZoneMsgcounts = async (districtid: Districtid, msgcounts: 
  Record<string | number, number>): Promise<boolean> => {
    let TAG = "redis/cache/updateZoneMsgcounts"
    let { region, district } = districtid
    let key = `${redisConn.redisns}:msgcounts:zones:${region}:${district}`
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

export const getZoneMsgcounts = async (districtid: Districtid): 
  Promise<{ error: boolean, data: Record<string, number> | undefined }> => {
    let TAG = "redis/cache/getZoneMsgcounts"
    let { region, district } = districtid
    let key = `${redisConn.redisns}:msgcounts:zones:${region}:${district}`
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

    


    
