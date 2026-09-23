# Telegram Chat

React-приложение для отправки и получения текстовых сообщений в Telegram через GREEN-API.

## Требования

- npm;
- авторизованный Telegram-инстанс GREEN-API.

## Установка

```bash
git clone https://github.com/Chugunovvvv/green-api-test.git
cd green-api-test
npm ci
```

Переменные окружения не требуются. `ID Instance` и `API Token Instance`
вводятся в форме авторизации и хранятся только в памяти открытой вкладки.

## Настройка инстанса

Перед запуском проверьте настройки GREEN-API:

- состояние инстанса — `authorized`;
- `incomingWebhook` — `yes`;
- `webhookUrl` — пустая строка;

## Локальный запуск

```bash
npm run dev
```

Откройте адрес `http://localhost:5173`.

## Использование

1. Введите `ID Instance` и `API Token Instance` из личного кабинета https://console.green-api.com.
2. Создайте чат по международному номеру телефона или публичному имени
   пользователя в формате `@username`.
3. После создания первого чата приложение запустит получение уведомлений.
4. Отправьте сообщение и дождитесь ответа.

В интерфейсе отображаются входящие сообщения только из чатов, созданных
пользователем. GREEN-API использует общую очередь уведомлений инстанса,
поэтому события других чатов могут быть получены и подтверждены приложением,
но они не добавляются в интерфейс.

## Архитектура

- `api/httpClient.ts` — настройка Axios и единая обработка HTTP-ошибок;
- `api/greenApiError.ts` — ошибка GREEN-API и извлечение сообщения из ответа;
- `api/greenApiClient.ts` — методы GREEN-API;
- `api/mapIncomingMessage.ts` — преобразование уведомления в сообщение чата;
- `services/NotificationPollingService.ts` — последовательный long polling, отмена запросов и backoff;
- `store/chatStore.ts` — Zustand-store с состоянием сессии, чатов и действиями;
- `components/` — небольшие компоненты интерфейса с отдельными CSS Modules.

Polling запускается после создания первого чата и держит только один запрос
`ReceiveNotification`. После обработки уведомление подтверждается через
`DeleteNotification`. При сетевой ошибке используется экспоненциальная
задержка до следующей попытки.

## Проверка

```bash
npm run lint
npm run build
```

Для локальной проверки production-сборки:

```bash
npm run preview
```
