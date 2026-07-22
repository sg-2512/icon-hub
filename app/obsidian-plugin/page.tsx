import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['obsidian-plugin']
export const metadata = createIntegrationMetadata(config)

export default function ObsidianPluginPage() {
  return <IntegrationPage config={config} />
}
