import IntegrationPage from '../components/integrations/IntegrationPage'
import { createIntegrationMetadata, integrationCatalog } from '../components/integrations/integration-catalog'

const config = integrationCatalog['shopify-extension']
export const metadata = createIntegrationMetadata(config)

export default function ShopifyExtensionPage() {
  return <IntegrationPage config={config} />
}
