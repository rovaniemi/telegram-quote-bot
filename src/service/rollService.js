import { sendMessage } from '../bot/botOutput'

const roll = (msg, match) => {
  const input = match[4]
  let length = 8
  let output = 0
  if (!isNaN(input) && input > 0) {
    output = randomIntFromInterval(1, input)
    length = input.toString().length
  } else {
    output = randomIntFromInterval(1, 99999999)
  }
  output = pad(output, length)
  sendMessage(msg, output)
}

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const pad = (n, width, z) => {
  z = z || '0'
  n = n + ''
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

export default {
  roll: roll
}
