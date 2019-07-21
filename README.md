nextlevel
=========

Технологии
----------

- Приложение использует технологию PWA (Progressive web application)
- Для установки на устройство необходимо использовать браузер Google Chrome (как на мобильном устройстве, так и на десктопе)
- Внизу экрана должна появился кнопка установки



Нужно добавить код в шаблон
```
    <meta name="theme-color" content="#e7e7e7"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="shortcut icon" type="image/png" href="/assets/icons/icon-72x72.png">
    <link rel="manifest" href="/manifest.json">
```

```
<script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Registration success. Scope is ', reg.scope))
        .catch(err => console.log('Registration failed. ', err));
      }
</script>
```

