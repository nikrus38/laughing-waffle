/* Страница /docs/: копирование примеров, поиск по оглавлению и подсветка раздела. */
(function () {
  /* --- Копирование блоков кода --- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (button) {
    var label = button.textContent;
    button.addEventListener('click', function () {
      var block = button.closest('.code');
      var code = block && block.querySelector('pre');
      if (!code) return;
      var text = code.innerText;

      function done() {
        button.textContent = 'Скопировано';
        button.classList.add('is-done');
        window.setTimeout(function () {
          button.textContent = label;
          button.classList.remove('is-done');
        }, 1600);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }

      function fallback() {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand('copy');
          done();
        } catch (error) {
          button.textContent = 'Не удалось';
        }
        document.body.removeChild(area);
      }
    });
  });

  /* --- Поиск по разделам --- */
  var search = document.querySelector('[data-doc-search]');
  var sidebar = document.querySelector('.docs-side');

  if (search && sidebar) {
    var links = Array.prototype.slice.call(sidebar.querySelectorAll('[data-doc-link]'));
    var groups = Array.prototype.slice.call(sidebar.querySelectorAll('.docs-group'));
    var empty = sidebar.querySelector('[data-doc-empty]');

    search.addEventListener('input', function () {
      var query = search.value.trim().toLowerCase();
      var visible = 0;

      links.forEach(function (link) {
        var match = !query || link.textContent.toLowerCase().indexOf(query) !== -1;
        link.hidden = !match;
        if (match) visible += 1;
      });

      groups.forEach(function (group) {
        var hasVisible = Array.prototype.some.call(
          group.querySelectorAll('[data-doc-link]'),
          function (link) { return !link.hidden; }
        );
        group.hidden = !hasVisible;
      });

      if (empty) empty.hidden = visible !== 0;
    });
  }

  /* --- Подсветка текущего раздела --- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('.docs-section'));
  if (!sections.length || !('IntersectionObserver' in window)) return;

  var markers = Array.prototype.slice.call(
    document.querySelectorAll('[data-doc-link], .docs-toc a')
  );

  function activate(id) {
    markers.forEach(function (marker) {
      var target = marker.getAttribute('data-doc-link') || marker.getAttribute('href').slice(1);
      var isActive = target === id;
      marker.classList.toggle('is-active', isActive);
      if (isActive) {
        marker.setAttribute('aria-current', 'true');
      } else {
        marker.removeAttribute('aria-current');
      }
    });
  }

  var visible = new Set();

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visible.add(entry.target.id);
        } else {
          visible.delete(entry.target.id);
        }
      });
      var first = sections.find(function (section) { return visible.has(section.id); });
      if (first) activate(first.id);
    },
    { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
  );

  sections.forEach(function (section) { observer.observe(section); });
})();
