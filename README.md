# CI/CD Sandbox — Monorepo (Vite + NestJS + GitHub Actions)

Учебный монорепозиторий для изучения и практической отработки **CI/CD (Continuous Integration / Continuous Delivery)** с использованием **GitHub Actions**.

В проекте рассматривается настройка автоматических проверок для двух независимых приложений:

- **Client** — фронтенд на Vite + React + TypeScript.
- **Server** — бэкенд на NestJS + TypeScript + Jest.

Основная задача проекта — научиться самостоятельно создавать CI-пайплайны, управлять условиями их запуска, устанавливать зависимости, выполнять тесты, проверять сборку и постепенно расширять автоматизацию разработки.

> На текущем этапе реализован CI (непрерывная интеграция). CD (непрерывная доставка или развёртывание) можно добавить позднее.

---

# 1. Структура проекта

```text
ci-project/
│
├── .github/
│   └── workflows/
│       ├── client-ci.yml       # CI для фронтенда
│       └── server-ci.yml       # CI для бэкенда
│
├── client/                     # Vite + React + TypeScript
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── server/                     # NestJS + TypeScript
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── package-lock.json
│
└── README.md                   # Документация проекта
```

## 1.1. Что такое Monorepo?

**Monorepo (Monolithic Repository)** — подход к организации разработки, при котором несколько самостоятельных приложений или пакетов находятся в одном Git-репозитории.

В данном проекте:

- `client/` содержит фронтенд.
- `server/` содержит бэкенд.
- `.github/workflows/` содержит конфигурации автоматизации.
- Каждый проект имеет собственный `package.json` и `package-lock.json`.

Это означает, что у фронтенда и бэкенда независимые зависимости, команды запуска, тесты и сборка.

При этом они используют общую Git-историю.

---

# 2. Что такое CI/CD?

## 2.1. CI — Continuous Integration

**Непрерывная интеграция** — практика регулярного добавления изменений в общий репозиторий с последующей автоматической проверкой кода.

Например, разработчик отправляет изменения:

```bash
git add .
git commit -m "feat: add authentication"
git push
```

После отправки GitHub автоматически запускает настроенные проверки:

1. Получает исходный код репозитория.
2. Устанавливает необходимую версию Node.js.
3. Устанавливает зависимости.
4. Запускает линтер.
5. Выполняет автоматические тесты.
6. Проверяет возможность сборки проекта.

Если все проверки проходят, CI завершается успешно.

Если хотя бы одна обязательная проверка завершается ошибкой, весь соответствующий workflow получает статус Failed.

**Зачем нужен CI?**

- Раньше обнаруживать ошибки.
- Не допускать попадания неработающего кода в основную ветку.
- Автоматизировать рутинные проверки.
- Поддерживать стабильность проекта.
- Проверять изменения до их объединения с основной веткой.

## 2.2. CD — Continuous Delivery / Continuous Deployment

CD — следующий этап автоматизации после CI.

Существует два распространённых подхода:

**Continuous Delivery (непрерывная доставка)**

После успешного CI приложение автоматически подготавливается к выпуску: создаётся артефакт сборки, Docker-образ или пакет. Развёртывание в production обычно запускается вручную или по отдельному разрешению.

**Continuous Deployment (непрерывное развёртывание)**

После успешного прохождения всех проверок изменения автоматически развёртываются в production.

Пример общего процесса:

```text
Разработчик
    |
    v
git push
    |
    v
GitHub Actions
    |
    v
CI: Lint + Tests + Build
    |
    v
Успешная проверка
    |
    v
CD: Deploy
    |
    v
Production Server
```

В этом проекте пока изучается CI. Развёртывание будет отдельным следующим этапом.

---

# 3. Что такое GitHub Actions?

**GitHub Actions** — встроенная в GitHub платформа автоматизации процессов разработки.

С её помощью можно автоматически:

- Проверять код.
- Запускать тесты.
- Собирать приложения.
- Создавать Docker-образы.
- Публиковать пакеты.
- Развёртывать приложения на серверах.
- Запускать различные сценарии по событиям репозитория.

