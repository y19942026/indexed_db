import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { IndexedDBClass } from './indexedDB'
import './App.css'

let maxId = 0
function App() {
  const inputRef = useRef(null)
  const [val, setVal] = useState('')
  const [filter, setFilter] = useState('')
  const [index, setIndex] = useState('')
  const [list, setList] = useState([])
  const db = new IndexedDBClass()

  useEffect(() => {
    maxId = Math.max(...list.filter(({ id }) => Number.isInteger(id)).map(_ => _.id), maxId)
  }, [list])

  const getList = () => {
    db.getAll().then(data => {
      setList(data)
    })
  }

  useEffect(() => {
    setTimeout(() => {
      getList()
    }, 500)
  }, [])

  const handleChange = ({ target: { value } }) => {
    setVal(value)
  }

  const handleFilterChange = ({ target: { value: f } }) => {
    setFilter(f)
    const arr = []
    db.filter(cursor => {
      if (cursor === null) {
        setList(arr)
        return null
      }
      const { value: { value: v = '', time: t } = {}} = cursor
      if (f === '') {
        arr.push(cursor.value)
      } else if (v === f) {
        arr.push(cursor.value)
      } else if (t === +f) {
        arr.push(cursor.value)
      }
      cursor.continue()
    })
  }

  const handleIndexChange = ({ target: { value: i } }) => {
    setIndex(i)
    const arr = []
    db.index(cursor => {
      if (cursor === null) {
        setList(arr)
        return null
      }
      const { value: { value: v = '' } = {}} = cursor
      if (i === '') {
        arr.push(cursor.value)
      } else if (v === i) {
        arr.push(cursor.value)
      }
      cursor.continue()
    })
  }

  const handleAdd = () => {
    db.add({ value: val, time: Date.now(), id: maxId + 1 })
    setVal('')
    inputRef.current.focus()
    getList()
  }

  const handleKeyPress = (e) => {
    if (e.charCode === 13) {
      handleAdd()
    }
  }

  const handleCheckboxChange = (li, status) => {
    li.status = status
    db.update(li)
    getList()
  }

  const handleDel = (e, li) => {
    e.stopPropagation()
    const { time, value = '' } = li
    if (window.confirm(`确认删除[${value}]`)) {
      db.delete(time)
      getList()
    }
  }

  return (
    <div className='App'>
      <header>
        <div className='h3'>todo list</div>
        <label>
          新增：
          <input ref={inputRef} type='text' value={val} autoFocus onChange={handleChange} onKeyPress={handleKeyPress} />
        </label>
        {/*<button onClick={handleAdd}>新增</button>*/}

        <br/>
        <br/>

        <label>
          key查找：
          <input type='text' value={filter} onChange={handleFilterChange}/>
        </label>

        <br/>
        <br/>

        <label>
          index查找：
          <input type='text' value={index} onChange={handleIndexChange}/>
        </label>
      </header>
      <ul className='list'>
        {list.map(li => {
          const { status = false, time, value = '' } = li
          return (
            <li key={time}>
              <div className='txt'>
                {moment(time).format('hh:mm ss')} - {value}
              </div>
              <input checked={status} type='checkbox' className='checkbox' onChange={() => handleCheckboxChange(li, !status)} />
              <i onClick={e => handleDel(e, li)}>×</i>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default App
