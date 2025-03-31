const supabaseUrl = 'https://hubrgeitdvodttderspj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YnJnZWl0ZHZvZHR0ZGVyc3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY0OTEsImV4cCI6MjA1ODc1MjQ5MX0.K44XhDzjOodHzgl_cx80taX8Vgg_thFAVEesZUvKNnA';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 📊 Аналитика (группировка по пользователям)
window.loadAnalytics = async function () {
  const filter = document.getElementById("filterUser").value.trim();
  const from = document.getElementById("dateFrom").value;
  const to = document.getElementById("dateTo").value;

  let query = supabase
    .from("analytics")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (filter) {
    query = query.eq("telegram_id", filter);
  }

  if (from) {
    const fromFormatted = new Date(from).toISOString().split('T')[0] + ' 00:00:00';
    query = query.gte("created_at", fromFormatted);
  }

  if (to) {
    const toFormatted = new Date(to).toISOString().split('T')[0] + ' 23:59:59';
    query = query.lte("created_at", toFormatted);
  }

  console.log("🔎 Фильтры:", { filter, from, to });

  const { data, error } = await query;
  const table = document.getElementById("analyticsTable");
  table.innerHTML = "";

  if (error) {
    console.error("❌ Ошибка запроса:", error.message);
    table.innerHTML = `<tr><td colspan="4" class="p-2 text-red-600">Ошибка: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    table.innerHTML = `<tr><td colspan="4" class="p-2 text-gray-500">Нет данных</td></tr>`;
    return;
  }

  // 👥 Группировка по telegram_id
  const grouped = {};
  data.forEach(row => {
    if (!grouped[row.telegram_id]) grouped[row.telegram_id] = [];
    grouped[row.telegram_id].push(row);
  });

  Object.entries(grouped).forEach(([userId, events]) => {
    const block = document.createElement("div");
    block.className = "mb-6 bg-white shadow rounded";

    const header = document.createElement("div");
    header.className = "px-4 py-2 border-b font-semibold text-purple-700 flex items-center";
    header.innerHTML = `<span class="mr-2 text-xl">🧑</span>Пользователь: ${userId}`;
    block.appendChild(header);

    const innerTable = document.createElement("table");
    innerTable.className = "min-w-full text-sm";
    innerTable.innerHTML = `
      <thead class="bg-gray-100 text-left">
        <tr>
          <th class="p-2">📌 Событие</th>
          <th class="p-2">📄 Данные</th>
          <th class="p-2">🕒 Время</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = innerTable.querySelector("tbody");
    events.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border-t p-2">${row.event}</td>
        <td class="border-t p-2 whitespace-pre-wrap text-xs">${JSON.stringify(row.event_data, null, 2)}</td>
        <td class="border-t p-2">${new Date(row.created_at).toLocaleString("ru-RU")}</td>
      `;
      tbody.appendChild(tr);
    });

    block.appendChild(innerTable);
    table.appendChild(block);
  });
};

// 📈 Статистика
window.loadStats = async function () {
  const { data: events, error } = await supabase.from("analytics").select("event, telegram_id");

  if (error || !events) {
    console.error("❌ Ошибка статистики:", error?.message);
    return;
  }

  const users = new Set(events.map(e => e.telegram_id));
  const total = events.length;

  const freq = {};
  events.forEach(e => freq[e.event] = (freq[e.event] || 0) + 1);
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  document.getElementById("statUsers").textContent = users.size;
  document.getElementById("statEvents").textContent = total;
  document.getElementById("topEvents").innerHTML = top.map(
    ([name, count]) => `<li>${name} — ${count}</li>`
  ).join('');
};

// ✅ Автоматическая загрузка
document.addEventListener("DOMContentLoaded", () => {
  loadAnalytics();
  loadStats();
});
