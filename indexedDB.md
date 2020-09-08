# indexedDB 分享

[参考文档](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API/Using_IndexedDB "IndexedDB API")
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


#### 打开数据库
>接收两个参数，第一个是数据库名称

>第二个参数，就是数据库的版本号
>>重要：版本号是一个 unsigned long long 数字，这意味着它可以是一个特别大的数字，但不能使用浮点数，否则它将会被转变成离它最近的整数，这可能导致 upgradeneeded 事件不会被触发。例如，不要使用 2.4 作为版本号。
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
}
```

#### 构建数据库
键路径(keyPath)|键生成器(autoIncrement)| 描述
---|:---|:---
No|No|这种对象存储空间可以持有任意类型的值，甚至是像数字和字符串这种基本数据类型的值。每当我们想要增加一个新值的时候，必须提供一个单独的键参数。
Yes|No|这种对象存储空间只能持有 JavaScript 对象。这些对象必须具有一个和 key path 同名的属性。
No|Yes|这种对象存储空间可以持有任意类型的值。键会为我们自动生成，或者如果你想要使用一个特定键的话你可以提供一个单独的键参数。
Yes|Yes|这种对象存储空间只能持有 JavaScript 对象。通常一个键被生成的同时，生成的键的值被存储在对象中的一个和 key path 同名的属性中。然而，如果这样的一个属性已经存在的话，这个属性的值被用作键而不会生成一个新的键。

#### 增加、读取和删除数据
需要开启一个事务才能对你的创建的数据库进行操作。事务来自于数据库对象，而且你必须指定你想让这个事务跨越哪些对象仓库。

##### 创建事务
IDBDatabase.transaction(storeNames[, mode])
storeNames: 作用域，单个对象仓库或对象仓库数组，传空数组是表示跨越所有的对象存储空间
mode: 事务模式，可选，提供了模式: readonly, readwrite, versionchange,默认 readonly
>修改数据库模式或结构——包括新建或删除对象仓库或索引，只能在 versionchange 事务中才能实现。

```javascript
var transaction = db.transaction(["customers"], "readwrite")
```

##### 新增数据
IDBObjectStore.add(data[, key])
data: 新增的数据
key: 不可重复，当配置keyPath参数时不可选
```javascript
const customerData = [
  { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
  { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" }
]
transaction.oncomplete = function(event) {
  alert("All done!");
};

transaction.onerror = function(event) {
  // 错误处理
};

var objectStore = transaction.objectStore("customers");
customerData.forEach(function(customer) {
  var request = objectStore.add(customer);
  request.onsuccess = function(event) {
    // event.target.result === customer.ssn;
  };
})
```

##### 删除数据
IDBObjectStore.delete(key)
```javascript
var request = db.transaction(["customers"], "readwrite")
                .objectStore("customers")
                .delete("444-44-4444");
request.onsuccess = function(event) {
  // 删除成功！
}
```

##### 查询数据
IDBObjectStore.get(key) // 查询单条记录
```javascript
var transaction = db.transaction(["customers"]);
var objectStore = transaction.objectStore("customers");
var request = objectStore.get("444-44-4444");
request.onerror = function(event) {
  // 错误处理!
};
request.onsuccess = function(event) {
  // 对 request.result 做些操作！
  console.log('' + request.result);
}
```
IDBObjectStore.getAll() // 查询所有记录
IDBObjectStore.getAllKey() // 查询所有key
```javascript
var transaction = db.transaction(["customers"]);
var objectStore = transaction.objectStore("customers");
var request = objectStore.getAll();
request.onerror = function(event) {
  // 错误处理!
};
request.onsuccess = function(event) {
  // 对 request.result 做些操作！
  console.log('' + request.result);
}
```

##### 更新数据
```javascript
var objectStore = db.transaction(["customers"], "readwrite").objectStore("customers");
var request = objectStore.get("444-44-4444");
request.onerror = function(event) {
  // 错误处理
};
request.onsuccess = function(event) {
  // 获取我们想要更新的数据
  var data = event.target.result;

  // 更新你想修改的数据
  data.age = 42;

  // 把更新过的对象放回数据库
  var requestUpdate = objectStore.put(data);
   requestUpdate.onerror = function(event) {
     // 错误处理
   };
   requestUpdate.onsuccess = function(event) {
     // 完成，数据已更新！
   };
}
```

#### 索引
作用：索引的一个好处就是可以迅速定位数据，提高搜索速度
```javascript
  // 为该数据库创建一个对象仓库
  const objectStore = db.createObjectStore('name', { keyPath: 'myKey', autoIncrement: true })
  // 为对象仓库创建一个索引
  objectStore.createIndex("name", "name", { unique: false })
```
通过索引查询数据
```javascript
var index = objectStore.index("name");

index.get("Donna").onsuccess = function(event) {
  alert("Donna's SSN is " + event.target.result.ssn);
}
```

#### 游标
openCursor: 遍历对象存储空间中的所有值
openKeyCursor: 遍历对象存储空间中的所有key
```javascript
var objectStore = db.transaction("customers").objectStore("customers");

objectStore.openCursor().onsuccess = function(event) {
  var cursor = event.target.result;
  if (cursor) {
    alert("Name for SSN " + cursor.key + " is " + cursor.value.name);
    cursor.continue();
  }
  else {
    alert("No more entries!");
  }
}
```
>接收两个参数，第一个 key range 对象来限制被检索的项目的范围。
>第二个参数，指定迭代方向，next: 正序（默认），prev: 倒序，IDBCursor.nextunique | IDBCursor.prevunique: 过滤迭代时重复的索引

>当到达数据的末尾时（或者没有匹配 openCursor() 请求的条目）你仍然会得到一个成功回调，但是 result 属性是 null
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
index.openCursor(boundKeyRange, 'prev').onsuccess = function(event) {
  const cursor = event.target.result
  if (cursor) {
    // 当匹配时进行一些操作
    cursor.continue()
  }
}
```
>查看游标的 value 属性会带来性能消耗，因为对象是被懒生成的。当你使用 getAll() ，浏览器必须一次创建所有的对象。如果你仅仅想检索m键，那么使用游标将比使用 getAll() 高效得多。当然如果你想获取一个由对象仓库中所有对象组成的数组，请使用 getAll()

#### 安全
IndexedDB 使用同源原则，这意味着它把存储空间绑定到了创建它的站点的源（典型情况下，就是站点的域或是子域），所以它不能被任何其他源访问。

#### 地区化的排序
默认情况下，IndexedDB 根本不会处理国际化的字符串排序，所有的数据按照英文字母序排列。例如 Aaron 和 Áaron 在通讯录中理应相邻地排列，但实际Áaron排在字母z之后。如果要获取国际化的排序，需要将整个数据内容调入内存，然后由客户端 JavaScript 实现排序
