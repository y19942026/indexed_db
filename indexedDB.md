# indexedDB 分享

#### indexedDB 简介
IndexedDB 是一种底层 API，用于在客户端存储大量的结构化数据（也包括文件/二进制大型对象（blobs））。IndexedDB 是一个事务型数据库系统，类似于基于 SQL 的 RDBMS。 然而，不像 RDBMS 使用固定列表，IndexedDB 是一个基于 JavaScript 的面向对象数据库。IndexedDB 允许您存储和检索用键索引的对象；可以存储结构化克隆算法支持的任何对象。您只需要指定数据库模式，打开与数据库的连接，然后检索和更新一系列事务。

#### 特点
- 键值对储存。 IndexedDB 内部采用对象仓库（object store）存放数据。所有类型的数据都可以直接存入，包括 JavaScript 对象。对象仓库中，数据以"键值对"的形式保存，每一个数据记录都有对应的主键，主键是独一无二的，不能有重复，否则会抛出一个错误。

- 异步。 IndexedDB 操作时不会锁死浏览器，用户依然可以进行其他操作，这与 LocalStorage 形成对比，后者的操作是同步的。异步设计是为了防止大量数据的读写，拖慢网页的表现。

- 支持事务。 IndexedDB 支持事务（transaction），这意味着一系列操作步骤之中，只要有一步失败，整个事务就都取消，数据库回滚到事务发生之前的状态，不存在只改写一部分数据的情况。

- 同源限制 IndexedDB 受到同源限制，每一个数据库对应创建它的域名。网页只能访问自身域名下的数据库，而不能访问跨域的数据库。

- 储存空间大 IndexedDB 的储存空间比 LocalStorage 大得多，一般来说不少于 250MB，甚至没有上限。

- 支持二进制储存。 IndexedDB 不仅可以储存字符串，还可以储存二进制数据（ArrayBuffer 对象和 Blob 对象）。

#### [主要API](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API "IndexedDB API")

- 连接数据库
1. IDBOpenDBRequest: 表示一个打开数据库的请求。
1. IDBDatabase: 表示一个数据库连接。这是在数据库中获取事务的唯一方式。

- 接收和修改数据
1. IDBTransaction: 表示一个事务。在数据库上创建一个事务，指定作用域（例如要访问的存储对象），并确定所需的访问类型（只读或读写）。
1. IDBRequest: 处理数据库请求并提供对结果访问的通用接口。
1. IDBObjectStore: 表示允许访问通过主键查找的 IndexedDB 数据库中的一组数据的对象存储区。
1. IDBIndex: 也是为了允许访问 IndexedDB 数据库中的数据子集，但使用索引来检索记录而不是主键。这有时比使用 IDBObjectStore 更快。
1. IDBCursor: 迭代对象存储和索引。
1. IDBKeyRange: 定义可用于从特定范围内的数据库检索数据的键范围。


##### 打开数据库
>接收两个参数，第一个是数据库名称

>第二个参数，就是数据库的版本号
>>重要的：版本号是一个 unsigned long long 数字，这意味着它可以是一个特别大的数字，但不能使用浮点数，否则它将会被转变成离它最近的整数，这可能导致 upgradeneeded 事件不会被触发。例如，不要使用 2.4 作为版本号。
  var request = indexedDB.open("MyTestDatabase", 2.4); // 不要这么做，因为版本会被置为 2

>返回一个IDBDatabase对象
```javascript
const request = window.indexedDB.open('db')
request.onerror = function(event) {
  // Do something with request.errorCode!
}
request.onsuccess = function(event) {
  // Do something with request.result!
}
request.onupgradeneeded = function(event) {
  // 保存 IDBDataBase 接口
  const db = event.target.result

  // 为该数据库创建一个对象仓库
  const objectStore = db.createObjectStore('name', { keyPath: 'myKey', autoIncrement: true })
  objectStore.createIndex("name", "name", { unique: false })
}
```

##### 构建数据库
键路径(keyPath)|键生成器(autoIncrement)| 描述
---|:---|:---
No|No|这种对象存储空间可以持有任意类型的值，甚至是像数字和字符串这种基本数据类型的值。每当我们想要增加一个新值的时候，必须提供一个单独的键参数。
Yes|No|这种对象存储空间只能持有 JavaScript 对象。这些对象必须具有一个和 key path 同名的属性。
No|Yes|这种对象存储空间可以持有任意类型的值。键会为我们自动生成，或者如果你想要使用一个特定键的话你可以提供一个单独的键参数。
Yes|Yes|这种对象存储空间只能持有 JavaScript 对象。通常一个键被生成的同时，生成的键的值被存储在对象中的一个和 key path 同名的属性中。然而，如果这样的一个属性已经存在的话，这个属性的值被用作键而不会生成一个新的键。

##### 增加、读取和删除数据

##### 游标 openCursor、openKeyCursor
>接收两个参数，第一个 key range 对象来限制被检索的项目的范围。
```javascript
// 仅匹配 "Donna"
const singleKeyRange = IDBKeyRange.only('Donna')

// 匹配所有超过“Bill”的，包括“Bill”
const lowerBoundKeyRange = IDBKeyRange.lowerBound('Bill')

// 匹配所有超过“Bill”的，但不包括“Bill”
const lowerBoundOpenKeyRange = IDBKeyRange.lowerBound('Bill', true)

// 匹配所有不超过“Donna”的，但不包括“Donna”
const upperBoundOpenKeyRange = IDBKeyRange.upperBound('Donna', true)

// 匹配所有在“Bill”和“Donna”之间的，但不包括“Donna”
const boundKeyRange = IDBKeyRange.bound('Bill', 'Donna', false, true)

// 使用其中的一个键范围，把它作为 openCursor()/openKeyCursor 的第一个参数
index.openCursor(boundKeyRange).onsuccess = function(event) {
  const cursor = event.target.result
  if (cursor) {
    // 当匹配时进行一些操作
    cursor.continue()
  }
}
```
>第二个参数，指定迭代方向，next: 正序（默认），prev: 倒序，IDBCursor.nextunique | IDBCursor.prevunique: 过滤迭代时重复的索引
