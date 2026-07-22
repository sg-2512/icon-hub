import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['wordpress-plugin']
export const metadata = createIntegrationMetadata(config)

export default function WordPressPluginPage() {
  return <IntegrationPage config={config} />
}
