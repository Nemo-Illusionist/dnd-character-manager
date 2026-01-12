# Firebase Setup Guide

Автоматизированная настройка Firebase проекта для D&D Character Manager.

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск setup скрипта

```bash
npm run setup
```

Скрипт предложит:
1. **Setup staging** - настроить staging окружение
2. **Setup production** - настроить production окружение
3. **Deploy Firestore rules** - загрузить только правила
4. **Start emulators** - запустить локальные эмуляторы

## Что делает setup автоматически

✅ **Проверяет Firebase CLI** - установлен ли и залогинен
✅ **Деплоит Firestore Rules** - загружает правила безопасности
✅ **Деплоит Firestore Indexes** - загружает индексы
✅ **Показывает ссылки** - на ручные шаги в Console

## Что нужно сделать вручную

К сожалению, Firebase CLI не может автоматизировать некоторые вещи:

### 1. Создать Firebase проект (один раз)

https://console.firebase.google.com

- Нажмите **"Add project"**
- Введите название проекта
- Следуйте инструкциям

### 2. Включить Authentication (один раз)

https://console.firebase.google.com/project/YOUR_PROJECT/authentication

- Нажмите **"Get started"**
- Перейдите на **"Sign-in method"**
- Включите **"Email/Password"**

### 3. Создать Firestore Database (один раз)

https://console.firebase.google.com/project/YOUR_PROJECT/firestore

- Нажмите **"Create database"**
- Выберите **"Production mode"**
- Выберите регион (например `europe-west1`)

### 4. Добавить веб-приложение (один раз)

https://console.firebase.google.com/project/YOUR_PROJECT/settings/general

- В секции **"Your apps"** нажмите на иконку `</>`
- Зарегистрируйте приложение
- Скопируйте конфигурацию в `.env` файл

## Структура окружений

```
┌─────────────┬──────────────────┬────────────────────┐
│ Окружение   │ Назначение       │ Конфиг             │
├─────────────┼──────────────────┼────────────────────┤
│ local       │ Разработка       │ .env.local         │
│             │ (эмуляторы)      │ demo-test проект   │
├─────────────┼──────────────────┼────────────────────┤
│ staging     │ Тестирование     │ .env.staging       │
│             │ (реальный Firebase)│ ваш staging проект │
├─────────────┼──────────────────┼────────────────────┤
│ production  │ Продакшн         │ .env.production    │
│             │ (реальный Firebase)│ ваш prod проект    │
└─────────────┴──────────────────┴────────────────────┘
```

## Команды

### Setup

```bash
# Интерактивная настройка
npm run setup

# Только загрузить правила Firestore
npm run setup:rules
```

### Разработка

```bash
# Локальная разработка с эмуляторами
npm run emulators    # Терминал 1
npm run dev          # Терминал 2
```

### Деплой

```bash
# Staging
npm run deploy:staging

# Production
npm run deploy:production

# Только правила Firestore
npm run setup:rules
```

## Частые проблемы

### "Failed to list Firebase projects"

**Причина:** Токены авторизации истекли
**Решение:**
```bash
firebase logout
firebase login
```

### "Firestore rules failed to deploy"

**Причина:** Firestore Database не создан
**Решение:** Создайте базу данных в Firebase Console (см. шаг 3 выше)

### "auth/configuration-not-found"

**Причина:** Authentication не включен
**Решение:** Включите Email/Password в Firebase Console (см. шаг 2 выше)

### "Permission denied" при создании документов

**Причина:** Firestore rules не загружены
**Решение:**
```bash
npm run setup:rules
```

## Проверка настройки

После setup проверьте:

1. ✅ **Authentication**: Можете зарегистрироваться
2. ✅ **Firestore users**: Документ пользователя создается
3. ✅ **Firestore games**: Персональная игра создается
4. ✅ **Hosting**: Сайт доступен по URL

## Дополнительно

### Просмотр логов

```bash
# Логи Functions
firebase functions:log

# Логи в реальном времени
firebase functions:log --only functionName
```

### Откат Firestore Rules

```bash
# Список версий
firebase firestore:rules:list

# Откат к предыдущей версии
firebase firestore:rules:release <RELEASE_ID>
```

### Экспорт/Импорт данных

```bash
# Экспорт из эмулятора
firebase emulators:export ./emulator-data

# Импорт в эмулятор
firebase emulators:start --import=./emulator-data
```

## Поддержка

Если что-то не работает:
1. Проверьте что все ручные шаги выполнены
2. Запустите `npm run setup` снова
3. Посмотрите логи в браузере (DevTools → Console)
4. Проверьте Firebase Console на наличие ошибок
