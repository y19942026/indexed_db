
const p = (fun) => new Promise(fun)
window.onload = async () => {
  const request = window.indexedDB.open('test')
  p((resolve, reject) => {
    request.onsuccess = function(event) {
      const db = event.target.result
      console.log(db)
      resolve(db)
    }

    request.onerror = function(event) {
      console.log('数据库打开报错')
      reject(event)
    }

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      var objectStore = db.createObjectStore('person', { keyPath: 'id' });
      console.log(objectStore)
    }
  })
    .then((db) => {
      return p((resolve) => {
        var request = db.transaction(['person'], 'readwrite')
          .objectStore('person')
          .add({ id: 1, name: '张三', age: 24, email: 'zhangsan@example.com' });

        request.onsuccess = function (event) {
          console.log('数据写入成功');
          resolve(event)
        };
      })
    })

  // let db
  // request.onsuccess = function (event) {
  //   db = request.result;
  //   console.log('数据库打开成功', event, event.target.result, db);
  // }
  //
  // request.onupgradeneeded = function (event) {
  //   db = event.target.result;
  //   var objectStore;
  //   if (!db.objectStoreNames.contains('person')) {
  //     objectStore = db.createObjectStore('person', { keyPath: 'id' });
  //   }
  // }
  //
  // function add() {
  //   var request = db.transaction(['person'], 'readwrite')
  //     .objectStore('person')
  //     .add({ id: 1, name: '张三', age: 24, email: 'zhangsan@example.com' });
  //
  //   request.onsuccess = function (event) {
  //     console.log('数据写入成功');
  //   };
  //
  //   request.onerror = function (event) {
  //     console.log('数据写入失败');
  //   }
  // }

  // add()
}
