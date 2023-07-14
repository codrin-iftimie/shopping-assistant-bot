import React from 'react'
import PropTypes from 'prop-types'

// import DeleteIcon from './delete'

import classes from './transcript.module.css'

const formatNumber = (n) => n < 10 ? '0' + n : n

const formatDateTime = (s) => {
  const date = new Date(s)

  const syear = date.getFullYear()
  let smonth = date.getMonth() + 1
  let sdate = date.getDate()

  let shour = date.getHours()
  let smins = date.getMinutes()
  let ssecs = date.getSeconds()

  smonth = formatNumber(smonth)
  sdate = formatNumber(sdate)

  shour = formatNumber(shour)
  smins = formatNumber(smins)
  ssecs = formatNumber(ssecs)

  return [[syear, smonth, sdate].join('-'), [shour, smins, ssecs].join(':')].join(' ')
}

export default function Transcript({
  filename = '',
  createdAt = '',
  content = '',
  role = '',
  onClick = undefined,
  onDelete = undefined,
}) {

  // let items = []
  // let index = -1
  // let flag = false

  // const tokens = data.split("\n")
  // for (let i = 0; i < tokens.length; i++) {
  //     const s = tokens[i].trim()
  //     if(s.indexOf(':') > 0 && s.indexOf('-->') > 0) {
  //         index++
  //         items.push({ timestamp: s, text: '' })
  //         flag = true
  //     } else if(flag) {
  //         items[index].text = s
  //         flag = false
  //     }
  // }

  const handleDelete = (e) => {
    e.stopPropagation()
    e.preventDefault()
    onDelete(filename)
  }

  // Multiply: &#215;
  // <div onClick={handleDelete} className={classes.iconButton}>
  //     <DeleteIcon color="#fff" />
  // </div>

  const containerClass = classes.container + ' ' + (role === 'user'? classes.human : classes.bot);
  return (
    <div className={containerClass} onClick={onClick}>
      <img src="" alt="avatar"></img>
        <div className={classes.top}>
          <div className={classes.datetime}>{ formatDateTime(createdAt) }</div>
        </div>
        <div className={classes.list}>
          { content }
      </div>
    </div>
  )
  // items.map((item, index) => {
  //     return (
  //         <div key={index} className={classes.item}>
  //             <div className={classes.timestamp}>{ item.timestamp }</div>
  //             <div className={classes.text}>{ item.text }</div>
  //         </div>
  //     )
  // })
}

Transcript.propTypes = {
  createdAt : PropTypes.instanceOf(Date),
  content: PropTypes.string,
  role: PropTypes.string,
}
