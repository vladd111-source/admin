const supabaseUrl = 'https://hubrgeitdvodttderspj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YnJnZWl0ZHZvZHR0ZGVyc3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY0OTEsImV4cCI6MjA1ODc1MjQ5MX0.K44XhDzjOodHzgl_cx80taX8Vgg_thFAVEesZUvKNnA';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

window.loadAnalytics = async function () {
  const table = document.getElementById("analyticsTable");
  table.innerHTML = "";

  const source = document.getElementById("dataSource").value;
  const filter = document.getElementById("filterUser").value.trim();
  const from = document.getElementById("dateFrom").value;
  const to = document.getElementById("dateTo").value;

  let query = supabase.from(source).select("*").limit(500);

  if (source === "analytics") {
    query = query.order("created_at", { ascending: false });
    if (filter) query = query.eq("telegram_id", filter);
    if (from) query = query.gte("created_at", new Date(from).toISOString().split('T')[0] + ' 00:00:00');
    if (to) query = query.lte("created_at", new Date(to).toISOString().split('T')[0] + ' 23:59:59');
  } else {
    query = query.order("timestamp", { ascending: false });
    if (filter) query = query.eq("telegram_id", filter);
    if (from) query = query.gte("timestamp", new Date(from).toISOString());
    if (to) query = query.lte("timestamp", new Date(to).toISOString());
  }

  const { data, error } = await query;
  if (error) {
    console.error("❌ Ошибка запроса:", error.message);
    table.innerHTML = `<tr><td colspan="4" class="p-2 text-red-600">Ошибка: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    table.innerHTML = `<tr><td colspan="4" class="p-2 text-gray-500">Нет данных</td></tr>`;
    return;
  }

  data.forEach(row => {
    const tr = document.createElement("tr");

    if (source === "analytics") {
      const eventStyle = row.event.toLowerCase().includes("ошибка")
        ? 'text-red-600 font-medium'
        : 'text-blue-600 font-medium';

      const prettyData = Object.entries(row.event_data || {})
        .filter(([k]) => k !== "timestamp")
        .map(([k, v]) => `
          <div class="mb-1">
            <span class="inline-block w-24 font-medium text-gray-600">${k}:</span>
            <span class="text-gray-900">${v}</span>
          </div>
        `)
        .join('');

      tr.innerHTML = `
        <td class="border-t p-2 text-purple-700 font-semibold">${row.telegram_id}</td>
        <td class="border-t p-2 ${eventStyle}">${row.event}</td>
        <td class="border-t p-2 text-sm">${prettyData}</td>
        <td class="border-t p-2 text-sm text-gray-700">${new Date(row.created_at).toLocaleString("ru-RU")}</td>
      `;
    } else {
      tr.innerHTML = `
        <td class="border-t p-2 text-purple-700 font-semibold">${row.telegram_id}</td>
        <td class="border-t p-2 text-blue-600 font-medium">GPT-запрос</td>
        <td class="border-t p-2 text-sm whitespace-pre-wrap">
          <strong>Вопрос:</strong> ${row.question}<br>
          <strong>Ответ:</strong> ${row.answer}
        </td>
        <td class="border-t p-2 text-sm text-gray-700">${new Date(row.timestamp).toLocaleString("ru-RU")}</td>
      `;
    }

    table.appendChild(tr);
  });
};

window.loadStats = async function () {
  const source = document.getElementById("dataSource").value;

  const { data, error } = await supabase.from(source).select("*");
  if (error || !data) {
    console.error("❌ Ошибка статистики:", error?.message);
    return;
  }

  const users = new Set(data.map(row => row.telegram_id));
  document.getElementById("statUsers").textContent = users.size;
  document.getElementById("statEvents").textContent = data.length;

  if (source === "analytics") {
    const freq = {};
    data.forEach(e => freq[e.event] = (freq[e.event] || 0) + 1);
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
    document.getElementById("topEvents").innerHTML = top.map(
      ([name, count]) => `<li>${name} — ${count}</li>`
    ).join('');
  } else {
    document.getElementById("topEvents").innerHTML = `<li>GPT-запросов — ${data.length}</li>`;
  }
};

// ✅ Автоматическая загрузка
document.addEventListener("DOMContentLoaded", () => {
  loadAnalytics();
  loadStats();
  document.getElementById("dataSource").addEventListener("change", () => {
    loadAnalytics();
    loadStats();
  });
});
