# node-public-tools

## About
Some tools.

### Feature
* commone logger utilities.

## usage

`yarn add node-public-tools`

### Logger

Logger will provide stdout for local dev and json format for fluentbit.

Logger 将在本地开发环境中提供标准输出（stdout），并为 Fluent Bit 提供 JSON 格式.

```javascript
const { logger } = require('node-public-tools')

logger.info('Hello world')
logger.error('error')
logger.debug('debug')
```