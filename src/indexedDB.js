export class IndexedDBClass {
  db = null

  version = 1

  constructor() {
    const request = window.indexedDB.open('db')
    request.onerror = function(event) {
      console.log(event, '数据库打开报错')
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      this.creatTable(db)
    }

    request.onsuccess = (event) => {
      this.db = event.target.result
      if (!this.db.objectStoreNames.contains('table')) {
        // 如果存在数据库但是没存在table这个表，就升级版本，再创建
        this.db.close()
        const newRequest = window.indexedDB.open('db', ++this.version)
        newRequest.onupgradeneeded = (newEvent) => {
          const newDb = newEvent.target.result
          this.creatTable(newDb)
        }

        newRequest.onsuccess = (newEvent) => {
          this.db = newEvent.target.result
        }
      }
    }
  }

  creatTable(db) {
    if (!db.objectStoreNames.contains('table')) {
      const objectStore = db.createObjectStore('table', { keyPath: 'time', autoIncrement: true })
      objectStore.createIndex('v', 'value', { unique: false })
      objectStore.createIndex('id', 'id', { unique: true })
    }
  }

  get(name) {
    return new Promise((resolve) => {
      const getDataFunc = () => {
        const transaction = this.db.transaction('table', 'readwrite')
        const objectStore = transaction.objectStore('table') // 获取存储空间
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
        const transaction = this.db.transaction('table', 'readwrite')
        const objectStore = transaction.objectStore('table') // 获取存储空间
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

  filter(cb) {
    const getDataFunc = () => {
      const transaction = this.db.transaction('table', 'readwrite')
      const objectStore = transaction.objectStore('table') // 获取存储空间
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

  index(cb) {
    const getDataFunc = () => {
      const transaction = this.db.transaction('table', 'readwrite')
      const objectStore = transaction.objectStore('table') // 获取存储空间
      const indexRequest = objectStore.index('v')
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
      const transaction = this.db.transaction('table', 'readwrite')
      const objectStore = transaction.objectStore('table') // 获取存储空间
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
      const transaction = this.db.transaction('table', 'readwrite')
      const objectStore = transaction.objectStore('table') // 获取存储空间
      objectStore.add(value)
    }
    if (this.db) {
      addDataFunc()
    }
    return this
  }

  delete(name) {
    const deleteDataFunc = () => {
      const transaction = this.db.transaction('table', 'readwrite')
      const objectStore = transaction.objectStore('table') // 获取存储空间
      objectStore.delete(name)
    }
    if (this.db) {
      deleteDataFunc()
    }
    return this
  }
}
