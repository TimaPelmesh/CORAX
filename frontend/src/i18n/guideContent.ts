/** Guide copy by locale — kept out of GuidePage so translations stay in i18n. */

export type GuideStep = { title: string; body: string }
export type GuideSection = {
  id: string
  title: string
  summary: string
  steps: GuideStep[]
  links?: { to: string; label: string }[]
}

export type GuideCopy = {
  eyebrow: string
  title: string
  subtitle: string
  toc: string
  tip: string
  tipBody: string
  searchPlaceholder: string
  searchEmpty: string
  openLabel: string
  sections: GuideSection[]
}

const GUIDE_RU: GuideCopy = {
  eyebrow: 'CORAX',
  title: 'Руководство',
  subtitle:
    'Где что лежит в панели. Агенты Windows и Linux — отдельные разделы ниже.',
  toc: 'Разделы',
  tip: 'Совет',
  tipBody:
    'Сервер поднимается одной командой: npm run docker:up. Сборка агента — только с панели по LAN-IP, не с 127.0.0.1.',
  searchPlaceholder: 'Найти раздел или шаг…',
  searchEmpty: 'Ничего не найдено. Попробуйте другое слово.',
  openLabel: 'Открыть',
  sections: [
    {
      id: 'start',
      title: 'С чего начать',
      summary: 'Роли, вход и общий порядок работы.',
      steps: [
        {
          title: 'Вход',
          body: 'Откройте панель в браузере (обычно порт 3000). Логин — локальная учётка CORAX. LDAP здесь только справочник людей для заявок, не вход.',
        },
        {
          title: 'Роли',
          body: 'Наблюдатель — смотрит. Редактор — меняет данные (ПК, заявки, сеть…). Админ — пользователи, LDAP, токены агентов, бэкапы, HTTPS.',
        },
        {
          title: 'Типичный день',
          body: 'Дашборд → проблемные ПК/заявки → карточка ПК или заявка → при необходимости сеть/принтеры/склад.',
        },
      ],
      links: [{ to: '/', label: 'Дашборд' }],
    },
    {
      id: 'dashboard',
      title: 'Дашборд',
      summary: 'Обзор парка и активных заявок на одном экране.',
      steps: [
        {
          title: 'Что смотреть',
          body: 'Плитки: число ПК, офлайн, заявки. Ниже — графики и сводки по парку.',
        },
        {
          title: 'Клик по цифре',
          body: 'Многие плитки ведут в список ПК или заявок с уже применённым фильтром.',
        },
      ],
      links: [{ to: '/', label: 'Дашборд' }],
    },
    {
      id: 'risks',
      title: 'Центр рисков',
      summary: 'Здоровье парка: антивирус, диски, обновления Windows.',
      steps: [
        {
          title: 'Что смотреть',
          body: 'Сводка по уровню риска и открытым проблемам. Подтверждение и игнор относятся к типу проблемы во всём парке, не к одному ПК.',
        },
        {
          title: 'ИИ-инсайты',
          body: 'Редактор может запросить комментарий локальной модели по рассчитанной сводке — без выдуманных уязвимостей.',
        },
      ],
      links: [{ to: '/risks', label: 'Центр рисков' }],
    },
    {
      id: 'computers',
      title: 'Компьютеры',
      summary: 'Парк ПК: список, карточка, теги, пробуждение.',
      steps: [
        {
          title: 'Список',
          body: 'Фильтры по тегу, ОС, статусу ping. Поиск — hostname, IP, серийник. Строка = краткая сводка; клик открывает карточку.',
        },
        {
          title: 'Карточка ПК',
          body: 'Железо, диски, сеть, ПО, периферия, история изменений, заявки по этому ПК, кто последний сидел в домене.',
        },
        {
          title: 'Теги ПК',
          body: 'Создаются в «Настройки → Теги ПК», навешиваются на ПК для группировки (этаж, отдел, критичность).',
        },
        {
          title: 'Wake-on-LAN',
          body: 'Кнопка пробуждения на карточке офлайн-ПК — если WOL разрешён в настройках и у ПК есть MAC.',
        },
      ],
      links: [
        { to: '/computers', label: 'Компьютеры' },
        { to: '/settings/tags', label: 'Теги ПК' },
        { to: '/settings/wol', label: 'Wake-on-LAN' },
      ],
    },
    {
      id: 'agent',
      title: 'Агент инвентаризации',
      summary:
        'ПК сами не появляются в панели. Их присылает агент. Сборка только с панели по LAN-IP. Windows: канонический пакет — ZIP PowerShell (7/10/11). EXE пока не 1:1 с PowerShell.',
      steps: [
        {
          title: 'Зачем агент',
          body: 'Без агента список «Компьютеры» пустой. Агент на каждом ПК собирает hostname, серийник, CPU/RAM, диски, NIC/IP/MAC, ОС, установленное ПО и периферию, затем шлёт отчёт на сервер. Повторяется по расписанию. Исходники в git (папка agent/) — шаблоны без URL и токена; на проде их не запускают.',
        },
        {
          title: 'Три пакета на панели',
          body: 'Настройки → Сборка агента.\n• ZIP PowerShell Windows (рекомендуется) — один архив на 7/10/11; запускайте корневой corax_send.bat. После отправки на рабочем столе появляется ярлык заявки /h#pc=ИМЯ-ПК.\n• Нативный EXE — состав инвентаря пока не 1:1 с PowerShell, для продакшена не основной.\n• ZIP Linux (bash) — отдельный раздел ниже.',
        },
        {
          title: 'Перед сборкой — LAN-IP',
          body: 'Откройте панель по адресу http://192.168.x.x:3000, не через 127.0.0.1 и не через Docker 172.x. Иначе в пакет попадёт адрес, недоступный с чужих ПК. Схему http/https на странице сборки сверьте с режимом HTTPS сервера; порт обычно 3000.',
        },
        {
          title: 'Сборка',
          body: 'Войдите как админ → Настройки → Сборка агента. Проверьте URL, выберите пакет, скачайте. URL сервера и токен вшиваются в файл автоматически — руками ничего вставлять не нужно. Каждая сборка создаёт новый токен. Один скачанный ZIP/EXE можно раскатать на много ПК.',
        },
        {
          title: 'Токены',
          body: 'Формат: public_id.secret. В базе хранится только HMAC, полный секрет — в EXE / agent_env.bat / agent_env.sh. Список и отзыв: Настройки → Токены агентов. Пересборка не отзывает старый токен, пока вы сами его не отзовёте. ZIP и agent_env.* не публикуйте и не коммитьте. Если секрет светили — отзовите токен и смените пароль admin.',
        },
        {
          title: 'Куда нельзя класть агент',
          body: 'Не запускайте скрипты из дерева сервера CORAX: рядом с docker-compose.yml, backend\\.env, run.py или из /opt/corax/agent/…. Там плейсхолдеры __INVENTORY_SERVER__, отчёт уходит «в никуда», на проде кажется, что «всё упало».\nWindows: распакуйте ZIP в %ProgramData%\\CORAX\\agent или на шару \\\\fileserver\\corax\\agent.\nLinux: только /opt/corax-agent (сервер остаётся в /opt/corax).',
        },
        {
          title: 'EXE C++ (не основной)',
          body: 'Состав полей пока не совпадает с PowerShell-агентом. Если всё же нужен EXE: двойной клик, для планировщика CORAX-Agent.exe --silent. После смены HTTP↔HTTPS скачайте пакет заново.',
        },
        {
          title: 'ZIP Windows — что внутри',
          body: 'corax_send.bat — всегда запускайте его (автовыбор Win7 или 10/11).\nagent_env.bat — URL и токен; при обновлении скриптов не затирать.\nagent_config.json — модули сбора.\nupdate_scripts.bat — безопасное обновление.\nwin10\\ — PowerShell 5+ (Windows 10/11).\nwin7\\ — Windows 7 / старый PowerShell.\nREADME_DEPLOY.txt — краткая шпаргалка в архиве.',
        },
        {
          title: 'ZIP Windows — первый запуск',
          body: 'Распакуйте архив в %ProgramData%\\CORAX\\agent (не в каталог сервера).\ncd /d %ProgramData%\\CORAX\\agent\ncorax_send.bat\nОкно не должно закрываться само: splash-анимация выключена (CORAX_SPLASH=1 только если нужна).\nНа рабочем столе появится ярлык «Заявка CORAX» (или CORAX-ticket) на http://СЕРВЕР:3000/h#pc=ИМЯ-ПК.\nДля планировщика: corax_send.bat nopause\nПроверка: «Компьютеры» — hostname и «последний отчёт».',
        },
        {
          title: 'ZIP Windows — расписание',
          body: 'Если при сборке включили автозапуск, в ZIP будет install_schedule.bat — один раз запустите от администратора. Задача называется CORAX-Agent и всегда стартует корневой corax_send.bat (ОС определяется каждый раз). Можно вручную: register_scheduled_task.ps1 из того же архива (PowerShell 2.0+).',
        },
        {
          title: 'ZIP Windows — обновление без потери токена',
          body: 'Нельзя распаковать новый ZIP поверх живой папки («с заменой» / unzip -o). Затрётся agent_env.bat — URL и токен пропадут, агент перестанет слать отчёты.\nПравильно:\n1. Новый ZIP с панели распаковать во временную папку, например C:\\temp\\corax-agent-new.\n2. Из живой папки:\ncd /d %ProgramData%\\CORAX\\agent\nupdate_scripts.bat C:\\temp\\corax-agent-new\nagent_env.bat останется. Можно копировать вручную только win10\\, win7\\, corax_send.bat — agent_env.bat не трогать.',
        },
        {
          title: 'Что присылает и как проверить',
          body: 'Hostname, серийник, CPU/RAM, диски, NIC/IP/MAC, ОС, ПО, периферия.\nAPI: POST http://<LAN-IP>:3000/api/v1/agent/inventory\nAuthorization: Bearer <токен>\nБез токена API отвечает отказом. Если ПК не появился: сеть до :3000, URL не 127.0.0.1, агент не из git сервера, токен не отозван.',
        },
        {
          title: 'HTTPS',
          body: 'Один порт :3000 = одна схема. Включили TLS в Настройки → HTTPS → перезапуск контейнера → пересоберите агентов с https://. Старый пакет с http:// отчёты больше не отправит. На ПК агентов нужен доверенный ca.crt (GPO или scripts/install-corax-ca.bat в репозитории).',
        },
        {
          title: 'Типичные ошибки (Windows)',
          body: 'Запуск из git сервера → отчёт никуда не уходит. Кладите ZIP в %ProgramData%\\CORAX\\agent.\nURL 127.0.0.1 или Docker 172.x → собирайте, открыв панель по LAN-IP.\nРаспаковка нового ZIP поверх живой папки → пропал токен. Только update_scripts.bat.\nОкно cmd пропало на «анимации» → старый splash. Обновите ZIP с панели (splash больше не запускается).\nСменили HTTP↔HTTPS — скачайте пакет заново.',
        },
      ],
      links: [
        { to: '/settings/agent-bundle', label: 'Сборка агента' },
        { to: '/settings/agent-tokens', label: 'Токены' },
        { to: '/computers', label: 'Компьютеры' },
      ],
    },
    {
      id: 'agent-linux',
      title: 'Linux-агент',
      summary:
        'ZIP bash только в /opt/corax-agent. Не путать с каталогом сервера /opt/corax. Обновлять скрипты — update_scripts.sh, не unzip -o поверх живой папки.',
      steps: [
        {
          title: 'Два каталога — не путать',
          body: '/opt/corax — сервер (git, Docker). Агент отсюда не запускать.\n/opt/corax-agent — только ZIP с панели. Сюда распаковывать и запускать.',
        },
        {
          title: 'Первый запуск',
          body: 'Панель → Сборка агента → ZIP Linux (bash) → скачать (панель открыта по LAN-IP).\nНа хосте:\nsudo mkdir -p /opt/corax-agent\nsudo unzip -o corax-agent-linux-*.zip -d /opt/corax-agent\ncd /opt/corax-agent\nchmod +x run_console.sh corax_send.sh inventory_agent.sh install_cron.sh update_scripts.sh\n/bin/sh ./run_console.sh\nКопировать agent_env.sh.example без правки URL/токена нельзя — агент откажется стартовать (EXIT 2). Нужен ZIP с панели.',
        },
        {
          title: 'Файлы в ZIP',
          body: 'run_console.sh — основной консольный запуск (рекомендуется).\ncorax_send.sh — то же (алиас).\ninventory_agent.sh — ядро сбора.\nagent_env.sh — URL + токен (генерирует панель; не коммитить).\nagent_config.json — модули.\ninstall_cron.sh — cron.\nsystemd/ — timer.\nupdate_scripts.sh — обновить скрипты, не трогая agent_env.sh.\nREADME.txt — шпаргалка в архиве.',
        },
        {
          title: 'Расписание',
          body: 'sudo ./install_cron.sh из /opt/corax-agent.\nЛибо systemd timer из каталога systemd/ внутри ZIP.',
        },
        {
          title: 'Обновление без потери токена',
          body: 'unzip -o new.zip -d /opt/corax-agent затирает agent_env.sh — URL и токен пропадут.\nПравильно:\nsudo unzip -o corax-agent-linux-*.zip -d /tmp/corax-agent-new\nsudo /bin/sh /opt/corax-agent/update_scripts.sh /tmp/corax-agent-new\nЛибо: unzip -o new.zip -x agent_env.sh -d /opt/corax-agent — только если agent_env.sh уже есть. Первая установка — без -x.',
        },
        {
          title: 'Безопасность',
          body: 'Агент не читает и не пишет server backend/.env и БД. Временные файлы только в /tmp/corax-agent.* (маркер .corax_workdir). Cleanup удаляет только этот temp — никогда /opt, .env, volumes. Запрещён запуск из дерева сервера, пока не задан CORAX_AGENT_ALLOW_IN_SOURCE=1 (на проде не рекомендуется).',
        },
        {
          title: 'Типичные ошибки (Linux)',
          body: 'Запуск из /opt/corax/agent/linux — неверно. ZIP только в /opt/corax-agent.\nunzip -o поверх живого агента затирает токен — пользуйтесь update_scripts.sh.\nURL 127.0.0.1 с других хостов не доходит. Собирайте по LAN-IP.',
        },
      ],
      links: [
        { to: '/settings/agent-bundle', label: 'Сборка агента' },
        { to: '/computers', label: 'Компьютеры' },
      ],
    },
    {
      id: 'software',
      title: 'ПО и каталог',
      summary: 'Сводка по софту и железу по всему парку.',
      steps: [
        {
          title: 'Зачем',
          body: 'Узнать, на скольких ПК стоит программа, какая ОС/RAM доминирует, какие производители встречаются.',
        },
        {
          title: 'Как пользоваться',
          body: 'Выберите срез (ПО, устройства, ОС…), при необходимости откройте список хостов с этим ПО.',
        },
      ],
      links: [{ to: '/software', label: 'Каталог ПО' }],
    },
    {
      id: 'printers',
      title: 'Принтеры',
      summary: 'SNMP-обнаружение и опрос расходников.',
      steps: [
        {
          title: 'Сканирование',
          body: 'Запустите поиск по подсети (community обычно public). Найденные принтеры появятся в списке.',
        },
        {
          title: 'Карточка',
          body: 'Модель, счётчик страниц, тонер/барабан, статус. Клик по строке — детали и история опроса.',
        },
        {
          title: 'Настройки опроса',
          body: 'Интервал и community задаются в настройках принтеров на этой же странице.',
        },
      ],
      links: [{ to: '/printers', label: 'Принтеры' }],
    },
    {
      id: 'network',
      title: 'Сеть',
      summary: 'Список устройств в LAN, опрос SNMP и карта связей.',
      steps: [
        {
          title: 'Список',
          body: 'Страница открывается списком: коммутаторы, роутеры, AP, ПК. Фильтр по роли, ручное добавление, настройки SNMP.',
        },
        {
          title: 'Опрос',
          body: '«Опросить все» обновляет SNMP-статус уже известных устройств. Новые хосты появляются после опроса или ручного добавления.',
        },
        {
          title: 'Карта',
          body: 'Переключатель «Карта» показывает связи. ПК на загруженных свичах можно свернуть.',
        },
      ],
      links: [{ to: '/network', label: 'Сеть' }],
    },
    {
      id: 'requests',
      title: 'Заявки',
      summary: 'Создание, список, шаблоны, статистика.',
      steps: [
        {
          title: 'Создать',
          body: '«Заявки → Создание»: тема, описание, ПК (по желанию), категория, приоритет, исполнитель. Сохранение — в верхней панели.',
        },
        {
          title: 'База заявок',
          body: 'Список со статусами: открыта / в работе / закрыта / отменена. Фильтры и поиск. На странице можно показать 50, 100 или все заявки — без отдельного скролла внутри таблицы.',
        },
        {
          title: 'Шаблоны',
          body: 'Готовые тексты для типовых обращений — ускоряют создание похожих заявок.',
        },
        {
          title: 'Статистика',
          body: 'Период, KPI, динамика, нагрузка исполнителей. Есть автоматические инсайты по цифрам и отчёт локальной модели по сводке периода.',
        },
        {
          title: 'Уведомления',
          body: 'Профиль в правом верхнем углу → Уведомления. Там же тема, настройки и выход.',
        },
        {
          title: 'Категории заявок',
          body: 'Дерево категорий настраивается в «Настройки → Категории заявок».',
        },
      ],
      links: [
        { to: '/requests', label: 'Создать' },
        { to: '/requests/database', label: 'База' },
        { to: '/requests/templates', label: 'Шаблоны' },
        { to: '/requests/stats', label: 'Статистика' },
        { to: '/settings/categories', label: 'Категории заявок' },
      ],
    },
    {
      id: 'shortcuts',
      title: 'Ярлыки /r и /h',
      summary: 'Короткие страницы для пользователей без полного входа в панель.',
      steps: [
        {
          title: '/r — самообслуживание',
          body: 'Классическая форма: ПК должен уже быть в CORAX. Заявка создаётся сразу, без AI. Удобно как ярлык на рабочем столе.',
        },
        {
          title: '/h — быстрый приём',
          body: 'Заявка создаётся сразу; AI в фоне ставит категорию и предлагает тему ассистенту. Форма /h должна быть включена в конфигурации сервера.',
        },
        {
          title: 'Пример ссылки',
          body: 'Агент инвентаризации после чтения имени ПК кладёт на рабочий стол ярлык «Заявка CORAX» вида http://СЕРВЕР:3000/h#pc=ИМЯ-ПК. Пользователь открывает его — компьютер уже вписан.',
        },
      ],
    },
    {
      id: 'warehouse',
      title: 'Склад',
      summary: 'Ручной учёт позиций на складе, без GLPI.',
      steps: [
        {
          title: 'Как учитывать',
          body: 'Все позиции одинаковы: одна строка и количество на полке (ОЗУ, SSD, тонер, кабели). Количество меняете в карточке позиции (+/−), «Списать» или удаление — в действиях. Код СК — внутренний складской номер, не штрихкод с коробки.',
        },
        {
          title: 'Списание и история',
          body: '«Списать» спрашивает сколько: одну штуку или всё. В истории видно приход, перемещения и списания. Удаление стирает запись — для учёта лучше списывать.',
        },
        {
          title: 'Помещения',
          body: 'Логические места хранения (кладовка, серверная). Остатки не смешиваются. Данные вы вносите сами.',
        },
      ],
      links: [{ to: '/warehouse', label: 'Склад' }],
    },
    {
      id: 'sitemap',
      title: 'Карта здания',
      summary: 'Планировки этажей и привязка объектов.',
      steps: [
        {
          title: 'Этажи',
          body: 'Загрузите схему, расставьте маркеры ПК/оборудования. Удобно для обходов и поиска «где стоит».',
        },
        {
          title: 'Привязка',
          body: 'Маркер связывается с объектом CORAX (например ПК) — клик ведёт к карточке.',
        },
      ],
      links: [{ to: '/knowledge-base/sitemap', label: 'Карта здания' }],
    },
    {
      id: 'wikirag',
      title: 'Wiki / Ассистент',
      summary: 'База знаний CORAX и чат по проиндексированным документам.',
      steps: [
        {
          title: 'Импорт CORAX',
          body: 'На странице WikiRAG нажмите «Импорт CORAX» — снимок парка сохранится как читаемые Markdown-файлы (компьютеры, железо, ПО, принтеры…).',
        },
        {
          title: 'Индексация',
          body: 'Дождитесь статуса «готово» у файлов или нажмите «Переиндексировать все». После смены модели эмбеддингов нужна полная переиндексация.',
        },
        {
          title: 'Чат',
          body: 'Страница Wiki / Ассистент — это сам чат. Ответ строится только по проиндексированным документам; источники показываются под ответом. База файлов открывается отдельной панелью знаний.',
        },
        {
          title: 'Модели',
          body: '«Настройки → ИИ агент»: chat-модель (Ollama / LM Studio). Эмбеддинги индекса — отдельно (по умолчанию bge-m3), URL задаётся в окружении сервера.',
        },
      ],
      links: [
        { to: '/knowledge-base/wikirag', label: 'WikiRAG' },
        { to: '/settings/llm', label: 'ИИ агент' },
      ],
    },
    {
      id: 'notes',
      title: 'Заметки / проекты',
      summary: 'Внутренние заметки команды.',
      steps: [
        {
          title: 'Использование',
          body: 'Фиксируйте регламенты, чек-листы миграций, договорённости — отдельно от заявок и Wiki-файлов.',
        },
      ],
      links: [{ to: '/knowledge-base/notes', label: 'Заметки' }],
    },
    {
      id: 'search',
      title: 'Глобальный поиск',
      summary: 'Строка в шапке панели.',
      steps: [
        {
          title: 'Что ищет',
          body: 'ПК (hostname, IP, серийник), принтеры, заявки по тексту. Результаты сгруппированы по типу.',
        },
      ],
    },
    {
      id: 'admin',
      title: 'Администрирование',
      summary: 'Только для админов и редакторов (частично).',
      steps: [
        {
          title: 'Профиль',
          body: 'Аватар в правом верхнем углу: смена темы, уведомления о назначениях, настройки интерфейса и выход. Блок «выйти» внизу бокового меню больше не используется.',
        },
        {
          title: 'Пользователи',
          body: 'Локальные учётки панели, роли, привязка к человеку из LDAP-справочника для заявок.',
        },
        {
          title: 'LDAP',
          body: 'Синхронизация справочника сотрудников. Не заменяет логин в панель.',
        },
        {
          title: 'Bitrix24 / GLPI',
          body: 'Импорт людей или обмен CSV — по необходимости. Проверьте webhook/лимиты до массового запуска.',
        },
        {
          title: 'База данных',
          body: 'Резервная копия перед импортами и обновлениями. В Docker бэкапы ещё и по расписанию.',
        },
        {
          title: 'HTTPS',
          body: 'Локальный CA для нескольких админ-ПК — без публичного DNS. Создайте CA, скачайте, включите TLS в prod-режиме.',
        },
      ],
      links: [
        { to: '/users', label: 'Пользователи' },
        { to: '/settings/ldap', label: 'LDAP' },
        { to: '/settings/database', label: 'БД / бэкап' },
        { to: '/settings/https', label: 'HTTPS' },
      ],
    },
  ],
}

