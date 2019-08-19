import yayie, { PluginObj } from '..'

type EnvContextExt = {
  env: typeof process.env,
}
type EnvDefinitionExt = {
  env: string,
}

class EnvPlugin implements PluginObj<EnvDefinitionExt, EnvContextExt> {
  getContext() {
    console.log('EnvPlugin.getContext')
    return {
      env: process.env,
    }
  }
  getValue(fullPath: any, definition: { env: string | number; }, context: { env: { [x: string]: any; }; }) {
    return definition.env ? context.env[definition.env] : undefined
  }
}

const config = yayie
  .use(new EnvPlugin())
  .process({
    api: {
      user: {
        $doc: 'Username to access api',
        default: 'admin',
      },
      password: {
        $doc: 'Password to access api',
        env: 'API_PASSWORD',
      }
    }
  })

console.log(config)



