export async function GET() {
  return new Response('Hello from test route', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
