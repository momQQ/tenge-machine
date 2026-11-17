# Тиімді сәт: цены и когда покупать (Алматы)

Разделы: Главная, Телефоны, Машины (Toyota), Квартиры (BI Group, BAZIS-A), Валюта (USD, EUR, RUB, CNY, GBP), Каталог, Мои.

## Что где лежит

| Файл | Зачем |
|---|---|
| `index.html`, `app.js` | Сайт. Открывается двойным кликом |
| `data/data.js`, `data/prices.csv` | Цены телефонов (создает collect.py) |
| `data/fx.js`, `data/fx_nbk.csv` | Курсы валют (создает fx.py) |
| `data/apts.js`, `data/cars.js` | Квартиры и машины (обновляются вручную) |
| `collector/products.json` | Список моделей и ссылок магазинов (Sulpak, iSpace и др.) |
| `.github/workflows/daily.yml` | Ежедневный автозапуск на GitHub |

## Как обновить цены телефонов после загрузки

GitHub -> вкладка Actions -> Daily -> Run workflow. После зеленой галочки сайт покажет цены на все модели из Sulpak.