const GUIDE_EN: GuideCopy = {
  eyebrow: 'CORAX',
  title: 'Guide',
  subtitle:
    'Where things live in the panel. Windows and Linux agents have their own sections below.',
  toc: 'Sections',
  tip: 'Tip',
  tipBody:
    'Start the server with npm run docker:up. Build the agent from the panel on the LAN IP, not 127.0.0.1.',
  searchPlaceholder: 'Search a section or step…',
  searchEmpty: 'Nothing found. Try another word.',
  openLabel: 'Open',
  sections: [
    {
      id: 'start',
      title: 'Getting started',
      summary: 'Roles, sign-in, and a typical workflow.',
      steps: [
        {
          title: 'Sign-in',
          body: 'Open the panel in a browser (usually port 3000). Login is a local CORAX account. LDAP is a people directory for tickets, not panel login.',
        },
        {
          title: 'Roles',
          body: 'Observer — view only. Editor — change data. Admin — users, LDAP, agent tokens, backups, HTTPS.',
        },
        {
          title: 'Typical day',
          body: 'Dashboard → problem PCs/tickets → PC card or ticket → network/printers/warehouse if needed.',
        },
      ],
      links: [{ to: '/', label: 'Dashboard' }],
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      summary: 'Fleet and active tickets at a glance.',
      steps: [
        {
          title: 'What to watch',
          body: 'Tiles: PC count, offline, tickets. Charts and fleet summaries below.',
        },
        {
          title: 'Click a number',
          body: 'Many tiles open the PC or ticket list with a filter already applied.',
        },
      ],
      links: [{ to: '/', label: 'Dashboard' }],
    },
    {
      id: 'risks',
      title: 'Risk center',
      summary: 'Fleet health: antivirus, disks, Windows updates.',
      steps: [
        {
          title: 'What to watch',
          body: 'Risk levels and open problems. Acknowledge/ignore applies to the problem type across the fleet, not one PC.',
        },
        {
          title: 'AI insights',
          body: 'Editors can ask the local model to comment on the calculated summary — it must not invent vulnerabilities.',
        },
      ],
      links: [{ to: '/risks', label: 'Risk center' }],
    },
    {
      id: 'computers',
      title: 'Computers',
      summary: 'Fleet list, PC card, tags, wake.',
      steps: [
        {
          title: 'List',
          body: 'Filter by tag, OS, ping. Search hostname, IP, serial. Click a row for the full card.',
        },
        {
          title: 'PC card',
          body: 'Hardware, disks, network, software, peripherals, change history, related tickets, last domain user.',
        },
        {
          title: 'PC tags',
          body: 'Create under Settings → PC tags, assign to PCs for grouping (floor, dept, criticality).',
        },
        {
          title: 'Wake-on-LAN',
          body: 'Wake button on offline PC cards when WOL is allowed and a MAC is known.',
        },
      ],
      links: [
        { to: '/computers', label: 'Computers' },
        { to: '/settings/tags', label: 'PC tags' },
        { to: '/settings/wol', label: 'Wake-on-LAN' },
      ],
    },
    {
      id: 'agent',
      title: 'Inventory agent',
      summary:
        'PCs do not appear by themselves. The agent reports them. Build only from the panel on the LAN IP. Windows: the canonical package is the PowerShell ZIP (7/10/11). EXE is not 1:1 with PowerShell yet.',
      steps: [
        {
          title: 'Why you need an agent',
          body: 'Without an agent, Computers stays empty. On each PC the agent collects hostname, serial, CPU/RAM, disks, NIC/IP/MAC, OS, installed software and peripherals, then POSTs a report. It repeats on a schedule. Git sources under agent/ are templates with no URL or token — do not run them in production.',
        },
        {
          title: 'Three packages on the panel',
          body: 'Settings → Agent build.\n• ZIP PowerShell Windows (recommended) — one archive for 7/10/11; run the root corax_send.bat. After send, a desktop shortcut opens /h#pc=HOSTNAME.\n• Native EXE — inventory is not 1:1 with PowerShell yet; not the production default.\n• ZIP Linux (bash) — see the Linux section below.',
        },
        {
          title: 'Before you build — LAN IP',
          body: 'Open the panel at http://192.168.x.x:3000, not 127.0.0.1 and not Docker 172.x. Otherwise the bundle gets an address other PCs cannot reach. Match http/https on the build page to the server HTTPS mode; port is usually 3000.',
        },
        {
          title: 'Build',
          body: 'Sign in as admin → Settings → Agent build. Check the URL, pick a package, download. Server URL and token are stamped into the file — you do not paste them by hand. Each build creates a new token. One downloaded ZIP/EXE can be rolled out to many PCs.',
        },
        {
          title: 'Tokens',
          body: 'Format: public_id.secret. The DB stores HMAC only; the full secret lives in the EXE / agent_env.bat / agent_env.sh. List and revoke: Settings → Agent tokens. Rebuilding does not revoke the old token until you revoke it. Do not publish ZIPs or commit agent_env.*. If a secret leaked — revoke the token and change the admin password.',
        },
        {
          title: 'Where not to put the agent',
          body: 'Do not run scripts from the CORAX server tree: next to docker-compose.yml, backend\\.env, run.py, or from /opt/corax/agent/…. Those copies have __INVENTORY_SERVER__ placeholders; reports go nowhere and production looks “down”.\nWindows: unpack the ZIP to %ProgramData%\\CORAX\\agent or a share \\\\fileserver\\corax\\agent.\nLinux: only /opt/corax-agent (the server stays in /opt/corax).',
        },
        {
          title: 'EXE C++ (not the default)',
          body: 'Field coverage is not yet 1:1 with the PowerShell agent. If you still need the EXE: double-click to send; Task Scheduler: CORAX-Agent.exe --silent. After switching HTTP↔HTTPS, download a fresh bundle.',
        },
        {
          title: 'ZIP Windows — contents',
          body: 'corax_send.bat — always run this (auto-picks Win7 or 10/11).\nagent_env.bat — URL and token; do not overwrite on script updates.\nagent_config.json — collection modules.\nupdate_scripts.bat — safe update.\nwin10\\ — PowerShell 5+ (Windows 10/11).\nwin7\\ — Windows 7 / old PowerShell.\nREADME_DEPLOY.txt — short cheat sheet inside the archive.',
        },
        {
          title: 'ZIP Windows — first run',
          body: 'Unpack to %ProgramData%\\CORAX\\agent (not the server tree).\ncd /d %ProgramData%\\CORAX\\agent\ncorax_send.bat\nThe window must stay open: splash animation is off (set CORAX_SPLASH=1 only if you want it).\nA “CORAX ticket” (or CORAX-ticket) shortcut appears on the desktop: http://SERVER:3000/h#pc=HOSTNAME.\nScheduler: corax_send.bat nopause\nCheck: Computers — hostname and “last report”.',
        },
        {
          title: 'ZIP Windows — schedule',
          body: 'If auto-start was enabled at build time, the ZIP includes install_schedule.bat — run once as Administrator. The task is named CORAX-Agent and always starts the root corax_send.bat (OS is detected every run). Or use register_scheduled_task.ps1 from the same archive (PowerShell 2.0+).',
        },
        {
          title: 'ZIP Windows — update without wiping the token',
          body: 'Do not extract a new ZIP over a live folder (“replace” / unzip -o). That overwrites agent_env.bat — URL and token vanish, reports stop.\nDo this:\n1. Extract the new panel ZIP to a temp folder, e.g. C:\\temp\\corax-agent-new.\n2. From the live folder:\ncd /d %ProgramData%\\CORAX\\agent\nupdate_scripts.bat C:\\temp\\corax-agent-new\nagent_env.bat stays. Or copy only win10\\, win7\\, corax_send.bat — leave agent_env.bat alone.',
        },
        {
          title: 'What it sends and how to verify',
          body: 'Hostname, serial, CPU/RAM, disks, NIC/IP/MAC, OS, software, peripherals.\nAPI: POST http://<LAN-IP>:3000/api/v1/agent/inventory\nAuthorization: Bearer <token>\nWithout a token the API rejects the report. If the PC never shows up: reachability of :3000, URL is not 127.0.0.1, agent is not from the server git tree, token is not revoked.',
        },
        {
          title: 'HTTPS',
          body: 'One port :3000 = one scheme. After enabling TLS in Settings → HTTPS, restart the container and rebuild agents with https://. An old http:// bundle will stop reporting. Agent PCs need a trusted ca.crt (GPO or scripts/install-corax-ca.bat in the repo).',
        },
        {
          title: 'Typical Windows mistakes',
          body: 'Running from the server git tree sends reports nowhere. Put the ZIP in %ProgramData%\\CORAX\\agent.\nURL 127.0.0.1 or Docker 172.x — build with the panel open on the LAN IP.\nExtracting a new ZIP over a live folder wipes the token. Use update_scripts.bat.\nCmd window vanished during the “animation” — old splash. Download a fresh ZIP (splash no longer runs).\nSwitched HTTP↔HTTPS — download a fresh bundle.',
        },
      ],
      links: [
        { to: '/settings/agent-bundle', label: 'Agent build' },
        { to: '/settings/agent-tokens', label: 'Tokens' },
        { to: '/computers', label: 'Computers' },
      ],
    },
    {
      id: 'agent-linux',
      title: 'Linux agent',
      summary:
        'Bash ZIP only in /opt/corax-agent. Do not confuse it with the server tree /opt/corax. Update scripts with update_scripts.sh — never unzip -o over a live folder.',
      steps: [
        {
          title: 'Two directories — do not mix them',
          body: '/opt/corax — the server (git, Docker). Do not run the agent from here.\n/opt/corax-agent — ZIP from the panel only. Unpack and run here.',
        },
        {
          title: 'First run',
          body: 'Panel → Agent build → ZIP Linux (bash) → download (panel opened on the LAN IP).\nOn the host:\nsudo mkdir -p /opt/corax-agent\nsudo unzip -o corax-agent-linux-*.zip -d /opt/corax-agent\ncd /opt/corax-agent\nchmod +x run_console.sh corax_send.sh inventory_agent.sh install_cron.sh update_scripts.sh\n/bin/sh ./run_console.sh\nDo not copy agent_env.sh.example without editing URL/token — the agent exits 2. Use the panel ZIP.',
        },
        {
          title: 'Files in the ZIP',
          body: 'run_console.sh — main console launcher (recommended).\ncorax_send.sh — same (alias).\ninventory_agent.sh — collection core.\nagent_env.sh — URL + token (panel-generated; do not commit).\nagent_config.json — modules.\ninstall_cron.sh — cron.\nsystemd/ — timer.\nupdate_scripts.sh — refresh scripts without touching agent_env.sh.\nREADME.txt — cheat sheet in the archive.',
        },
        {
          title: 'Schedule',
          body: 'sudo ./install_cron.sh from /opt/corax-agent.\nOr the systemd timer under systemd/ in the ZIP.',
        },
        {
          title: 'Update without wiping the token',
          body: 'unzip -o new.zip -d /opt/corax-agent overwrites agent_env.sh — URL and token vanish.\nDo this:\nsudo unzip -o corax-agent-linux-*.zip -d /tmp/corax-agent-new\nsudo /bin/sh /opt/corax-agent/update_scripts.sh /tmp/corax-agent-new\nOr: unzip -o new.zip -x agent_env.sh -d /opt/corax-agent — only if agent_env.sh already exists. First install: no -x.',
        },
        {
          title: 'Safety',
          body: 'The agent does not read or write the server backend/.env or the database. Temp files only under /tmp/corax-agent.* (marker .corax_workdir). Cleanup deletes that temp only — never /opt, .env, or volumes. Launch from the server tree is blocked unless CORAX_AGENT_ALLOW_IN_SOURCE=1 (not recommended in production).',
        },
        {
          title: 'Typical Linux mistakes',
          body: 'Launch from /opt/corax/agent/linux is wrong. Put the ZIP in /opt/corax-agent.\nunzip -o over a live agent wipes the token — use update_scripts.sh.\nURL 127.0.0.1 never reaches other hosts. Build on the LAN IP.',
        },
      ],
      links: [
        { to: '/settings/agent-bundle', label: 'Agent build' },
        { to: '/computers', label: 'Computers' },
      ],
    },
    {
      id: 'software',
      title: 'Software catalog',
      summary: 'Fleet-wide software and hardware slices.',
      steps: [
        {
          title: 'Why',
          body: 'See how many PCs have an app, OS/RAM distribution, manufacturers.',
        },
        {
          title: 'How',
          body: 'Pick a slice (software, devices, OS…) and drill into host lists when needed.',
        },
      ],
      links: [{ to: '/software', label: 'Software' }],
    },
    {
      id: 'printers',
      title: 'Printers',
      summary: 'SNMP discovery and supply polling.',
      steps: [
        {
          title: 'Scan',
          body: 'Run subnet discovery (community often public). Found printers show up in the list.',
        },
        {
          title: 'Card',
          body: 'Model, page counter, toner/drum, status. Click a row for details.',
        },
        {
          title: 'Poll settings',
          body: 'Interval and community are on the Printers page.',
        },
      ],
      links: [{ to: '/printers', label: 'Printers' }],
    },
    {
      id: 'network',
      title: 'Network',
      summary: 'LAN device list, SNMP polling, and a topology map.',
      steps: [
        {
          title: 'List',
          body: 'The page opens as a list: switches, routers, APs, PCs. Filter by role, add devices manually, configure SNMP.',
        },
        {
          title: 'Poll',
          body: '“Poll all” refreshes SNMP status of known devices. New hosts appear after a poll or a manual add.',
        },
        {
          title: 'Map',
          body: 'The Map toggle shows links. PCs on busy switches can collapse.',
        },
      ],
      links: [{ to: '/network', label: 'Network' }],
    },
    {
      id: 'requests',
      title: 'Tickets',
      summary: 'Create, list, templates, stats.',
      steps: [
        {
          title: 'Create',
          body: 'Tickets → New: title, description, PC, category, priority, assignee. Save from the top bar.',
        },
        {
          title: 'Ticket list',
          body: 'Statuses: open / in progress / done / cancelled. Filters and search. The list can show 50, 100, or all tickets — no nested table scrollbar.',
        },
        {
          title: 'Templates',
          body: 'Reusable texts for common requests.',
        },
        {
          title: 'Stats',
          body: 'Period, KPIs, trend, assignee load. Automatic insights from the numbers plus a local-model report for the selected period.',
        },
        {
          title: 'Notifications',
          body: 'Profile in the top-right → Notifications. Theme, settings, and logout live there too.',
        },
        {
          title: 'Ticket categories',
          body: 'Category tree under Settings → Ticket categories.',
        },
      ],
      links: [
        { to: '/requests', label: 'New' },
        { to: '/requests/database', label: 'List' },
        { to: '/requests/templates', label: 'Templates' },
        { to: '/requests/stats', label: 'Stats' },
        { to: '/settings/categories', label: 'Ticket categories' },
      ],
    },
    {
      id: 'shortcuts',
      title: 'Shortcuts /r and /h',
      summary: 'Short pages for end users without full panel login.',
      steps: [
        {
          title: '/r — self-service',
          body: 'Classic form: PC must already exist in CORAX. Ticket is created immediately, no AI.',
        },
        {
          title: '/h — quick intake',
          body: 'Ticket is created immediately; AI later sets category and suggests a title. The /h form must be enabled in server configuration.',
        },
        {
          title: 'Link example',
          body: 'After the inventory agent reads the PC name it drops a “CORAX ticket” shortcut on the desktop: http://SERVER:3000/h#pc=PC-NAME. Opening it already identifies the computer.',
        },
      ],
    },
    {
      id: 'warehouse',
      title: 'Warehouse',
      summary: 'Manual warehouse items — not GLPI.',
      steps: [
        {
          title: 'How to track',
          body: 'Every item is the same: one row and a shelf quantity (RAM, SSD, toner, cables). Change quantity in the item card (+/−); write off or delete from the row actions. SK is an internal warehouse number, not the box barcode.',
        },
        {
          title: 'Write-off and history',
          body: '“Write off” asks how many: one piece or all. History shows receipts, moves, and write-offs. Deleting erases the record — prefer write-off to keep the audit trail.',
        },
        {
          title: 'Rooms',
          body: 'Storage locations (closet, server room) keep stock separated. You enter the data yourself.',
        },
      ],
      links: [{ to: '/warehouse', label: 'Warehouse' }],
    },
    {
      id: 'sitemap',
      title: 'Building map',
      summary: 'Floor plans and object placement.',
      steps: [
        {
          title: 'Floors',
          body: 'Upload a plan and place markers for PCs/equipment.',
        },
        {
          title: 'Binding',
          body: 'Markers link to CORAX objects — click opens the card.',
        },
      ],
      links: [{ to: '/knowledge-base/sitemap', label: 'Building map' }],
    },
    {
      id: 'wikirag',
      title: 'Wiki / Assistant',
      summary: 'CORAX knowledge base and chat over indexed documents.',
      steps: [
        {
          title: 'Import CORAX',
          body: 'On the WikiRAG page click “Import CORAX” — the fleet snapshot is saved as readable Markdown (computers, hardware, software, printers…).',
        },
        {
          title: 'Indexing',
          body: 'Wait until files show “ready”, or click “Reindex all”. After changing the embedding model, run a full reindex.',
        },
        {
          title: 'Chat',
          body: 'Wiki / Assistant is the chat itself. Answers use indexed documents only; sources appear under the reply. The file library opens as a knowledge drawer.',
        },
        {
          title: 'Models',
          body: 'Settings → AI agent: chat model (Ollama / LM Studio). Index embeddings are separate (default bge-m3); URL is set in server env.',
        },
      ],
      links: [
        { to: '/knowledge-base/wikirag', label: 'WikiRAG' },
        { to: '/settings/llm', label: 'AI agent' },
      ],
    },
    {
      id: 'notes',
      title: 'Notes / projects',
      summary: 'Internal team notes.',
      steps: [
        {
          title: 'Use',
          body: 'Checklists and agreements — separate from tickets and Wiki files.',
        },
      ],
      links: [{ to: '/knowledge-base/notes', label: 'Notes' }],
    },
    {
      id: 'search',
      title: 'Global search',
      summary: 'Search box in the top bar.',
      steps: [
        {
          title: 'Scope',
          body: 'PCs (hostname, IP, serial), printers, ticket text — grouped by type.',
        },
      ],
    },
    {
      id: 'admin',
      title: 'Administration',
      summary: 'Admins (and some editor settings).',
      steps: [
        {
          title: 'Profile',
          body: 'Avatar in the top-right: theme, assignment notifications, interface settings, and logout. The old sidebar logout block is gone.',
        },
        {
          title: 'Users',
          body: 'Local panel accounts, roles, link to LDAP directory person for tickets.',
        },
        {
          title: 'LDAP',
          body: 'Sync people directory. Does not replace panel login.',
        },
        {
          title: 'Bitrix24 / GLPI',
          body: 'Optional people import / CSV exchange — check limits before bulk runs.',
        },
        {
          title: 'Database',
          body: 'Backup before imports and upgrades. Docker also schedules backups.',
        },
        {
          title: 'HTTPS',
          body: 'Local CA for a few admin PCs — no public DNS required.',
        },
      ],
      links: [
        { to: '/users', label: 'Users' },
        { to: '/settings/ldap', label: 'LDAP' },
        { to: '/settings/database', label: 'DB / backup' },
        { to: '/settings/https', label: 'HTTPS' },
      ],
    },
  ],
}

export function guideCopy(locale: 'ru' | 'en'): GuideCopy {
  return locale === 'en' ? GUIDE_EN : GUIDE_RU
}
