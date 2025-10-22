// S9-f-end/api/proxy/[...path].js
// This creates a proxy at /api/proxy/* that forwards to Render backend

export default async function handler(req, res) {
  const { path } = req.query;
  const backendUrl = 'https://nexus-d2dx.onrender.com';
  
  // Remove 'proxy' from the path array
  const apiPath = Array.isArray(path) ? path.join('/') : '';
  const targetUrl = `${backendUrl}/${apiPath}`;
  
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
