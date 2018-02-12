import React from 'react'

import {
    NativeModules,
} from 'react-native'

const DBModule = NativeModules.DBModule

const DB_METHODS = ['insert','insert_or_update','update','delete','read']

const TABLES = [] //TODO define user specific tables

const COMMON_ERROR_MSG = 'Some params for building the query are missing'

export const initializeDB = () => {
    return initDbonNative()
}


export const queryBuilder = () => {
    const builder = {
        havingClause: null,
        groupByClause: null,
        orderByClause: null,
        limitCount: null,
        whereArgs: null,
        method: (methodName) => {
            this.methodName = methodName
            if(!DB_METHODS.includes(this.methodName))
                throw new Error('Unsupported DB operation')
            return builder
        },
        read: (tableName) => {
            this.methodName = 'read'
            this.tableName = tableName
            return builder            
        },
        insert: (tableName) => {
            this.methodName = 'insert'
            this.tableName = tableName
            return builder            
        },
        insertOrUpdate: (tableName) => {
            this.methodName = 'insert_or_update'
            this.tableName = tableName
            return builder            
        },
        update: (tableName) => {
            this.methodName = 'update'
            this.tableName = tableName
            return builder            
        },
        delete: (tableName) => {
            this.methodName = 'delete'
            this.tableName = tableName
            return builder            
        },
        table: (tableName) => {
            this.tableName = tableName
            return builder
        },
        values: (valuesJson) => {
            this.valuesJson = valuesJson
            return builder
        },
        columns: (columnValues) => {
            this.columnValues = columnValues
            return builder
        },
        where : (whereClause) => {
            this.whereClause = whereClause
            return builder
        },
        whereArguments: (whereArgs) => {
            this.whereArgs = whereArgs
            return builder
        },
        having: (havingClause) => {
            this.havingClause = havingClause
            return builder
        },
        groupBy: (groupByClause) => {
            this.groupByClause = groupByClause
            return builder
        },
        orderBy: (orderByClause) => {
            this.orderByClause = orderByClause
            return builder
        },
        limit: (limitCount) => {
            this.limitCount = limitCount
            return builder
        },
        build: () => {
            return builder.validateParams() && builder.runQuery()
        },
        validateParams: () => {
            if (!TABLES.includes(this.tableName)) throw new Error('Table not valid')

            if ( ( this.valuesJson === null || typeof this.valuesJson === 'undefined' ) && ['update','insert_or_update','insert'].includes(this.methodName) ) throw new Error(COMMON_ERROR_MSG)
            
            return true
        },
        runQuery: () => {
            switch(this.methodName){
                case 'insert':
                    return insert(this.tableName, this.valuesJson)
                case 'insert_or_update':
                    return new Promise ((resolve,reject) => {
                        insertOrUpdate(this.tableName, this.valuesJson).then((result) => {
                            if(result < 0)
                                update(this.tableName, this.valuesJson, this.whereClause, this.whereArgs).then((result) => {
                                    if(result < 0)
                                        reject('Insert or update failed '+result)
                                    else
                                        resolve(result)
                                })
                            else
                                resolve(result)
                        })
                    })
                case 'update':
                    return update(this.tableName, this.valuesJson, this.whereClause, this.whereArgs)
                case 'delete':
                    return deleteRows(this.tableName, this.valuesJson, this.whereClause, this.whereArgs)
                case 'read':
                    return getResults(this.tableName, this.columnValues, this.whereClause, this.whereArgs, this.groupByClause, this.havingClause, this.orderByClause, this.limitCount)
            }
        }
    }
    return builder
}

async function initDbonNative() {
    var result = await DBModule.onMountSahaApplication()
    return result
}

async function insert (tableName, values) {
    var insertResult = await DBModule.insert(tableName, values);
    return insertResult
}

async function update (tableName, values, whereClause, whereArguments) {
    var updateResult = await DBModule.update(tableName, whereClause, whereArguments, values);
    return updateResult
}

async function insertOrUpdate(tableName, values){
    var insertResult = await DBModule.insertOrUpdate(tableName, values);
    return insertResult
}

async function deleteRows (tableName, whereClause, whereArguments) {
    var deleteResult = await DBModule.delete(tableName, whereClause, whereArguments, values);
    return deleteResult
}

async function getResults (tableName, columns, whereClause, whereArguments, groupBy, having, orderBy, limit) {
    var results = await DBModule.getResults(tableName, columns, whereClause, whereArguments, groupBy, having, orderBy, limit)
    return results
}
