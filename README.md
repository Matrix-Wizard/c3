# Калькулятор

Браузерный калькулятор с журналом операций и переключением темы.

## Локальный запуск

```bash
npm install
npm run preview
```

Откройте адрес, который выведет `serve` (обычно http://localhost:3000).

## Тесты

```bash
npm test
```

## Деплой на Vercel

Проект настроен как статический сайт:

- `index.html` — главная страница
- `npm run build` — копирует файлы в `public/`
- `vercel.json` — указывает Vercel каталог `public/` как результат сборки

После push в GitHub Vercel автоматически пересоберёт проект. Главная страница будет доступна по корневому URL (`/`).

Если в настройках проекта на Vercel что-то меняли вручную, проверьте:

- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `public`
