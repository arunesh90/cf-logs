import { Client } from '@elastic/elasticsearch'

const esClient = new Client({
  node: process.env.ES_HOST
})

export default esClient