Автоматизация настраивается с помощью YAML-файлов.

Основное расположение конфигураций:

```text
.github/workflows/
```

GitHub автоматически обнаруживает YAML-файлы в этой директории и рассматривает каждый из них как отдельный workflow.

## 3.1. Основные понятия

| Понятие  | Значение                                       |
| -------- | ---------------------------------------------- |
| Workflow | Полный сценарий автоматизации                  |
| Event    | Событие, запускающее workflow                  |
| Job      | Отдельная задача внутри workflow               |
| Step     | Отдельный шаг внутри job                       |
| Runner   | Виртуальная машина, выполняющая workflow       |
| Action   | Готовый переиспользуемый компонент             |
| Artifact | Файл или результат выполнения workflow         |
| Secret   | Защищённое значение, например токен или пароль |

Иерархия:

```text
Repository
    |
    v
Workflow
    |
    v
Event (push / pull_request)
    |
    v
Jobs
    |
    v
Runner
    |
    v
Steps
    |
    +-- uses: action
    |
    +-- run: command
```

Важно различать:

- Workflow — весь сценарий.
- Job — отдельная задача, которая выполняется на runner.
- Step — последовательная операция внутри job.

---

# 4. Как устроен YAML-файл GitHub Actions?

Рассмотрим основные элементы конфигурации.

```yaml
name: Server CI

on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main

permissions:
  contents: read

jobs:
  test:
    name: Test and Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: server/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: server

      - name: Run tests
        run: npm test
        working-directory: server

      - name: Build application
        run: npm run build
        working-directory: server
```

Разберём каждую часть.

## 4.1. name

```yaml
name: Server CI
```

Название workflow.

Отображается во вкладке GitHub Actions.

Можно назвать как угодно:

```yaml
name: Client CI
name: Backend Tests
name: Full Project CI
```

## 4.2. on

```yaml
on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main
```

Определяет события, при которых запускается workflow.

Основные события:

| Событие           | Когда срабатывает                        |
| ----------------- | ---------------------------------------- |
| push              | При отправке коммитов в репозиторий      |
| pull_request      | При создании или обновлении Pull Request |
| workflow_dispatch | При ручном запуске                       |
| schedule          | По расписанию                            |
| release           | При создании релиза                      |

### Фильтрация по веткам

```yaml
on:
  push:
    branches:
      - main
      - develop
```

Workflow запускается при push в `main` или `develop`.

Можно использовать шаблоны:

```yaml
branches:
  - main
  - 'release/**'
```

### Фильтрация по путям

```yaml
on:
  push:
    paths:
      - 'server/**'
      - '.github/workflows/server-ci.yml'
```

Workflow запускается только при изменениях:

- В директории `server/`.
- В самом файле конфигурации `server-ci.yml`.

Другие полезные варианты:

```yaml
paths:
  - 'client/**'
  - 'server/**'
  - '**.json'
```

Исключение путей:

```yaml
paths-ignore:
  - '**.md'
  - 'docs/**'
```

Важно:

- `paths` задаёт список путей, изменения которых запускают workflow.
- `paths-ignore` исключает определённые пути.
- `paths` и `paths-ignore` нельзя использовать одновременно в одном событии.
- При использовании `branches` и `paths` оба условия должны выполняться.
- Для `pull_request` фильтрация веток относится к целевой ветке PR (base branch).

## 4.3. permissions

```yaml
permissions:
  contents: read
```

Определяет права доступа для `GITHUB_TOKEN`.

`GITHUB_TOKEN` — автоматически предоставляемый GitHub токен, который используется workflow для взаимодействия с репозиторием и API GitHub.

Основные разрешения:

| Разрешение           | Возможность                       |
| -------------------- | --------------------------------- |
| contents: read       | Чтение содержимого репозитория    |
| contents: write      | Изменение содержимого репозитория |
| pull-requests: read  | Чтение Pull Request               |
| pull-requests: write | Изменение Pull Request            |
| packages: write      | Публикация пакетов                |

Для обычного CI достаточно:

```yaml
permissions:
  contents: read
```

