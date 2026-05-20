const AT_TOKEN = process.env.AIRTABLE_TOKEN;
const AT_BASE  = "appXULczro9jpfq92";
const AT_TABLE = "Events";
const AT_URL   = `https://api.airtable.com/v0/${AT_BASE}/${encodeURIComponent(AT_TABLE)}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const headers = {
    "Authorization": "Bearer " + AT_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    if (req.method === "GET") {
      let all = [], offset = null;
      do {
        const qs = new URLSearchParams({ "sort[0][field]": "date", "sort[0][direction]": "asc" });
        if (offset) qs.set("offset", offset);
        const r = await fetch(AT_URL + "?" + qs, { headers });
        const data = await r.json();
        if (data.error) throw new Error(data.error.message);
        all = [...all, ...(data.records || [])];
        offset = data.offset || null;
      } while (offset);
      return res.status(200).json({ records: all });
    }
    if (req.method === "POST") {
      const r = await fetch(AT_URL, { method: "POST", headers, body: JSON.stringify(req.body) });
      const data = await r.json();
      if (data.error) throw new Error(data.error.message);
      return res.status(200).json(data);
    }
    if (req.method === "PATCH") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing id" });
      const r = await fetch(AT_URL + "/" + id, { method: "PATCH", headers, body: JSON.stringify(req.body) });
      const data = await r.json();
      if (data.error) throw new Error(data.error.message);
      return res.status(200).json(data);
    }
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing id" });
      const r = await fetch(AT_URL + "/" + id, { method: "DELETE", headers });
      const data = await r.json();
      return res.status(200).json(data);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
