export async function GET(
  request: Request,
  context: { params: Promise<{ page: string }> },
) {
  const { page } = await context.params
  return Response.redirect(
    new URL(`/icons/icon-sitemaps/${encodeURIComponent(page)}`, request.url),
    308,
  )
}
