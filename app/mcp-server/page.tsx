import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['mcp-server']
export const metadata = createIntegrationMetadata(config)

export default function McpServerPage() {
  return <IntegrationPage config={config} />
}
