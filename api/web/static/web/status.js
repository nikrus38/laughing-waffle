/* Страница /status/: обновляет живые проверки, не перезагружая страницу. */
(function () {
  var banner = document.querySelector('[data-banner]');
  if (!banner) return;

  var overallEl = document.querySelector('[data-overall]');
  var checkedEl = document.querySelector('[data-checked]');
  var uptimeEl = document.querySelector('[data-uptime]');
  var button = document.querySelector('[data-refresh]');
  var busy = false;

  function setVariant(state) {
    banner.classList.toggle('is-degraded', state === 'degraded');
    banner.classList.toggle('is-outage', state === 'outage');
  }

  function apply(data) {
    if (overallEl) overallEl.textContent = data.overallLabel;
    setVariant(data.overall);

    var time = (data.generatedAt || '').slice(11, 16);
    if (checkedEl && time) checkedEl.textContent = time;

    (data.components || []).forEach(function (item) {
      var rows = document.querySelectorAll('[data-component="' + item.code + '"]');
      Array.prototype.forEach.call(rows, function (row) {
        var state = row.querySelector('[data-state]');
        if (state) {
          state.textContent = item.ok ? 'Работает' : 'Сбой';
          state.classList.toggle('is-down', !item.ok);
        }

        var latency = row.querySelector('[data-latency]');
        if (latency) {
          latency.textContent = item.latencyMs ? item.latencyMs + ' мс' : 'меньше 1 мс';
        }

        var dot = row.querySelector('[data-dot]');
        if (dot) dot.classList.toggle('is-down', !item.ok);

        var uptime = row.querySelector('[data-component-uptime]');
        if (uptime && typeof item.uptime === 'number') {
          uptime.textContent = item.uptime.toFixed(2) + '%';
          uptime.classList.remove('is-empty');
        }
      });
    });

    if (uptimeEl && data.uptime && typeof data.uptime.uptime === 'number') {
      uptimeEl.textContent = data.uptime.uptime.toFixed(2) + '%';
    }
  }

  function load() {
    if (busy) return;
    busy = true;
    if (button) button.disabled = true;

    fetch('/api/status/', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(apply)
      .catch(function () {
        if (checkedEl) checkedEl.textContent = '—';
        banner.classList.add('is-degraded');
        if (overallEl) overallEl.textContent = 'Не удалось получить статус';
      })
      .then(function () {
        busy = false;
        if (button) button.disabled = false;
      });
  }

  if (button) button.addEventListener('click', load);

  window.setInterval(function () {
    if (document.hidden) return;
    load();
  }, 30000);
})();