Правило безопасности: выдавать workflow только те права, которые действительно необходимы.

## 4.4. jobs

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
```

`jobs` — список задач, выполняемых внутри workflow.

Каждая задача имеет собственный идентификатор:

```yaml
jobs:
  lint:
    ...

  test:
    ...

  build:
    ...
```

По умолчанию независимые jobs выполняются параллельно на отдельных runner.

Если нужно установить порядок выполнения, используется `needs`:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Run tests"

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build application"
```

В данном примере `build` начнёт выполнение только после успешного завершения `test`.

Если `test` завершится ошибкой, `build` по умолчанию будет пропущен.

## 4.5. runs-on

```yaml
runs-on: ubuntu-latest
```

Определяет операционную систему runner.

Популярные варианты:

```yaml
runs-on: ubuntu-latest
runs-on: windows-latest
runs-on: macos-latest
```

GitHub предоставляет виртуальную машину, на которой выполняются шаги workflow.

Важно: каждая отдельная job получает собственный runner. Файловая система между разными jobs автоматически не общая.

## 4.6. defaults.run.working-directory

Позволяет задать рабочую директорию для всех команд `run` внутри job.

Например:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: server

    steps:
      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

Теперь все команды `run` выполняются относительно директории `server/`.

Это удобно для монорепозиториев.

Важно: `working-directory` применяется к `run`, но не задаёт автоматически рабочую директорию для всех сторонних actions.

## 4.7. steps

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@v4

  - name: Install dependencies
    run: npm ci
```

`steps` — последовательность действий внутри job.

Каждый шаг выполняется после предыдущего.

Если обязательный шаг завершается ошибкой, следующие шаги по умолчанию пропускаются.

У шага могут быть следующие свойства:

| Свойство          | Назначение                  |
| ----------------- | --------------------------- |
| name              | Название шага               |
| uses              | Подключение готового action |
| run               | Выполнение команды          |
| with              | Передача параметров action  |
| env               | Переменные окружения        |
| working-directory | Рабочая директория          |
| if                | Условие выполнения шага     |
| id                | Идентификатор шага          |

---

# 5. Actions и Run — в чём разница?

Это два основных способа описания шагов.

## 5.1. run

`run` выполняет команду в терминале виртуальной машины.

Примеры:

```yaml
- name: Install dependencies
  run: npm ci

- name: Run tests
  run: npm test

- name: Build
  run: npm run build
```

Можно выполнять несколько команд в одном шаге:

```yaml
- name: Install and build
  run: |
    npm ci
    npm run build
```

Символ `|` позволяет записывать многострочную команду.

## 5.2. uses

`uses` подключает готовый GitHub Action.

Формат:

```yaml
uses: owner/repository@version
```

Примеры:

**1. Checkout**

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

Клонирует исходный код репозитория в рабочую директорию runner.

Без этого шага runner не получит файлы проекта автоматически.

**2. Setup Node.js**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22
```

Устанавливает и настраивает Node.js указанной версии.

**3. Кэширование npm**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm
    cache-dependency-path: server/package-lock.json
