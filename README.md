homebridge-switch-wifi-iot
==========================

Плагин позволяющий подключить к homebridge выключатели работающие под управляем wifi-iot. Для возможности управлять 
выключателями необходимо собирать прошивку с поддержкой расширений: `GET JSON` и `GPIO`.

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
    "pulse": false,
    "pulseTime": "500",
    "controlUrl": "http://<ip-address-switch>/gpio",
    "statusUrl": "http://<ip-address-switch>/readjson",
    "login": <login>,
    "password": <password>
}
```

Описание параметров конфига:

login - логин для доступа к сенсору. Необязательный параметр, необходимо указывать если включена опция Full Security

password - пароль для доступа к сенсору. Необязательный параметр, необходимо указывать если включена опция Full Security
