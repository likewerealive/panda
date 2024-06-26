import type { CssPropertyDefinition, GlobalVarsDefinition } from '@pandacss/types'
import { outdent } from 'outdent'
import { stringify } from './stringify'

interface GlobalVarsOptions {
  globalVars?: GlobalVarsDefinition
  cssVarRoot: string
}

export class GlobalVars {
  keys: Set<string>
  vars: string[]
  names: string[]

  constructor(private options: GlobalVarsOptions) {
    const { globalVars = {} } = options

    this.keys = new Set(Object.keys(globalVars))
    const arr = Array.from(this.keys)

    this.names = arr.map((v) => `${v.slice(2)}`)
    this.vars = arr.map((v) => `var(${v})`)
  }

  isEmpty() {
    return this.keys.size === 0
  }

  toString() {
    const { globalVars = {}, cssVarRoot } = this.options
    return stringifyGlobalVars(globalVars, cssVarRoot)
  }
}

const stringifyGlobalVars = (globalVars: GlobalVarsDefinition, cssVarRoot: string) => {
  if (!globalVars) return ''

  const decls = [] as string[]

  const vars = { [cssVarRoot]: {} as Record<string, string> }
  const base = vars[cssVarRoot]

  Object.entries(globalVars).forEach(([key, value]) => {
    if (typeof value === 'string') {
      base[key] = value
      return
    }
    const css = stringifyProperty(key, value)
    decls.push(css)
  })

  const lines: string[] = []
  lines.push(stringify(vars))
  lines.push(...decls)

  return lines.join('\n\n')
}

function stringifyProperty(key: string, config: CssPropertyDefinition) {
  return outdent`@property ${key} {
    syntax: '${config.syntax}';
    inherits: ${config.inherits};
    ${config.initialValue == null ? '' : `initial-value: ${config.initialValue};`}
  }`
}