```

Настраивает кэш npm.

`cache-dependency-path` указывает расположение lock-файла, по которому определяется ключ кэша.

Важно: кэшируется npm download cache, а не сама директория `node_modules`.

При повторном запуске зависимости могут устанавливаться быстрее благодаря использованию ранее загруженных пакетов.

---

# 6. Установка зависимостей: npm install и npm ci

В CI рекомендуется использовать:

```bash
npm ci
```

Вместо:

```bash
npm install
```

Основные различия:

| npm install                        | npm ci                        |
| ---------------------------------- | ----------------------------- |
| Устанавливает зависимости          | Устанавливает зависимости     |
| Может обновить package-lock.json   | Не изменяет package-lock.json |
| Может изменить дерево зависимостей | Использует lock-файл          |
| Подходит для обычной разработки    | Подходит для CI               |

`npm ci`:

1. Проверяет наличие `package-lock.json`.
2. Удаляет существующий `node_modules`.
3. Устанавливает зависимости согласно lock-файлу.
4. Завершает выполнение ошибкой, если `package.json` и `package-lock.json` несовместимы.

Почему это важно?

CI должен проверять воспроизводимое состояние проекта, а не устанавливать произвольные новые версии зависимостей.

---

# 7. Как устроен CI в этом репозитории?

В проекте используются два независимых workflow:

| Workflow  | Файл                              | Проверяемые пути | Проверки       |
| --------- | --------------------------------- | ---------------- | -------------- |
| Server CI | `.github/workflows/server-ci.yml` | `server/**`      | Jest + Build   |
| Client CI | `.github/workflows/client-ci.yml` | `client/**`      | ESLint + Build |

Оба workflow запускаются при:

- `push` в `main`.
- `pull_request`, направленном в `main`.

Дополнительно используются фильтры `paths`.

Принцип работы:

```text
                  GitHub Repository
                         |
                         v
                    Git Changes
                         |
             +-----------+-----------+
             |                       |
             v                       v
        server/**               client/**
             |                       |
             v                       v
         Server CI               Client CI
             |                       |
             v                       v
          npm ci                   npm ci
             |                       |
             v                       v
         npm test                npm run lint
             |                       |
             v                       v
         npm build               npm run build
             |                       |
             v                       v
          Result                   Result
```

Примеры:

| Изменения            | Server CI     | Client CI     |
| -------------------- | ------------- | ------------- |
| Только `server/`     | Запустится    | Не запустится |
| Только `client/`     | Не запустится | Запустится    |
| Обе директории       | Запустится    | Запустится    |
| Только `README.md`   | Не запустится | Не запустится |
| Файл `server-ci.yml` | Запустится    | Не запустится |
| Файл `client-ci.yml` | Не запустится | Запустится    |

Если один коммит затрагивает обе директории, GitHub запускает оба workflow независимо.

**Важный нюанс:** при использовании path-фильтров GitHub может пропускать запуск workflow целиком. Если такой workflow является обязательной проверкой для защиты ветки, это может привести к ожидающему статусу проверки. Для обязательных проверок нужно продумать отдельную схему статусов, например общий workflow с условными jobs.

---

# 8. Примеры реальных CI-файлов проекта

## 8.1. Server CI

Файл:

`.github/workflows/server-ci.yml`

```yaml
name: Server CI

on:
  push:
    branches:
      - main
    paths:
      - 'server/**'
      - '.github/workflows/server-ci.yml'

  pull_request:
    branches:
      - main
    paths:
      - 'server/**'
      - '.github/workflows/server-ci.yml'

permissions:
  contents: read

jobs:
  test:
    name: Test and Build
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: server

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: server/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build
```

Что происходит:

1. Проверяется изменение файлов `server/` или конфигурации Server CI.
2. GitHub создаёт Ubuntu runner.
3. Checkout получает код репозитория.
4. Setup Node устанавливает Node.js.
5. `npm ci` устанавливает зависимости.
6. `npm test` запускает Jest.
7. `npm run build` проверяет сборку NestJS.

Если тесты не пройдут, сборка по умолчанию не запустится.

## 8.2. Client CI

Файл:

`.github/workflows/client-ci.yml`

```yaml
name: Client CI

on:
  push:
    branches:
      - main
    paths:
      - 'client/**'
      - '.github/workflows/client-ci.yml'

  pull_request:
    branches:
      - main
    paths:
      - 'client/**'
      - '.github/workflows/client-ci.yml'

permissions:
  contents: read

jobs:
  lint-and-build:
    name: Lint and Build
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: client

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: client/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Build application
        run: npm run build
```

Что происходит:

1. Проверяется изменение файлов `client/` или конфигурации Client CI.
2. GitHub создаёт Ubuntu runner.
3. Checkout получает код.
4. Setup Node устанавливает Node.js.
5. `npm ci` устанавливает зависимости.
6. `npm run lint` запускает ESLint.
7. `npm run build` собирает Vite-приложение.

Если ESLint обнаружит ошибку, сборка по умолчанию не запустится.

---

# 9. Дополнительные возможности GitHub Actions

После освоения базовой структуры можно постепенно изучать дополнительные инструменты.

## 9.1. Переменные окружения — env

Позволяют передавать значения в команды и приложения.

На уровне workflow:

```yaml
env:
  NODE_ENV: test

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Show environment
        run: echo $NODE_ENV
```

На уровне job:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

    env:
      NODE_ENV: test
```

На уровне отдельного шага:

```yaml
- name: Run tests
  run: npm test
  env:
    NODE_ENV: test
```

Чем ниже уровень объявления, тем уже область действия переменной.

## 9.2. Secrets

`Secrets` — защищённые значения, которые нельзя хранить непосредственно в YAML или исходном коде.

Например:

- API-токены.
- Пароли.
- SSH-ключи.
- Данные для подключения к серверу.
- Токены внешних сервисов.

Создание:

1. Открыть репозиторий на GitHub.
2. Перейти в Settings.
3. Открыть Secrets and variables.
4. Выбрать Actions.
5. Создать New repository secret.

Использование:

```yaml
- name: Deploy application
  run: npm run deploy
  env:
    API_TOKEN: ${{ secrets.API_TOKEN }}
```

Обращение к секретам выполняется через контекст `secrets`.

Не выводить секреты через `echo` и не передавать их в публичные логи.

## 9.3. if — условное выполнение

Позволяет выполнять шаг только при определённом условии.

```yaml
- name: Run only on main
  if: github.ref == 'refs/heads/main'
  run: echo "Main branch"
```

Можно использовать контексты GitHub:

```yaml
github.ref
github.event_name
github.repository
github.actor
```

Пример:

```yaml
- name: Show event
  run: echo "${{ github.event_name }}"
```

## 9.4. timeout-minutes

Ограничивает максимальное время выполнения job.

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
```

Если job не завершится за установленное время, GitHub остановит её.

## 9.5. continue-on-error

Позволяет продолжить выполнение после ошибки определённого шага.

```yaml
- name: Optional check
  run: npm run optional-check
  continue-on-error: true
```

Использовать осторожно: этот параметр может скрыть проблему, которую CI должен обнаруживать.

## 9.6. concurrency

Позволяет управлять параллельными запусками workflow.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Если для одной ветки уже выполняется предыдущий запуск, GitHub может отменить его при появлении нового.

Полезно, когда разработчик быстро отправляет несколько коммитов подряд.

---

# 10. Artifacts и Caching

Это два разных механизма, которые важно не путать.

## 10.1. Cache

Кэш используется для ускорения повторных запусков.

Например, `actions/setup-node` с `cache: npm` сохраняет кэш загруженных npm-пакетов.

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm
    cache-dependency-path: server/package-lock.json
```

При изменении lock-файла ключ кэша меняется, поэтому GitHub может создать новый кэш.

Кэш не заменяет `npm ci`: установку зависимостей всё равно необходимо выполнять.

## 10.2. Artifacts

Artifacts используются для сохранения и передачи результатов выполнения workflow.

Например, можно сохранить собранный фронтенд.

```yaml
- name: Upload build
  uses: actions/upload-artifact@v4
  with:
    name: client-build
    path: client/dist/
```

Скачать сохранённый результат можно через:

```yaml
- name: Download build
  uses: actions/download-artifact@v4
  with:
    name: client-build
    path: ./build
```

Разница:

| Cache                                 | Artifact                                 |
| ------------------------------------- | ---------------------------------------- |
| Ускоряет повторные сборки             | Сохраняет результаты выполнения          |
| Используется повторно                 | Можно скачать результат                  |
| Например, npm cache                   | Например, папка dist                     |
| Не предназначен для публикации сборки | Может использоваться для передачи сборки |

---

# 11. Branch Protection — защита ветки

Сам по себе CI не запрещает разработчику отправлять изменения через `git push`.

Но можно настроить защиту основной ветки, чтобы GitHub не разрешал объединять Pull Request, если обязательные проверки не пройдены.

Настройка:

1. Открыть Settings репозитория.
2. Перейти в Rules → Rulesets (или Branches, в зависимости от интерфейса).
3. Создать правило для ветки `main`.
4. Включить требование успешного прохождения проверок.
5. Выбрать необходимые status checks.
6. Сохранить правило.

После этого:

```text
Pull Request
     |
     v
  CI запускается
     |
     +------------------+
     |                  |
     v                  v
  Success              Failed
     |                  |
     v                  v
  Merge разрешён     Merge заблокирован
```

Важно: нужно выбирать реальные status checks, которые публикуют соответствующие workflow.

---

# 12. Типичные ошибки при написании CI

## 12.1. Не найден package.json

Ошибка:

```text
npm error enoent
Could not read package.json
```

Причина: команда выполняется не в той директории.

Решение:

```yaml
defaults:
  run:
    working-directory: server
```

Или указать директорию непосредственно:

```yaml
- name: Install dependencies
  run: npm ci
  working-directory: server
```

## 12.2. npm ci завершился ошибкой

Возможные причины:

- Отсутствует `package-lock.json`.
- `package.json` и `package-lock.json` не синхронизированы.
- Зависимости требуют другой версии Node.js.
- Ошибка при установке нативного пакета.

Решение: локально выполнить:

```bash
npm install
```

Проверить изменения lock-файла и отправить актуальный `package-lock.json`.

После этого снова запустить CI.

## 12.3. Workflow не запускается

Проверить:

- Правильно ли указано название ветки.
- Соответствует ли изменённый файл фильтру `paths`.
- Находится ли YAML в `.github/workflows/`.
- Нет ли ошибок YAML.
- Соответствует ли событие условиям `on`.

## 12.4. Ошибка YAML

Основные причины:

- Неправильные отступы.
- Использование Tab вместо пробелов.
- Неправильное расположение свойств.
- Отсутствие двоеточия.
- Неправильно закрытые кавычки.

Рекомендация: использовать два пробела на каждый уровень вложенности.

## 12.5. Build работает локально, но падает в CI

Возможные причины:

- Различаются версии Node.js.
- Различается операционная система.
- В локальном окружении остались файлы, отсутствующие в Git.
- Зависимости установлены не из актуального lock-файла.
- Присутствуют ошибки регистра букв в путях к файлам.

Особенно важно учитывать, что GitHub Actions на `ubuntu-latest` использует Linux, где регистр букв в именах файлов имеет значение.

Например:

```typescript
import { UserService } from './userService';
```

И файл:

```text
User.service.ts
```

На некоторых локальных системах такая ошибка может остаться незамеченной, но в Linux сборка завершится ошибкой.

---

# 13. Локальный запуск CI-проверок

Перед отправкой изменений желательно запускать те же команды, которые выполняются в GitHub Actions.

## Server (NestJS)

```bash
cd server

npm ci

npm test

npm run build
```

## Client (Vite)

```bash
cd client

npm ci

npm run lint

npm run build
```

Логика простая: если локально проверки завершаются успешно, вероятность успешного CI выше.

Однако локальный успех не гарантирует успех на GitHub: окружения могут различаться.

---

# 14. Git: полезные команды для работы с CI

```bash
# Проверить текущую ветку
git branch

# Посмотреть изменённые файлы
git status

# Посмотреть изменения
git diff

# Добавить файлы
git add .

# Создать коммит
git commit -m "ci: configure server workflow"

# Отправить изменения
git push origin main
```

Создание отдельной ветки:

```bash
git checkout -b feature/add-ci
```

Отправка ветки:

```bash
git push -u origin feature/add-ci
```

После этого можно создать Pull Request в `main` и проверить, как CI работает при `pull_request`.

---

# 15. Особенности монорепозитория

При создании отдельных приложений через CLI:

```bash
nest new server
```

или:

```bash
npm create vite@latest client
```

Внутри проекта может появиться собственная директория `.git`.

Если нужен единый монорепозиторий, следует использовать только один Git-репозиторий в корне.

Проверить наличие вложенных `.git`:

```bash
find . -name ".git" -type d
```

Если вложенный репозиторий не нужен, удалить его служебную директорию после проверки её содержимого:

```bash
rm -rf server/.git
rm -rf client/.git
```

Важно: удаление `.git` уничтожает локальную Git-историю соответствующего вложенного репозитория. Перед выполнением команды убедиться, что она действительно не нужна.

---

# 16. Как написать CI с нуля: алгоритм

Это основной раздел, к которому стоит возвращаться при создании нового workflow.

Не нужно сразу копировать готовый YAML. Сначала определить, что именно должен делать CI.

## Шаг 1. Определить приложение

Например:

```text
server/
```

Или:

```text
client/
```

## Шаг 2. Определить события запуска

Например:

```yaml
on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main
```

Вопрос: когда именно должны запускаться проверки?

## Шаг 3. Определить фильтрацию путей

Например:

```yaml
paths:
  - 'server/**'
  - '.github/workflows/server-ci.yml'
```

Вопрос: какие изменения должны запускать workflow?

## Шаг 4. Определить права доступа

Для обычного CI:

```yaml
permissions:
  contents: read
```

Вопрос: нужны ли workflow дополнительные права?

## Шаг 5. Определить окружение

Например:

```yaml
runs-on: ubuntu-latest
```

И версию Node.js:

```yaml
node-version: 22
```

Вопрос: на какой системе и версии среды должен работать проект?

## Шаг 6. Получить исходный код

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

## Шаг 7. Настроить окружение

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm
    cache-dependency-path: server/package-lock.json
```

## Шаг 8. Установить зависимости

```yaml
- name: Install dependencies
  run: npm ci
```

## Шаг 9. Запустить проверки

Для фронтенда:

```yaml
- name: Run lint
  run: npm run lint
```

Для бэкенда:

```yaml
- name: Run tests
  run: npm test
```

## Шаг 10. Проверить сборку

```yaml
- name: Build
  run: npm run build
```

## Шаг 11. Проверить результат

После отправки изменений открыть:

```text
GitHub Repository → Actions
```

Проверить:

- Запустился ли нужный workflow.
- Выполнились ли все шаги.
- Нет ли ошибок.
- Не запускаются ли лишние workflow.

---

# 17. Полезные ресурсы

Официальная документация:

- GitHub Actions: [https://docs.github.com/en/actions](https://docs.github.com/en/actions)
- Workflow syntax: [https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- Events: [https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- Expressions: [https://docs.github.com/en/actions/reference/workflows-and-actions/expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions)
- Contexts: [https://docs.github.com/en/actions/reference/workflows-and-actions/contexts](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts)
- Encrypted secrets: [https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
- actions/checkout: [https://github.com/actions/checkout](https://github.com/actions/checkout)
- actions/setup-node: [https://github.com/actions/setup-node](https://github.com/actions/setup-node)

---

# 18. Главное, что нужно запомнить

При написании CI практически всегда нужно ответить на следующие вопросы:

1. **Когда запускать?** — `on`.
2. **Какие изменения отслеживать?** — `paths`, `branches`.
3. **Какие права нужны?** — `permissions`.
4. **На какой системе запускать?** — `runs-on`.
5. **Как получить исходный код?** — `actions/checkout`.
6. **Как настроить окружение?** — `actions/setup-node`.
7. **Где выполнять команды?** — `working-directory`.
8. **Как установить зависимости?** — `npm ci`.
9. **Какие проверки выполнять?** — `npm test`, `npm run lint`.
10. **Как проверить приложение?** — `npm run build`.

Общая структура почти любого базового Node.js CI:

```text
Workflow
  |
  +-- name
  |
  +-- on
  |
  +-- permissions
  |
  +-- jobs
        |
        +-- runs-on
        |
        +-- defaults
        |
        +-- steps
              |
              +-- checkout
              |
              +-- setup environment
              |
              +-- install dependencies
              |
              +-- lint / test
              |
              +-- build
```

**Главная идея:** CI — это не набор случайных команд в YAML. Это последовательность автоматических проверок, описывающая, в каком окружении, при каких событиях и каким образом проект должен проверяться перед интеграцией изменений в основную ветку.
