
type ContextCore = {}
type DefinitionCore = {
  $doc: string,
}

export interface PluginObj<TDefinitionExt = {}, TContextExt = {}> {
  getContext(): TContextExt,
  getValue: PluginFn<TDefinitionExt, TContextExt>,
}

type PluginFn<TDefinitionExt = {}, TContextExt = {}> = (
  fullPath: string,
  definition: DefinitionCore & TDefinitionExt,
  context: ContextCore & TContextExt,
) => any

type Plugin<TDefinitionExt = {}, TContextExt = {}> =
  | PluginObj<TDefinitionExt, TContextExt>
  | PluginFn<TDefinitionExt, TContextExt>

class Yayie {
  private _plugins: Array<Plugin> = []

  use<TDefinitionExt, TContextExt>(plugin: Plugin<TDefinitionExt, TContextExt>) {
    const yayie = new Yayie()
    yayie._plugins = [
      plugin as Plugin,
      ...this._plugins,
    ]
    return yayie
  }

  process(schema: any) {
    const context = this._getContext()
    return deepConvert('', schema, (fullName, definition) => this._callPlugins(fullName, definition, context))
  }

  private _callPlugins(fullPath: string, definition: any, context: any): any | undefined {
    for (const plugin of this._plugins) {
      const getValue = typeof plugin === 'function'
        ? plugin
        : plugin.getValue
      const value = getValue(fullPath, definition, context)
      if (value !== undefined) {
        return value
      }
    }
    return undefined
  }

  private _getContext() {
    let context = {}
    for (const plugin of this._plugins) {
      if (typeof plugin === 'object') {
        context = {
          ...context,
          ...plugin.getContext(),
        }
      }
    }
    return context
  }
}

export default new Yayie().use(defaultPlugin)

function deepConvert(prefix: string, obj: { [K: string]: any }, convert: (fullName: string, definition: any) => any): any {
  const keys = Object.keys(obj)
  const converted: { [K: string]: any } = {}
  for (const key of keys) {
    const value = obj[key]
    if ('$doc' in value) {
      converted[key] = convert(prefix + key, value)
    } else {
      converted[key] = deepConvert(prefix + key + '.', value, convert)
    }
  }
  return converted
}

function defaultPlugin(fullPath: string, definition: any, context: any) {
  console.log('defaultPlugin', fullPath)
  return definition.default
}
