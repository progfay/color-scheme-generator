const calcContrast = require('color-contrast')
const color = require('onecolor')
const chalk = require('chalk')

const foreground = color(process.argv[2]).hex()
const STEP = 16

const passedColors = []

for (let r = 0; r < 256; r += STEP) {
  for (let g = 0; g < 256; g += STEP) {
    for (let b = 0; b < 256; b += STEP) {
      const background = color(`rgb(${r}, ${g}, ${b})`).hex()
      const contrast = calcContrast(foreground, background)
      if (contrast >= 7) passedColors.push(background)
    }
  }
}

const columns = Math.floor((process.stdout.columns - 1) * 0.1)
const rows = Math.ceil(passedColors.length / columns)
const padding = chalk.bgHex(foreground)(' ')

process.stdout.write(`${padding.repeat(columns * 10 + 1)}\n`)
for (let row = 0; row < rows; row++) {
  for (let state = 0; state < 3; state++) {
    for (let column = 0; column < columns; column++) {
      if (row * columns + column >= passedColors.length) {
        process.stdout.write(padding.repeat(10))
        continue
      }
      const background = passedColors[row * columns + column]
      process.stdout.write(padding + chalk.hex(foreground).bgHex(background)(` ${state === 1 ? background : '       '} `))
    }
    process.stdout.write(`${padding}\n`)
  }
  process.stdout.write(`${padding.repeat(columns * 10 + 1)}\n`)
}
