const calcContrast = require('color-contrast')
const color = require('onecolor')
const chalk = require('chalk')
const arg = require('arg')

const getArgs = () => {
  try {
    return arg(
      {
        '--foreground': String,
        '--background': String,
        '--threshold': Number,
        '--step': Number,

        '-f': '--foreground',
        '-b': '--background',
        '-t': '--threshold',
        '-s': '--step'
      },
      { permissive: true }
    )
  } catch (error) {
    console.error(chalk.red(error.message))
    process.exit()
  }
}

const args = getArgs()

if ((args['--foreground'] && args['--background']) || !(args['--foreground'] || args['--background'])) {
  console.error(chalk.red('Specify either one of --foreground or --backgound.'))
  process.exit()
}

const foreground = args['--foreground'] ? color(args['--foreground']).hex() : null
const background = args['--background'] ? color(args['--background']).hex() : null
const STEP = args['--step'] || 16
const threshold = args['--threshold'] || 7

const passedColors = []

for (let r = 0; r < 256; r += STEP) {
  for (let g = 0; g < 256; g += STEP) {
    for (let b = 0; b < 256; b += STEP) {
      const _color = color(`rgb(${r}, ${g}, ${b})`).hex()
      const contrast = foreground ? calcContrast(foreground, _color) : calcContrast(_color, background)
      if (contrast >= threshold) passedColors.push(_color)
    }
  }
}

const columns = Math.floor((process.stdout.columns - 1) * 0.1)
const rows = Math.ceil(passedColors.length / columns)
const padding = chalk.bgHex(foreground || background)(' ')

process.stdout.write(`${padding.repeat(columns * 10 + 1)}\n`)
for (let row = 0; row < rows; row++) {
  for (let state = 0; state < 3; state++) {
    for (let column = 0; column < columns; column++) {
      if (row * columns + column >= passedColors.length) {
        process.stdout.write(padding.repeat(10))
        continue
      }
      const _color = passedColors[row * columns + column]
      process.stdout.write(
        padding + chalk
          .hex(foreground || _color)
          .bgHex(background || _color)
          .bold(` ${state === 1 ? _color : '       '} `)
      )
    }
    process.stdout.write(`${padding}\n`)
  }
  process.stdout.write(`${padding.repeat(columns * 10 + 1)}\n`)
}
