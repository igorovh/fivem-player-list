# fivem-player-list

Simple website that displays all players connected to a selected server.
Available here: [https://igorovh.github.io/fivem-player-list/](https://igorovh.github.io/fivem-player-list/)

It uses the FiveM endpoint, which is also used in their UI:

```
https://servers-frontend.fivem.net/api/servers/single/serverId
```

# How to get Server ID?
### Server Browser
Visit the [FiveM Server Browser](https://servers.fivem.net/) and click on your chosen server.  
Then look at the URL and copy the last fragment, which is the **Server ID**. Example:  
`https://servers.fivem.net/servers/detail/vp4rxq` -> **vp4rxq**
### Client
Find the server in the FiveM client and click on it.  
On the right side you will see a "join URL", where the last fragment is the **Server ID**. Example:
`cfx.re/join/vp4rxq` -> **vp4rxq**  
  
![image](https://github.com/igorovh/fivem-player-list/assets/37638480/cc4427f2-9fb0-4a9a-822b-db3344845b21)

---

## Latest commit

- Removed all usage of `innerHTML` in JS code in favor of dynamic DOM element creation for better security.
- Improved notification handling (see `js/notifications.js`).
- Refactored dark/light theme management (see `js/theme.js`).
- Refactored favorites display and management (see `js/favorites.js` and `js/fetch.js`).
- Use of utility constants for URLs and themes (see `js/utils/constants.js`).

## JS files concerned

- **js/theme.js**: dark/light mode management without `innerHTML`.
- **js/notifications.js**: notification system without `innerHTML`.
- **js/favorites.js**: player/server favorites management, dynamic display.
- **js/fetch.js**: player list display, DOM management without `innerHTML`.
- **js/utils/constants.js**: centralization of constants (API, themes, storage keys, etc.).

## Feature lookup

- **Utilities**: see `js/utils/constants.js` for all shared constants.
- **Notifications**: see `js/notifications.js` for the custom notification API.
- **Dark/Light mode**: see `js/theme.js` for theme initialization and toggling.
- **Favorites**: see `js/favorites.js` for player/server favorites management and display.

---
