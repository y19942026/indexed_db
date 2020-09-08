import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { IndexedDBClass } from './indexedDB'
import './App.css'

let maxId = 100
const db = new IndexedDBClass()
function App() {
  const inputRef = useRef(null)
  const [val, setVal] = useState('')
  const [key, setKey] = useState('')
  const [cursor, setCursor] = useState('')
  const [index, setIndex] = useState('')
  const [radio, setRadio] = useState('0')
  const [list, setList] = useState([])

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

  const handleKeyChange = ({ target: { value: f } }) => {
    setKey(f)
    db.get(+f)
      .then(data => {
        setList(data ? [data] : [])
      })
  }

  const handleCursorChange = ({ target: { value: f } }) => {
    setCursor(f)
    const arr = []
    db.openCursor(cursor => {
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

  const handleIndexGetChange = ({ target: { value: i } }) => {
    setIndex(i)
    const arr = []
    db.indexGet(cursor => {
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

  const handleIndexCursorChange = ({ target: { value: s } }) => {
    setRadio(s)
    const arr = []
    db.indexCursor(cursor => {
      if (cursor === null) {
        setList(arr)
        return null
      }
      if (s === '0') {
        arr.push(cursor.value)
      } else if (s === '1' && cursor.value.status) {
        arr.push(cursor.value)
      } else if (s === '2' && !cursor.value.status) {
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
          <input
            ref={inputRef}
            type='text'
            value={val}
            autoFocus
            placeholder='val'
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
        </label>
        {/*<button onClick={handleAdd}>新增</button>*/}

        <br/>
        <br/>

        <label>
          get方法查找：
          <input
            type='text'
            value={key}
            placeholder='time'
            onChange={handleKeyChange}
          />
        </label>

        <br/>
        <br/>

        <label>
          cousor查找：
          <input
            type='text'
            value={cursor}
            placeholder='time | key'
            onChange={handleCursorChange}
          />
        </label>

        <br/>
        <br/>

        <label>
          index get查找：
          <input
            type='text'
            value={index}
            placeholder='id'
            onChange={handleIndexGetChange}
          />
        </label>

        <br/>
        <br/>

        <div>
          index cursor查找：
          <label>
            <input
              type='radio'
              name='status'
              checked={radio === '0'}
              value='0'
              placeholder='id'
              onChange={handleIndexCursorChange}
            />
            所有
          </label>
          <label>
            <input
              type='radio'
              name='status'
              checked={radio === '1'}
              value='1'
              placeholder='id'
              onChange={handleIndexCursorChange}
            />
            完成
          </label>
          <label>
            <input
              type='radio'
              name='status'
              checked={radio === '2'}
              value='2'
              placeholder='id'
              onChange={handleIndexCursorChange}
            />
            未完成
          </label>
        </div>
      </header>
      <ul className='list'>
        {list.map(li => {
          const { status = false, time, value = '' } = li
          return (
            <li key={time}>
              <div className='txt'>
                {time} - {value}
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
