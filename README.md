homebridge-switch-wifi-iot
==========================

Плагин позволяющий подключить к homebridge выключатели работающие под управляем wifi-iot. Для возможности управлять 
выключателями необходимо собирать прошивку с поддержкой расширения GET JSON.

## Установка

```
npm install -g git+https://github.com/aleksey925/homebridge-switch-wifi-iot.git
```

## Конфигурирование

Пример настроек, которые необходимо добавить в конфиг homebridge:

```json
{
    "accessory": "WiFiIoTSwitch",
    "name": "Гараж один",
    "gpio": 13,
    "controlUrl": "",
    "statusUrl": "http://<ip-address-sensor>/readjson",
    "pulse": false,
    "login": <login>,
    "password": <password>
}
```

Описание параметров конфига:

login - логин для доступа к сенсору. Необязательный параметр, необходимо указывать если включена опция Full Security

password - пароль для доступа к сенсору. Необязательный параметр, необходимо указывать если включена опция Full Security
