import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['sketch-plugin']
export const metadata = createIntegrationMetadata(config)

export default function SketchPluginPage() {
  return <IntegrationPage config={config} />
}
