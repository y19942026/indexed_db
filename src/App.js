import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { IndexedDBClass } from './indexedDB'
import './App.css'

function App() {
  const inputRef = useRef(null)
  const [val, setVal] = useState('')
  const [list, setList] = useState([])
  const db = new IndexedDBClass()

  const getList = () => {
    db.getAll().then(data => {
      console.log(123, data)
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

  const handleAdd = () => {
    db.add({ value: val, time: Date.now() })
    setVal('')
    setTimeout(() => {
      inputRef.current.focus()
      getList()
    })
  }

  const handleKeyPress = (e) => {
    if (e.charCode === 13) {
      handleAdd()
    }
  }

  const handleDel = v => {
    db.delete(v)
    getList()
  }

  return (
    <div className='App'>
      <header className='h3'>
        todo list
      </header>
      <input ref={inputRef} type='text' value={val} autoFocus onChange={handleChange} onKeyPress={handleKeyPress}/>
      <button onClick={handleAdd}>新增</button>

      <ul className='list'>
        {list.map(li => (
          <li key={li.time}>
            <div className='txt'>
              {moment(li.time).format('hh:mm ss')} - {li.value}
            </div>
            <i onClick={() => handleDel(li.time)}>×</i>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
