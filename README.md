# Telegram Chat

React-приложение для отправки и получения текстовых сообщений в Telegram через GREEN-API.

## Запуск

```bash
npm install
npm run dev
```

Для входа нужны только `idInstance` и `apiTokenInstance`. Базовый адрес API задаётся внутри клиента. При необходимости его можно переопределить переменной `VITE_GREEN_API_BASE_URL`.

Новый чат можно создать по номеру телефона в международном формате или по публичному имени пользователя Telegram в формате `@username`.

## Настройка инстанса

- инстанс должен иметь статус `authorized`;
- настройка `incomingWebhook` должна иметь значение `yes`;
- поле `webhookUrl` должно быть пустым.

## Архитектура

- `api/httpClient.ts` — настройка Axios и единая обработка HTTP-ошибок;
- `api/greenApiError.ts` — ошибка GREEN-API и извлечение сообщения из ответа;
- `api/greenApiClient.ts` — методы GREEN-API;
- `api/mapIncomingMessage.ts` — преобразование уведомления в сообщение чата;
- `services/NotificationPollingService.ts` — последовательный long polling, отмена запросов и backoff;
- `model/chatStore.ts` — Zustand-store с состоянием сессии, чатов и действиями;
- `components/` — небольшие компоненты интерфейса с отдельными CSS Modules.

Polling-сервис держит только один запрос `ReceiveNotification`. После обработки уведомление подтверждается через `DeleteNotification`. При сетевой ошибке используется экспоненциальная задержка до следующей попытки.

## Проверка

```bash
npm run build
npm run lint
```
