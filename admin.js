const supabaseUrl = 'https://hubrgeitdvodttderspj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YnJnZWl0ZHZvZHR0ZGVyc3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY0OTEsImV4cCI6MjA1ODc1MjQ5MX0.K44XhDzjOodHzgl_cx80taX8Vgg_thFAVEesZUvKNnA';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

window.loadAnalytics = async function () {
  console.log("📡 Отправляем запрос на Supabase...");

  const { data, error } = await supabase
    .from("analytics")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  console.log("📬 Ответ Supabase:", { data, error });

  const table = document.getElementById("analyticsTable");
  table.innerHTML = "";

  if (error) {
    console.error("❌ Ошибка запроса:", error.message);
    table.innerHTML = `<tr><td colspan="4" class="p-2 text-red-600">Ошибка: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    console.warn("⚠️ Данные не найдены");
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

  console.log(`✅ Загружено записей: ${data.length}`);
};
