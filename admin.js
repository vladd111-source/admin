const supabaseUrl = 'https://hubrgeitdvodttderspj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YnJnZWl0ZHZvZHR0ZGVyc3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY0OTEsImV4cCI6MjA1ODc1MjQ5MX0.K44XhDzjOodHzgl_cx80taX8Vgg_thFAVEesZUvKNnA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 📊 Аналитика
function loadAnalytics() {
  const filter = document.getElementById("filterUser").value.trim();
  const from = document.getElementById("dateFrom").value;
  const to = document.getElementById("dateTo").value;

  let query = supabase.from("analytics").select("*").order("created_at", { ascending: false }).limit(100);
  if (filter) query = query.eq("telegram_id", filter);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to + 'T23:59:59');

  query.then(({ data, error }) => {
    const table = document.getElementById("analyticsTable");
    table.innerHTML = "";

    if (error) {
      table.innerHTML = `<tr><td colspan="4" class="p-2 text-red-600">Ошибка: ${error.message}</td></tr>`;
      return;
    }

    if (!data || data.length === 0) {
      table.innerHTML = `<tr><td colspan="4" class="p-2 text-gray-500">Нет данных</td></tr>`;
      return;
    }

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border-t p-2">${row.telegram_id}</td>
        <td class="border-t p-2">${row.event}</td>
        <td class="border-t p-2 whitespace-pre-wrap text-xs">${JSON.stringify(row.event_data, null, 2)}</td>
        <td class="border-t p-2">${new Date(row.created_at).toLocaleString()}</td>
      `;
      table.appendChild(tr);
    });
  });
}

// 📈 Статистика
function loadStats() {
  supabase.from("analytics").select("event, telegram_id").then(({ data: events }) => {
    if (!events) return;

    const users = new Set(events.map(e => e.telegram_id));
    const total = events.length;

    const freq = {};
    events.forEach(e => freq[e.event] = (freq[e.event] || 0) + 1);
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);

    document.getElementById("statUsers").textContent = users.size;
    document.getElementById("statEvents").textContent = total;
    document.getElementById("topEvents").innerHTML = top.map(([name, count]) => `<li>${name} — ${count}</li>`).join('');
  });
}

// ✅ Глобальная доступность
window.loadAnalytics = loadAnalytics;

document.addEventListener("DOMContentLoaded", () => {
  loadAnalytics();
  loadStats();
});
