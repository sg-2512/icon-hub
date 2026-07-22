import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['jetbrains-plugin']
export const metadata = createIntegrationMetadata(config)

export default function JetBrainsPluginPage() {
  return <IntegrationPage config={config} />
}
