<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<title>Document</title>

	<meta http-equiv="X-UA-Compatible" content="IE=Edge">
  <meta name="SKYPE_TOOLBAR" content="SKYPE_TOOLBAR_PARSER_COMPATIBLE">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">

  <link href="img/favicon.ico" type="image/x-icon" rel="icon">
  <link href="img/favicon.ico" type="image/x-icon" rel="shortcut icon">

	<link rel="stylesheet" href="css/style.css">

	<!--[if IE]><script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv-printshiv.min.js"></script><![endif]-->
  <!--[if lte IE 9]><script src="https://phpbbex.com/oldies/oldies.js" charset="utf-8"></script><![endif]-->

  <!--[if lt IE 9]><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script><![endif]-->
  <!--[if gte IE 9]><!-->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
  <!--<![endif]-->

  <!--[if IE 9]><script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-migrate/1.2.1/jquery-migrate.min.js"></script><![endif]-->

</head>
<body>

	{% block blocks %}

	<div class="page-wrapper">
		{% include 'map/block.php' %}
		{% include 'user-panel/block.php' %}
	</div>

	{% endblock %}


	<script src="https://api-maps.yandex.ru/2.1/?lang=ru-RU&amp;apikey=9fe11bfd-68d4-4a3c-98d4-af9b5971fa60" type="text/javascript"></script>
	<script src="js/script.js"></script>

</body>
</html>