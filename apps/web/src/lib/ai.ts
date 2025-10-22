export async function askGroq(payload: Record<string, any>) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI proxy failed (${res.status}): ${txt}`);
  }

  return res.json();
}
