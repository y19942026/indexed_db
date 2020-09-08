export class IndexedDBClass {
  db = null

  version = 1

  constructor() {
    const request = window.indexedDB.open('db')
    request.onerror = function(event) {
      console.log(event, '数据库打开报错')
    }

    request.onupgradeneeded = (event) => {
      console.log('onupgradeneeded')
      const db = event.target.result
      this.creatTable(db)
    }

    request.onsuccess = (event) => {
      console.log('onsuccess')
      this.db = event.target.result
    }
  }

  creatTable(db) {
    if (!db.objectStoreNames.contains('objectStore')) {
      const objectStore = db.createObjectStore('objectStore', { keyPath: 'time', autoIncrement: true })
      objectStore.createIndex('v', 'value', { unique: false })
      objectStore.createIndex('id', 'id', { unique: true })
    }
  }

  get(name) {
    return new Promise((resolve) => {
      const getDataFunc = () => {
        const transaction = this.db.transaction('objectStore', 'readwrite')
        const objectStore = transaction.objectStore('objectStore') // 获取存储空间
        const getRequest = objectStore.get(name)
        getRequest.onsuccess = function(e) {
          if (e.target && e.target.result) {
            resolve(e.target.result)
          } else {
            resolve()
          }
        }
      }
      if (this.db) {
        getDataFunc()
      }
    })
  }

  getAll() {
    return new Promise((resolve) => {
      const getDataFunc = () => {
        const transaction = this.db.transaction('objectStore', 'readwrite')
        const objectStore = transaction.objectStore('objectStore') // 获取存储空间
        const getRequest = objectStore.getAll()
        getRequest.onsuccess = function(e) {
          if (e.target && e.target.result) {
            resolve(e.target.result)
          } else {
            resolve()
          }
        }
      }
      if (this.db) {
        getDataFunc()
      }
    })
  }

  openCursor(cb) {
    const getDataFunc = () => {
      const transaction = this.db.transaction('objectStore', 'readwrite')
      const objectStore = transaction.objectStore('objectStore') // 获取存储空间
      const cursorRequest = objectStore.openCursor()
      cursorRequest.onsuccess = function(e) {
        const cursor = e.target.result
        cb(cursor)
      }
    }
    if (this.db) {
      getDataFunc()
    }
  }

  indexGet(name) {
    return new Promise((resolve) => {
      const getDataFunc = () => {
        const transaction = this.db.transaction('objectStore', 'readwrite')
        const objectStore = transaction.objectStore('objectStore') // 获取存储空间
        const indexRequest = objectStore.index('id')
        const getRequest = indexRequest.get(name)
        getRequest.onsuccess = function(e) {
          if (e.target && e.target.result) {
            resolve(e.target.result)
          } else {
            resolve()
          }
        }
      }
      if (this.db) {
        getDataFunc()
      }
    })
  }

  indexCursor(cb) {
    const getDataFunc = () => {
      const transaction = this.db.transaction('objectStore', 'readwrite')
      const objectStore = transaction.objectStore('objectStore') // 获取存储空间
      const indexRequest = objectStore.index('id')
      indexRequest.openCursor().onsuccess = function(e) {
        const index = e.target.result
        cb(index)
      }
    }
    if (this.db) {
      getDataFunc()
    }
  }

  update(value) {
    const updateDataFunc = () => {
      const transaction = this.db.transaction('objectStore', 'readwrite')
      const objectStore = transaction.objectStore('objectStore') // 获取存储空间
      objectStore.put(value)
    }
    if (this.db) {
      updateDataFunc()
    } else {
      this.queue.push(updateDataFunc)
    }
    return this
  }

  add(value) {
    const addDataFunc = () => {
      const transaction = this.db.transaction('objectStore', 'readwrite')
      const objectStore = transaction.objectStore('objectStore') // 获取存储空间
      objectStore.add(value)
    }
    if (this.db) {
      addDataFunc()
    }
    return this
  }

  delete(name) {
    const deleteDataFunc = () => {
      const transaction = this.db.transaction('objectStore', 'readwrite')
      const objectStore = transaction.objectStore('objectStore') // 获取存储空间
      objectStore.delete(name)
    }
    if (this.db) {
      deleteDataFunc()
    }
    return this
  }
}
