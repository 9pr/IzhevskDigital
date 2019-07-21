<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>NextLevel</title>
    <meta name="theme-color" content="#e7e7e7"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="shortcut icon" type="image/png" href="/assets/icons/icon-72x72.png">
    <link rel="manifest" href="/manifest.json">
  </head>
  <body>
    <p>NextLevel</p>
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Registration success. Scope is ', reg.scope))
        .catch(err => console.log('Registration failed. ', err));
      }

      // if ('geolocation' in navigator) {
      //   navigator.geolocation.getCurrentPosition(  position => {
      //     console.log(position);
      //   });
      // }




    </script>
  </body>
</html>